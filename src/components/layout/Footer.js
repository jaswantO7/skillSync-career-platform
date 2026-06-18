import Link from 'next/link'

const Footer = () => {
  return (
    <footer className="border-t border-surface-300 dark:border-zinc-800 bg-white/70 dark:bg-black px-4 sm:px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-stitch-primary to-stitch-secondary rounded-lg flex items-center justify-center shadow-lg shadow-stitch-primary/20">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-sm font-semibold text-surface-900 dark:text-white">SkillSync</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label="Footer">
            <Link href="/privacy" className="font-mono text-[11px] uppercase tracking-[0.18em] text-surface-500 transition-colors hover:text-surface-900 dark:hover:text-surface-300">
              Privacy
            </Link>
            <Link href="/terms" className="font-mono text-[11px] uppercase tracking-[0.18em] text-surface-500 transition-colors hover:text-surface-900 dark:hover:text-surface-300">
              Terms
            </Link>
            <Link href="/about" className="font-mono text-[11px] uppercase tracking-[0.18em] text-surface-500 transition-colors hover:text-surface-900 dark:hover:text-surface-300">
              About
            </Link>
            <Link href="/contact" className="font-mono text-[11px] uppercase tracking-[0.18em] text-surface-500 transition-colors hover:text-surface-900 dark:hover:text-surface-300">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <a href="https://github.com" target="_blank" rel="noreferrer noopener" aria-label="GitHub" className="flex h-8 w-8 items-center justify-center border border-surface-300 dark:border-surface-800 bg-surface-100 dark:bg-surface-950 text-surface-500 dark:text-surface-500 transition-colors hover:border-surface-400 dark:hover:border-surface-700 hover:text-surface-900 dark:hover:text-surface-300">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.02c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.71 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.44-2.69 5.41-5.25 5.7.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.55C20.21 21.38 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer noopener" aria-label="X / Twitter" className="flex h-8 w-8 items-center justify-center border border-surface-300 dark:border-surface-800 bg-surface-100 dark:bg-surface-950 text-surface-500 dark:text-surface-500 transition-colors hover:border-surface-400 dark:hover:border-surface-700 hover:text-surface-900 dark:hover:text-surface-300">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer noopener" aria-label="LinkedIn" className="flex h-8 w-8 items-center justify-center border border-surface-300 dark:border-surface-800 bg-surface-100 dark:bg-surface-950 text-surface-500 dark:text-surface-500 transition-colors hover:border-surface-400 dark:hover:border-surface-700 hover:text-surface-900 dark:hover:text-surface-300">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
        <div className="my-6 border-t border-surface-300 dark:border-zinc-800" />
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-surface-400 dark:text-surface-700">
          &copy; 2025 SkillSync. AI-powered careers.
        </p>
      </div>
    </footer>
  )
}

export default Footer
