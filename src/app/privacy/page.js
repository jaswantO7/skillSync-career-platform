'use client'

import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-surface-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-3xl font-display font-semibold text-surface-900 dark:text-white mb-6">Privacy Policy</h1>
        <div className="prose dark:prose-invert text-surface-600 dark:text-surface-400 space-y-4 text-sm">
          <p>Your privacy is important to us. This policy outlines how SkillSync collects and uses your information.</p>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">1. Data Collected</h2>
          <p>We collect information you provide: name, email, resume data, career preferences, and chat messages.</p>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">2. How We Use It</h2>
          <p>Your data is used to provide AI-powered career analysis, recommendations, and mentor chat. We do not sell your data.</p>
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">3. Security</h2>
          <p>We implement industry-standard security measures to protect your information.</p>
          <p className="pt-4">Last updated: 2024</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default PrivacyPage
