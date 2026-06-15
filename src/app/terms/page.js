'use client'

import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-surface-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-3xl font-display font-semibold text-surface-900 dark:text-white mb-6">Terms of Service</h1>
        <div className="prose dark:prose-invert text-surface-600 dark:text-surface-400 space-y-4 text-sm">
          <p>These Terms of Service govern your use of SkillSync. By using our platform, you agree to these terms.</p>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">1. Acceptance</h2>
          <p>By accessing or using SkillSync, you confirm you have read and accept these terms.</p>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">2. Usage</h2>
          <p>You agree to use SkillSync for lawful purposes only. You are responsible for maintaining the confidentiality of your account.</p>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">3. Limitation of Liability</h2>
          <p>SkillSync provides career guidance tools on an &ldquo;as is&rdquo; basis. We make no guarantees about career outcomes.</p>
          <p className="pt-4">Last updated: 2024</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default TermsPage
