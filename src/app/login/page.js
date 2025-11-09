export const metadata = {
  title: 'Login — Meteo Earth',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-[url('/bg.jpg')] bg-cover bg-scroll md:bg-fixed bg-center">
      <div className="grow flex items-center justify-center w-full">
        <section className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 md:p-12 mx-4 sm:mx-6">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-full">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-white pb-2 leading-tight">Welcome to Meteo Earth !</h1>
              <p className="mt-1 text-sm sm:text-base text-blue-200/80 text-center">Access personalized forecasts, saved locations and widgets.</p>
            </div>
          </div>

          <div className="mt-6">
            <a
              href="/api/auth/login?returnTo=/dashboard"
              className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-md transition-colors text-sm md:text-base"
              aria-label="Sign in with Auth0"
            >
              Sign in with Auth0
            </a>

            <p className="mt-4 text-sm text-blue-200/70"><span className="text-black-900 font-semibold">Note : </span>Only Pre-Defined Users Can Log to this system.</p>
          </div>
        </section>
      </div>

  <footer className="w-full text-sm text-center text-blue-100/60 py-4 md:py-6">© {new Date().getFullYear()} Meteo Earth</footer>
    </main>
  )
}
