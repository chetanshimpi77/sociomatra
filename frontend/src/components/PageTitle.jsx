import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_NAME = 'SocioMantra IAS Academy'

const EXACT_TITLES = {
  '/': `${SITE_NAME} | Learn. Think. Succeed.`,
  '/about': `About Us | ${SITE_NAME}`,
  '/courses': `Courses | ${SITE_NAME}`,
  '/faculty': `Faculty | ${SITE_NAME}`,
  '/blog': `Blog | ${SITE_NAME}`,
  '/contact': `Contact Us | ${SITE_NAME}`,
  '/enroll': `Enroll Now | ${SITE_NAME}`,
  '/login': `Student Sign In | ${SITE_NAME}`,
  '/signup': `Create Student Account | ${SITE_NAME}`,
  '/admin/login': `Admin Sign In | ${SITE_NAME}`,
  '/forgot-password': `Forgot Password | ${SITE_NAME}`,
  '/reset-password': `Reset Password | ${SITE_NAME}`,
  '/admin/dashboard': `Dashboard | Admin | ${SITE_NAME}`,
  '/admin/enquiries': `Student Enquiries | Admin | ${SITE_NAME}`,
  '/admin/posts': `Posts & Content | Admin | ${SITE_NAME}`,
  '/admin/courses': `Manage Courses | Admin | ${SITE_NAME}`,
  '/admin/faculty': `Faculty | Admin | ${SITE_NAME}`,
  '/admin/settings': `Settings | Admin | ${SITE_NAME}`,
}

const PREFIX_TITLES = [
  ['/curriculum/', `Curriculum | ${SITE_NAME}`],
  ['/faculty/', `Faculty Profile | ${SITE_NAME}`],
  ['/blog/', `Blog | ${SITE_NAME}`],
]

// Renders nothing - just keeps document.title in sync with the route so
// browser tabs/history/bookmarks show something meaningful instead of the
// same static title everywhere (good for SEO and usability alike).
export default function PageTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (EXACT_TITLES[pathname]) {
      document.title = EXACT_TITLES[pathname]
      return
    }
    const match = PREFIX_TITLES.find(([prefix]) => pathname.startsWith(prefix))
    document.title = match ? match[1] : SITE_NAME
  }, [pathname])

  return null
}
