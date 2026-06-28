'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Camera, Upload, X, Loader2, CheckCircle, AlertCircle, ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface BusinessImageUploadProps {
  userId: string
  businessId: string
  currentLogoUrl?: string | null
  currentBannerUrl?: string | null
}

const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

type ImageType = 'logo' | 'banner'

interface UploadState {
  uploading: boolean
  status: 'idle' | 'success' | 'error'
  errorMsg: string
  url: string | null
}

export function BusinessImageUpload({
  userId,
  businessId,
  currentLogoUrl,
  currentBannerUrl,
}: BusinessImageUploadProps) {
  const [logo, setLogo] = useState<UploadState>({
    uploading: false, status: 'idle', errorMsg: '', url: currentLogoUrl ?? null
  })
  const [banner, setBanner] = useState<UploadState>({
    uploading: false, status: 'idle', errorMsg: '', url: currentBannerUrl ?? null
  })
  const [logoDragging, setLogoDragging] = useState(false)
  const [bannerDragging, setBannerDragging] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const setState = (type: ImageType, patch: Partial<UploadState>) => {
    if (type === 'logo') setLogo((prev) => ({ ...prev, ...patch }))
    else setBanner((prev) => ({ ...prev, ...patch }))
  }

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) return 'Only JPEG, PNG, or WebP supported.'
    if (file.size > MAX_FILE_SIZE) return `Too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max 1 MB.`
    return null
  }

  const uploadFile = useCallback(async (file: File, type: ImageType) => {
    const err = validateFile(file)
    if (err) { setState(type, { status: 'error', errorMsg: err }); return }

    setState(type, { uploading: true, status: 'idle', errorMsg: '' })

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop() ?? 'jpg'
      const fileName = type === 'logo' ? `logo.${ext}` : `banner.${ext}`
      const filePath = `${userId}/${businessId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('business-images')
        .upload(filePath, file, { upsert: true, contentType: file.type })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('business-images')
        .getPublicUrl(filePath)

      const bustedUrl = `${publicUrl}?t=${Date.now()}`

      const updateField = type === 'logo' ? { logo_url: bustedUrl } : { banner_url: bustedUrl }
      const { error: dbError } = await supabase
        .from('businesses')
        .update({ ...updateField, updated_at: new Date().toISOString() })
        .eq('id', businessId)

      if (dbError) throw dbError

      setState(type, { url: bustedUrl, status: 'success', uploading: false })
      setTimeout(() => setState(type, { status: 'idle' }), 3000)
    } catch (e) {
      setState(type, {
        status: 'error',
        errorMsg: e instanceof Error ? e.message : 'Upload failed.',
        uploading: false,
      })
    } finally {
      if (type === 'logo' && logoInputRef.current) logoInputRef.current.value = ''
      if (type === 'banner' && bannerInputRef.current) bannerInputRef.current.value = ''
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, businessId])

  const handleRemove = async (type: ImageType) => {
    setState(type, { uploading: true })
    const supabase = createClient()
    const field = type === 'logo' ? { logo_url: null } : { banner_url: null }
    await supabase.from('businesses').update({ ...field, updated_at: new Date().toISOString() }).eq('id', businessId)
    setState(type, { url: null, uploading: false, status: 'idle' })
  }

  const currentState = (type: ImageType) => type === 'logo' ? logo : banner

  const renderUploadBox = (
    type: ImageType,
    label: string,
    hint: string,
    aspectClass: string,
    isDragging: boolean,
    setDragging: (v: boolean) => void,
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) => {
    const state = currentState(type)
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>

        {/* Upload area */}
        <div
          className={[
            'relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all duration-200 group',
            aspectClass,
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border hover:border-primary/60 hover:bg-muted/30',
          ].join(' ')}
          onClick={() => !state.uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault(); setDragging(false)
            const file = e.dataTransfer.files?.[0]
            if (file) uploadFile(file, type)
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          {state.url ? (
            <>
              <Image
                src={state.url}
                alt={`${label}`}
                fill
                className="object-cover"
                sizes={type === 'logo' ? '160px' : '600px'}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                {state.uploading
                  ? <Loader2 className="h-6 w-6 text-white animate-spin" />
                  : <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                }
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              {state.uploading
                ? <Loader2 className="h-8 w-8 text-primary animate-spin" />
                : <>
                    <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground">Click or drag to upload</p>
                  </>
              }
            </div>
          )}
        </div>

        {/* Actions + status */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={state.uploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            {state.uploading ? 'Uploading…' : `Upload ${label}`}
          </button>
          {state.url && !state.uploading && (
            <button
              type="button"
              onClick={() => handleRemove(type)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Remove
            </button>
          )}
          {state.status === 'success' && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle className="h-3.5 w-3.5" /> Saved!
            </span>
          )}
          {state.status === 'error' && (
            <span className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {state.errorMsg}
            </span>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f, type) }}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Logo */}
      {renderUploadBox(
        'logo',
        'Business Logo',
        'Square image recommended (e.g. 400×400px) · JPEG, PNG, WebP · Max 1 MB',
        'h-40 w-40',
        logoDragging,
        setLogoDragging,
        logoInputRef,
      )}

      {/* Banner */}
      {renderUploadBox(
        'banner',
        'Cover / Banner Image',
        'Wide image recommended (e.g. 1200×400px) · JPEG, PNG, WebP · Max 1 MB',
        'w-full h-40',
        bannerDragging,
        setBannerDragging,
        bannerInputRef,
      )}
    </div>
  )
}
