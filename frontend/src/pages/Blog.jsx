import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { IconBook } from '../components/icons.jsx'
import { getPosts } from '../services/api.js'

export default function Blog() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    getPosts().then(setPosts)
  }, [])

  return (
    <div>
      <PageHero
        eyebrow="Blog & News"
        title="Latest Updates,"
        accent="Tips & Insights"
        crumb="Blog"
        subtitle="Stay informed with the latest news, exam updates, preparation tips and expert guidance."
      />

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link to={`/blog/${p.id}`} key={p.id} className="card group flex flex-col">
              <div className="-mx-6 -mt-6 mb-4 flex h-36 items-center justify-center rounded-t-xl bg-gradient-to-br from-navy-800 to-navy-900 text-gold-300">
                <IconBook className="h-10 w-10 opacity-70" />
              </div>
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
    </div>
  )
}
