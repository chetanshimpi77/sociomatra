import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { IconBook } from '../components/icons.jsx'
import { getPost } from '../services/api.js'

export default function BlogPost() {
  const { postId } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)

    getPost(postId)
      .then((data) => {
        if (!cancelled) setPost(data)
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
  }, [postId])

  if (notFound) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold text-navy-900">Post not found</h1>
        <Link to="/blog" className="btn-primary mt-6 inline-flex">Back to Blog</Link>
      </div>
    )
  }

  return (
    <div>
      <PageHero eyebrow={post?.tag} title={loading ? 'Loading...' : post?.title} crumb="Blog Post" />
      <article className="container-page max-w-3xl py-16 sm:py-20">
        <div className="mb-8 flex h-56 items-center justify-center rounded-xl bg-gradient-to-br from-navy-800 to-navy-900 text-gold-300">
          <IconBook className="h-16 w-16 opacity-70" />
        </div>
        {post && (
          <>
            <p className="text-sm text-navy-400">
              By {post.author} &middot; {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="mt-6 text-lg leading-relaxed text-navy-700">{post.content}</p>
          </>
        )}
        <Link to="/blog" className="btn-secondary mt-10 inline-flex">
          &larr; Back to Blog
        </Link>
      </article>
    </div>
  )
}
