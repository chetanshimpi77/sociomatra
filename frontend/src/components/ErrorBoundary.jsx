import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // In a real deployment you'd send this to an error-tracking service
    // (Sentry, LogRocket, etc). For now, at least log it so it's visible
    // in the browser console instead of just disappearing.
    console.error('Unhandled UI error:', error, info)
  }

  handleReload = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">Something went wrong</p>
          <h1 className="mt-3 text-3xl font-extrabold text-navy-900">We hit a snag</h1>
          <p className="mt-2 max-w-sm text-navy-500">
            This page ran into an unexpected error. Try reloading - if it keeps happening, please let us know.
          </p>
          <button onClick={this.handleReload} className="btn-primary mt-7">
            Back to Home
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
