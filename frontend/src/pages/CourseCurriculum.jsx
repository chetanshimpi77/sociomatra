import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { IconCheck, IconChevronDown, IconDownload, IconGraduationCap, IconLayers, IconUsers } from '../components/icons.jsx'
import { getCourses, getCourseCurriculum, downloadCourseCurriculumPdf } from '../services/api.js'

const TABS = ['Prelims', 'Mains', 'Subject-wise Details', 'Weekly Plan']

function SubjectAccordion({ title, count, hours, items }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="overflow-hidden rounded-xl border border-navy-100">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 bg-white px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-green-100 text-green-700">
            <IconGraduationCap className="h-5 w-5" />
          </span>
          <span className="font-bold text-navy-900">{title}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-navy-400">
          <span>Total Chapters: {count}</span>
          <span>|</span>
          <span>Total Hours: {hours}</span>
          <IconChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <ol className="divide-y divide-navy-50 border-t border-navy-100">
          {items.map((item, idx) => (
            <li key={item.id ?? item} className="flex items-center justify-between px-5 py-3 text-sm text-navy-700">
              <span className="flex items-center gap-3">
                <span className="text-navy-400">{idx + 1}.</span> {item.name ?? item}
              </span>
              <span className="text-navy-300">+</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export default function CourseCurriculum() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [curriculum, setCurriculum] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [tab, setTab] = useState('Prelims')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    getCourses().then(setCourses)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    setCurriculum(null)

    getCourseCurriculum(courseId)
      .then((data) => {
        if (cancelled) return
        setCurriculum(data)
        if (data.prelims) setTab('Prelims')
        else if (data.mains) setTab('Mains')
      })
      .catch(() => {
        if (!cancelled) setNotFound(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [courseId])

  const course = courses.find((c) => c.id === courseId)

  async function handleDownloadPdf() {
    setDownloading(true)
    try {
      await downloadCourseCurriculumPdf(courseId)
    } catch (err) {
      window.alert(err.message)
    } finally {
      setDownloading(false)
    }
  }

  if (notFound) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold text-navy-900">Course not found</h1>
        <Link to="/courses" className="btn-primary mt-6 inline-flex">Back to Courses</Link>
      </div>
    )
  }

  return (
    <div>
      <PageHero eyebrow="Curriculum" title={course?.name || 'Loading...'} crumb="Curriculum" subtitle={course?.tagline} />

      <section className="container-page grid gap-8 py-12 lg:grid-cols-[280px_1fr] sm:py-16">
        {/* Sidebar course list */}
        <aside className="space-y-4">
          <div className="card">
            <h3 className="font-bold text-navy-900">Courses</h3>
            <div className="mt-3 space-y-1.5">
              {courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/curriculum/${c.id}`)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    c.id === courseId ? 'bg-navy-800 text-white' : 'text-navy-700 hover:bg-navy-50'
                  }`}
                >
                  <IconGraduationCap className="h-4 w-4 shrink-0" />
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div className="card bg-navy-50">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gold-100 text-gold-700">
                <IconUsers className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-navy-900">Not sure which course is right for you?</p>
                <p className="mt-1 text-xs text-navy-500">Talk to our counsellor for personalised advice.</p>
              </div>
            </div>
            <Link to="/contact" className="btn-primary mt-4 w-full">Get Guidance</Link>
          </div>
        </aside>

        {/* Main content */}
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="section-eyebrow">Course Curriculum</span>
              <h2 className="mt-3 text-2xl font-extrabold text-navy-900">{course?.name}</h2>
              <p className="mt-2 max-w-2xl text-sm text-navy-500">{course?.description}</p>
            </div>
            <button onClick={handleDownloadPdf} disabled={downloading} className="btn-dark shrink-0 disabled:opacity-60">
              <IconDownload className="h-4 w-4" /> {downloading ? 'Preparing PDF...' : 'Download Curriculum (PDF)'}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ['Duration', course?.duration],
              ['Mode', course?.mode],
              ['Total Subjects', course?.subjects],
              ['Learning Support', 'Study Material + Test Series'],
            ].map(([label, value]) => (
              <div key={label} className="card py-4 text-center">
                <p className="text-xs text-navy-400">{label}</p>
                <p className="mt-1 text-sm font-bold text-navy-900">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-1 overflow-x-auto border-b border-navy-100">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  tab === t ? 'border-gold-500 text-navy-900' : 'border-transparent text-navy-400 hover:text-navy-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_260px]">
            <div className="space-y-4">
              {loading && <div className="card text-sm text-navy-400">Loading curriculum...</div>}

              {!loading && tab === 'Prelims' && curriculum?.prelims && (
                <SubjectAccordion
                  title="General Studies (Prelims)"
                  count={curriculum.prelims.totalChapters}
                  hours={curriculum.prelims.totalHours}
                  items={curriculum.prelims.subjects}
                />
              )}
              {!loading && tab === 'Prelims' && curriculum?.csat && (
                <div className="card flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-purple-100 text-purple-700">
                      <IconLayers className="h-5 w-5" />
                    </span>
                    <span className="font-bold text-navy-900">CSAT (Prelims)</span>
                  </div>
                  <span className="text-xs text-navy-400">
                    Total Chapters: {curriculum.csat.totalChapters} | Total Hours: {curriculum.csat.totalHours}
                  </span>
                </div>
              )}
              {!loading && tab === 'Mains' && curriculum?.mains && (
                <SubjectAccordion
                  title="Mains"
                  count={curriculum.mains.totalChapters}
                  hours={curriculum.mains.totalHours}
                  items={curriculum.mains.subjects}
                />
              )}
              {!loading && tab === 'Subject-wise Details' && (
                <div className="card text-sm text-navy-500">
                  Detailed, topic-by-topic breakdown with reading lists is shared with enrolled students inside
                  the student portal after enrollment.
                </div>
              )}
              {!loading && tab === 'Weekly Plan' && (
                <div className="card text-sm text-navy-500">
                  A week-by-week study plan (classroom hours, self-study targets and test slots) is provided at
                  the start of each month based on your batch timing.
                </div>
              )}
              {!loading && tab === 'Mains' && !curriculum?.mains && (
                <div className="card text-sm text-navy-500">Mains curriculum will be shared closer to batch start.</div>
              )}
              {!loading && tab === 'Prelims' && !curriculum?.prelims && (
                <div className="card text-sm text-navy-500">This course does not include a separate Prelims track.</div>
              )}
            </div>

            <div className="card h-fit">
              <h3 className="font-bold text-navy-900">Key Features</h3>
              <ul className="mt-4 space-y-3 text-sm text-navy-700">
                {curriculum?.keyFeatures?.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/enroll" className="btn-primary mt-6 w-full">
                Enroll in this Course
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
