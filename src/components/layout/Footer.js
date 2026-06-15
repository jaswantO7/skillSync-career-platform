'use client'

import Link from 'next/link'
import { Twitter, Linkedin, Github, Mail } from 'lucide-react'

const Footer = () => {
  const sections = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Roadmap', href: '#roadmap' },
      { name: 'Updates', href: '#updates' },
    ],
    Company: [
      { name: 'About', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Careers', href: '#careers' },
      { name: 'Contact', href: '#contact' },
    ],
    Resources: [
      { name: 'Documentation', href: '#docs' },
      { name: 'Help Center', href: '#help' },
      { name: 'Community', href: '#community' },
      { name: 'API', href: '#api' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' },
    ],
  }

  const socialLinks = [
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
    { name: 'GitHub', href: '#', icon: Github },
    { name: 'Email', href: 'mailto:hello@skillsync.com', icon: Mail },
  ]

  return (
    <footer className="bg-surface-800 dark:bg-surface-900 text-white border-t border-surface-700 dark:border-surface-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-display font-bold text-xl">SkillSync</span>
            </Link>
            <p className="text-surface-400 text-sm leading-relaxed mb-6 max-w-xs">
              Your AI career growth companion. Transform your professional journey with personalized learning paths and intelligent mentorship.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="w-9 h-9 rounded-lg bg-surface-700 dark:bg-surface-800 hover:bg-surface-600 dark:hover:bg-surface-700 flex items-center justify-center text-surface-400 hover:text-white transition-all"
                  >
                    <Icon size={16} />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Navigation Links */}
          {Object.entries(sections).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-sm text-surface-300 dark:text-surface-400 mb-4 uppercase tracking-wider">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-surface-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-surface-700 dark:border-surface-800 pt-8 mb-8">
          <div className="max-w-md">
            <h3 className="font-semibold text-white mb-1.5">Stay Updated</h3>
            <p className="text-surface-400 text-sm mb-4">
              Get the latest updates on new features and career growth tips.
            </p>
            <div className="flex space-x-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 bg-surface-700 dark:bg-surface-800 border border-surface-600 dark:border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all"
              />
              <button className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-sm transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-surface-700 dark:border-surface-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-surface-500 text-sm">
            &copy; 2024 SkillSync. All rights reserved.
          </p>
          <p className="text-surface-500 text-sm mt-2 md:mt-0">
            Built for career growth
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
