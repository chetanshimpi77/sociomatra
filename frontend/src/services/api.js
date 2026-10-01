// -----------------------------------------------------------------------
// This file is the ONLY place that talks to the backend. Every page calls
// functions from here - never fetch() directly.
//
// SESSIONS: students and admins are two completely independent identities.
// Each is stored under its OWN localStorage key (sm_student_session /
// sm_admin_session) so signing into one never overwrites or interferes
// with the other - you can be signed in as both at once, in the same
// browser, without either "winning". This is what fixes the bug where
// refreshing one login page could show the other role's state: previously
// both roles shared a single "sm_session" key, so whichever role logged in
// most recently silently overwrote the other's session everywhere.
// -----------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function sessionKey(role) {
  return role === 'ADMIN' ? 'sm_admin_session' : 'sm_student_session'
}

function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

function isTokenValid(token) {
  if (!token) return false
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return false
  // exp is in seconds since epoch; Date.now() is in ms.
  return payload.exp * 1000 > Date.now()
}

function readSession(role) {
  try {
    const raw = localStorage.getItem(sessionKey(role))
    if (!raw) return null
    const session = JSON.parse(raw)
    if (!isTokenValid(session?.token)) {
      // Stale/expired token - never treat this as a valid login.
      localStorage.removeItem(sessionKey(role))
      return null
    }
    return session
  } catch {
    return null
  }
}

function writeSession(role, session) {
  localStorage.setItem(sessionKey(role), JSON.stringify(session))
}

function clearSession(role) {
  localStorage.removeItem(sessionKey(role))
}

async function request(path, { method = 'GET', body, authRole = null } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const session = authRole ? readSession(authRole) : null
  if (authRole && session?.token) headers.Authorization = `Bearer ${session.token}`

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Cannot reach the server. Please make sure the backend is running and try again.')
  }

  // An authenticated call that comes back unauthorized means the token is
  // dead (expired/revoked) even though it looked valid locally - clear it
  // so the UI doesn't keep pretending the person is still signed in.
  if (authRole && (res.status === 401 || res.status === 403)) {
    clearSession(authRole)
    window.dispatchEvent(new CustomEvent('sm:session-expired', { detail: { role: authRole } }))
    throw new Error('Your session has expired. Please sign in again.')
  }

  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status}). Please try again.`
    throw new Error(message)
  }

  return data
}

// ---------- AUTH ----------------------------------------------------------

export async function registerStudent({ name, email, phone, password }) {
  const data = await request('/auth/student/register', { method: 'POST', body: { name, email, phone, password } })
  const session = { id: data.id, name: data.name, email: data.email, role: data.role, token: data.token }
  writeSession('STUDENT', session)
  return session
}

export async function loginStudent({ email, password }) {
  const data = await request('/auth/student/login', { method: 'POST', body: { email, password } })
  const session = { id: data.id, name: data.name, email: data.email, role: data.role, token: data.token }
  writeSession('STUDENT', session)
  return session
}

export async function loginWithGoogle(idToken) {
  const data = await request('/auth/student/google', { method: 'POST', body: { idToken } })
  const session = { id: data.id, name: data.name, email: data.email, role: data.role, token: data.token }
  writeSession('STUDENT', session)
  return session
}

export async function loginAdmin({ email, password }) {
  const data = await request('/auth/admin/login', { method: 'POST', body: { email, password } })
  const session = { id: data.id, name: data.name, email: data.email, role: data.role, token: data.token }
  writeSession('ADMIN', session)
  return session
}

export function getSession(role) {
  return readSession(role)
}

export function logout(role) {
  clearSession(role)
}

export async function changePassword(currentPassword, newPassword) {
  return request('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword }, authRole: 'ADMIN' })
}

export async function forgotPassword(email) {
  return request('/auth/forgot-password', { method: 'POST', body: { email } })
}

export async function resetPassword(token, newPassword) {
  return request('/auth/reset-password', { method: 'POST', body: { token, newPassword } })
}

// ---------- ENQUIRIES -------------------------------------------------------

// Unpaginated - used only for the dashboard's summary stat cards.
export async function getEnquiries() {
  return request('/enquiries', { authRole: 'ADMIN' })
}

// Paginated + searchable + filterable - used by the Student Enquiries table.
// Returns { content, page, size, totalElements, totalPages }.
export async function searchEnquiries({ status, q, page = 0, size = 10 } = {}) {
  const params = new URLSearchParams()
  if (status && status !== 'All') params.set('status', status)
  if (q) params.set('q', q)
  params.set('page', page)
  params.set('size', size)
  return request(`/enquiries/search?${params.toString()}`, { authRole: 'ADMIN' })
}

export async function createEnquiry({ name, phone, email, course, message, source }) {
  return request('/enquiries', { method: 'POST', body: { name, phone, email, course, message, source } })
}

export async function updateEnquiryStatus(id, status) {
  return request(`/enquiries/${id}`, { method: 'PATCH', body: { status }, authRole: 'ADMIN' })
}

// ---------- POSTS / BLOG ----------------------------------------------------

export async function getPosts() {
  return request('/posts')
}

// Admin view - includes unpublished/draft posts too.
export async function getAllPostsForAdmin() {
  return request('/posts?all=true', { authRole: 'ADMIN' })
}

export async function getPost(id) {
  return request(`/posts/${id}`)
}

export async function createPost({ title, content, excerpt, tag, imageUrl, published }) {
  return request('/posts', { method: 'POST', body: { title, content, excerpt, tag, imageUrl, published }, authRole: 'ADMIN' })
}

export async function updatePost(id, payload) {
  return request(`/posts/${id}`, { method: 'PUT', body: payload, authRole: 'ADMIN' })
}

export async function deletePost(id) {
  return request(`/posts/${id}`, { method: 'DELETE', authRole: 'ADMIN' })
}

// ---------- COURSES ----------------------------------------------------------

export async function getCourses() {
  return request('/courses')
}

export async function getCourse(id) {
  return request(`/courses/${id}`)
}

export async function getCourseCurriculum(id) {
  return request(`/courses/${id}/curriculum`)
}

export async function createCourse(payload) {
  return request('/courses', { method: 'POST', body: payload, authRole: 'ADMIN' })
}

export async function updateCourse(id, payload) {
  return request(`/courses/${id}`, { method: 'PUT', body: payload, authRole: 'ADMIN' })
}

export async function deleteCourse(id) {
  return request(`/courses/${id}`, { method: 'DELETE', authRole: 'ADMIN' })
}

export async function downloadCourseCurriculumPdf(id) {
  const res = await fetch(`${BASE_URL}/courses/${id}/curriculum/pdf`)
  if (!res.ok) {
    throw new Error('Could not generate the curriculum PDF. Please try again.')
  }
  const blob = await res.blob()
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${id}-curriculum.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

// ---------- FACULTY ----------------------------------------------------------

export async function getFaculty() {
  return request('/faculty')
}

export async function getFacultyMember(id) {
  return request(`/faculty/${id}`)
}

export async function createFaculty(payload) {
  return request('/faculty', { method: 'POST', body: payload, authRole: 'ADMIN' })
}

export async function updateFaculty(id, payload) {
  return request(`/faculty/${id}`, { method: 'PUT', body: payload, authRole: 'ADMIN' })
}

export async function deleteFaculty(id) {
  return request(`/faculty/${id}`, { method: 'DELETE', authRole: 'ADMIN' })
}

// ---------- FILE UPLOADS ------------------------------------------------------

// Used for faculty photos and blog post images. Returns { url }.
export async function uploadFile(file) {
  const session = readSession('ADMIN')
  const headers = {}
  if (session?.token) headers.Authorization = `Bearer ${session.token}`

  const formData = new FormData()
  formData.append('file', file)

  let res
  try {
    res = await fetch(`${BASE_URL}/uploads`, { method: 'POST', headers, body: formData })
  } catch {
    throw new Error('Cannot reach the server. Please make sure the backend is running and try again.')
  }

  if (res.status === 401 || res.status === 403) {
    clearSession('ADMIN')
    window.dispatchEvent(new CustomEvent('sm:session-expired', { detail: { role: 'ADMIN' } }))
    throw new Error('Your session has expired. Please sign in again.')
  }

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw new Error(data?.message || 'Upload failed. Please try again.')
  }
  return data
}

// ---------- SETTINGS ----------------------------------------------------------

export async function getSettings() {
  return request('/settings')
}

export async function updateSettings(settings) {
  const payload = {
    academyName: settings.academyName,
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    facebookUrl: settings.social?.facebook,
    youtubeUrl: settings.social?.youtube,
    instagramUrl: settings.social?.instagram,
    telegramUrl: settings.social?.telegram,
    linkedinUrl: settings.social?.linkedin,
    seoTitle: settings.website?.seoTitle,
    seoDescription: settings.website?.seoDescription,
    heroHeadline: settings.website?.heroHeadline,
    heroSubheadline: settings.website?.heroSubheadline,
  }
  return request('/settings', { method: 'PUT', body: payload, authRole: 'ADMIN' })
}

export { BASE_URL }
