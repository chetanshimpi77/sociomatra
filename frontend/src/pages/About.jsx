import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { IconGraduationCap, IconBook, IconUsers, IconTrendingUp, IconLayers, IconArrowRight } from '../components/icons.jsx'
import { getPosts } from '../services/api.js'

const whyUs = [
  { icon: IconGraduationCap, title: 'Experienced Faculty', desc: 'Learn from subject experts with years of experience in UPSC coaching.' },
  { icon: IconBook, title: 'Well-Structured Courses', desc: 'Comprehensive study plans for Prelims, Mains & Interview.' },
  { icon: IconUsers, title: 'Personalized Guidance', desc: 'Mentorship and doubt-clearing sessions for every aspirant.' },
  { icon: IconTrendingUp, title: 'Proven Results', desc: 'A track record of successful candidates in every batch.' },
  { icon: IconLayers, title: 'Modern Learning Environment', desc: 'Access to updated study material, test series and digital resources.' },
]

export default function About() {
  const [latest, setLatest] = useState(null)

  useEffect(() => {
    getPosts().then((posts) => setLatest(posts[0]))
  }, [])

  return (
    <div>
      <PageHero title="About" accent="Us" crumb="About" />

      <section className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-2">
        <div>
          <span className="block h-1 w-10 bg-gold-500" />
          <h2 className="mt-4 text-3xl font-extrabold text-navy-900">Welcome to SocioMantra IAS Academy</h2>
          <p className="mt-2 text-lg font-medium text-navy-600">Guiding Aspirants. Building Future Bureaucrats.</p>
          <p className="mt-5 text-navy-500">
            SocioMantra IAS Academy is a premier coaching institute dedicated to helping aspirants achieve
            their dream of joining the Indian Administrative Service (IAS) and other prestigious civil
            services. With a mission to provide quality education, expert guidance, and a supportive
            learning environment, we focus on holistic development &mdash; academically, personally, and
            professionally.
          </p>
          <p className="mt-4 text-navy-500">
            At SocioMantra IAS Academy, we believe that success in the Civil Services Examination is not
            just about hard work, but the right guidance, strategy, and consistent effort. Our experienced
            faculty, well-structured courses, and student-centric approach have helped numerous aspirants
            turn their dreams into reality.
          </p>
          <Link to="/courses" className="btn-primary mt-7 inline-flex">
            Our Courses <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {latest && (
          <div className="overflow-hidden rounded-xl border border-navy-100 shadow-card">
            <div className="bg-navy-900 px-6 py-3 text-sm font-semibold text-white">Latest Post</div>
            <div className="flex items-center justify-center gap-1 bg-gradient-to-br from-navy-800 to-navy-900 px-6 py-10 text-center text-gold-300">
              <IconBook className="h-16 w-16 opacity-70" />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-navy-900">{latest.title}</h3>
              <p className="mt-2 text-sm text-navy-500">{latest.excerpt}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-navy-400">
                <span>
                  By {latest.author} &middot;{' '}
                  {new Date(latest.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <Link to={`/blog/${latest.id}`} className="font-semibold text-gold-600 hover:text-gold-700">
                  Read More &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="bg-navy-50 py-16 sm:py-20">
        <div className="container-page">
          <div className="text-center">
            <span className="block mx-auto h-1 w-10 bg-gold-500" />
            <h2 className="mt-4 text-3xl font-extrabold text-navy-900">Why Choose SocioMantra IAS Academy?</h2>
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
    </div>
  )
}
