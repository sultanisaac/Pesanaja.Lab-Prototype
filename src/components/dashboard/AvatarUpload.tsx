'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Camera, Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl?: string | null
  displayName: string
}

const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'
}

export function AvatarUpload({ userId, currentAvatarUrl, displayName }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl ?? null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initials = getInitials(displayName)
  const displayUrl = preview ?? avatarUrl

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP images are supported.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max size is 1 MB.`
    }
    return null
  }

  const processFile = useCallback(async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setStatus('error')
      setErrorMsg(validationError)
      return
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setStatus('idle')
    setErrorMsg('')
    setUploading(true)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const filePath = `${userId}/avatar.${ext}`

      // Upload to Supabase Storage (upsert)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, contentType: file.type })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Add cache-busting param so Next Image refreshes
      const bustedUrl = `${publicUrl}?t=${Date.now()}`

      // Update profile record
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: bustedUrl, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (dbError) throw dbError

      setAvatarUrl(bustedUrl)
      setPreview(null)
      URL.revokeObjectURL(objectUrl)
      setStatus('success')

      // Reset success indicator after 3s
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      console.error('Avatar upload error:', err)
      setPreview(null)
      URL.revokeObjectURL(objectUrl)
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleRemove = async () => {
    setUploading(true)
    try {
      const supabase = createClient()
      await supabase.from('profiles')
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq('id', userId)
      setAvatarUrl(null)
      setPreview(null)
      setStatus('idle')
    } catch {
      setStatus('error')
      setErrorMsg('Failed to remove avatar.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
      {/* Avatar ring / drop zone */}
      <div
        className={[
          'relative group shrink-0 h-24 w-24 rounded-full cursor-pointer transition-all duration-200',
          dragging ? 'ring-4 ring-primary ring-offset-2 scale-105' : 'ring-2 ring-border hover:ring-primary/60 hover:ring-offset-2',
        ].join(' ')}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        role="button"
        aria-label="Upload profile photo"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt={`${displayName} avatar`}
            fill
            className="rounded-full object-cover"
            sizes="96px"
          />
        ) : (
          <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl select-none">
            {initials}
          </div>
        )}

        {/* Overlay */}
        <div className={[
          'absolute inset-0 rounded-full flex items-center justify-center transition-all duration-200',
          uploading
            ? 'bg-black/50'
            : 'bg-black/0 group-hover:bg-black/40',
        ].join(' ')}>
          {uploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>

        {/* Success tick */}
        {status === 'success' && (
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Right-hand info */}
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <div>
          <p className="text-sm font-semibold text-foreground">Profile Photo</p>
          <p className="text-xs text-muted-foreground mt-0.5">JPEG, PNG or WebP · Max 1 MB</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading ? 'Uploading…' : 'Upload Photo'}
          </button>

          {(avatarUrl || preview) && !uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>

        {/* Status messages */}
        {status === 'success' && (
          <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <CheckCircle className="h-3.5 w-3.5" />
            Avatar updated successfully!
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  )
}
