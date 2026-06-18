'use client'

import { useState } from 'react'
import { AlertTriangle, RotateCcw, X } from 'lucide-react'
import { api } from '@/lib/api'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function DevResetButton() {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    setLoading(true)
    try {
      await api.post('/dev/reset')
      sessionStorage.clear()
      localStorage.clear()
      toast.success('All data reset! Reloading...')
      setTimeout(() => window.location.reload(), 500)
    } catch (e) {
      toast.error('Reset failed: ' + (e.response?.data?.message || e.message))
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
      >
        <RotateCcw size={14} />
        <span>Reset My Data</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6 border border-red-200 dark:border-red-800/50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle size={22} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-900 dark:text-white">Reset all data?</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                This deletes all your roadmaps, projects, chats, progress, and clears storage. Your account stays.
              </p>
            </div>
          </div>
          <button onClick={() => setConfirming(false)} className="text-surface-400 hover:text-surface-600">
            <X size={18} />
          </button>
        </div>
        <div className="flex space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setConfirming(false)} className="flex-1" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleReset} loading={loading} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
            {loading ? 'Resetting...' : 'Reset Everything'}
          </Button>
        </div>
      </div>
    </div>
  )
}
