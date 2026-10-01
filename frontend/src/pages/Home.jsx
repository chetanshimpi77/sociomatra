import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IconGraduationCap,
  IconBook,
  IconUsers,
  IconTrendingUp,
  IconLayers,
  IconArrowRight,
  IconCheck,
} from '../components/icons.jsx'
import { getCourses, getPosts, getSettings } from '../services/api.js'
import bgImage from '../assets/bgImage.png'

const stats = [
  { label: 'Enrolled Students', value: '5000+' },
  { label: 'Success Rate', value: '95%' },
  { label: 'Years of Excellence', value: '10+' },
]

const whyUs = [
  { icon: IconGraduationCap, title: 'Experienced Faculty', desc: 'Learn from subject experts with years of experience in UPSC coaching.' },
  { icon: IconBook, title: 'Well-Structured Courses', desc: 'Comprehensive study plans for Prelims, Mains & Interview.' },
  { icon: IconUsers, title: 'Personalized Guidance', desc: 'Mentorship and doubt-clearing sessions for every aspirant.' },
  { icon: IconTrendingUp, title: 'Proven Results', desc: 'A track record of successful candidates in every batch.' },
  { icon: IconLayers, title: 'Modern Learning Environment', desc: 'Access to updated study material, test series and digital resources.' },
]

export default function Home() {
  const [courses, setCourses] = useState([])
  const [posts, setPosts] = useState([])
  const [hero, setHero] = useState({
    headline: 'Your Dream. Our Mission.',
    subheadline:
      'Crack UPSC with the right guidance, strategy & support - from a faculty that has walked this path with thousands of successful civil servants.',
  })

  useEffect(() => {
    getCourses().then((c) => setCourses(c.slice(0, 4)))
    getPosts().then((p) => setPosts(p.slice(0, 3)))
    getSettings().then((s) => {
      if (s.website?.heroHeadline) {
        setHero({
          headline: s.website.heroHeadline,
          subheadline: s.website.heroSubheadline || hero.subheadline,
        })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      {/* HERO */}
      {/* HERO */}
      <section
        className="relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundPosition: 'center right',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/35" />

        <div className="container-page relative z-10 grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-28">

          {/* LEFT CONTENT */}
          <div>
            <p className="mb-3 text-sm font-semibold tracking-wide text-gold-400">
              Learn &middot; Think &middot; Succeed
            </p>

            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              {(() => {
                const parts = hero.headline.split('. ')

                if (parts.length === 2) {
                  return (
                    <>
                      {parts[0]}.{' '}
                      <span className="text-gold-400">
                        {parts[1]}
                      </span>
                    </>
                  )
                }

                return hero.headline
              })()}
            </h1>

            <p className="mt-5 max-w-xl text-lg text-white">
              {hero.subheadline}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/courses" className="btn-primary">
                Explore Courses
                <IconArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/enroll"
                className="btn-secondary border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                Enroll Now
              </Link>
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-2xl font-extrabold text-white sm:text-3xl">
                    {s.value}
                  </dt>

                  <dd className="mt-1 text-xs text-white/80">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

        </div>
      </section>

      {/* POPULAR COURSES */}
      <section className="container-page py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="section-eyebrow">Our Popular Courses</span>
            <h2 className="mt-3 text-3xl font-extrabold text-navy-900">Find the right course for your goal</h2>
          </div>
          <Link to="/courses" className="btn-secondary shrink-0">
            View All Courses
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c) => (
            <div key={c.id} className="card flex flex-col">
              <span className="section-eyebrow w-fit">{c.tagline}</span>
              <h3 className="mt-4 text-base font-bold text-navy-900">{c.name}</h3>
              <p className="mt-2 flex-1 text-sm text-navy-500">{c.description}</p>
              <Link
                to={`/curriculum/${c.id}`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-600 hover:text-gold-700"
              >
                Know More <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="bg-navy-50 py-16 sm:py-20">
        <div className="container-page">
          <div className="text-center">
            <span className="section-eyebrow">Why SocioMantra</span>
            <h2 className="mt-3 text-3xl font-extrabold text-navy-900">Why Choose SocioMantra IAS Academy?</h2>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {whyUs.map((w) => (
              <div key={w.title} className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-navy-100 text-navy-700">
                  <w.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-navy-900">{w.title}</h3>
                <p className="mt-2 text-sm text-navy-500">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST FROM BLOG */}
      <section className="container-page py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="section-eyebrow">Blog &amp; News</span>
            <h2 className="mt-3 text-3xl font-extrabold text-navy-900">Latest updates &amp; insights</h2>
          </div>
          <Link to="/blog" className="btn-secondary shrink-0">
            View All Posts
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link to={`/blog/${p.id}`} key={p.id} className="card group flex flex-col">
              <span className="section-eyebrow w-fit">{p.tag}</span>
              <h3 className="mt-4 text-base font-bold text-navy-900 group-hover:text-gold-600">{p.title}</h3>
              <p className="mt-2 flex-1 text-sm text-navy-500">{p.excerpt}</p>
              <p className="mt-4 text-xs text-navy-400">
                By {p.author} &middot; {new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-16 sm:pb-20">
        <div className="rounded-2xl bg-navy-900 px-8 py-14 text-center sm:px-16">
          <h2 className="text-3xl font-extrabold text-white">Not sure which course is right for you?</h2>
          <p className="mx-auto mt-3 max-w-xl text-navy-200">
            Talk to our counsellor for personalised advice on the right batch, timing and study plan.
          </p>
          <Link to="/contact" className="btn-primary mt-7 inline-flex">
            Get Guidance <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
