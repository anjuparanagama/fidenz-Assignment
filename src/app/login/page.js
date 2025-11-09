export const metadata = {
  title: 'Login — Meteo Earth',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[url('/bg.jpg')] bg-cover bg-fixed bg-center">
      <section className="w-full max-w-lg bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 mx-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
              <path d="M12 2a1 1 0 0 1 1 1v2.07a7 7 0 1 1-2 0V3a1 1 0 0 1 1-1zM6.2 8.2a1 1 0 0 1 .8.6A9 9 0 1 0 18 12a1 1 0 1 1 2 0 11 11 0 1 1-11-11 1 1 0 0 1 .6.2z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome back to Meteo Earth</h1>
            <p className="mt-1 text-sm text-blue-200/80">Access personalized forecasts, saved locations and widgets.</p>
          </div>
        </div>

        <div className="mt-6">
          <a
            href="/api/auth/login?returnTo=/dashboard"
            className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-md transition-colors"
            aria-label="Sign in with Auth0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white">
              <path d="M12 2v6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 22v-6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12h6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 12h-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sign in with Auth0
          </a>

          <p className="mt-4 text-sm text-blue-200/70">Don’t have an account? A demo account will be created on first sign-in with Auth0.</p>
        </div>

        <footer className="mt-8 text-sm text-blue-100/60">© {new Date().getFullYear()} Meteo Earth</footer>
      </section>
    </main>
  )
}
