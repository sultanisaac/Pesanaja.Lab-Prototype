'use client'

import { useState } from 'react'
import { updatePassword } from '@/app/dashboard/profile/actions'


export function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setError(null)
    const formData = new FormData(e.currentTarget)
    // Call the server action directly
    updatePassword(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="newPassword" className="text-sm font-medium text-foreground">New Password</label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          placeholder="Minimum 6 characters"
          required
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm Password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (error && newPassword === e.target.value) {
              setError(null)
            }
          }}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          placeholder="Re-enter new password"
          required
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      <button
        type="submit"
        className="w-full sm:w-auto px-6 py-2 bg-foreground text-white text-sm font-medium rounded-lg hover:bg-foreground/80 transition-colors"
      >
        Update Password
      </button>
    </form>
  )
}
