'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  multiple?: boolean
}

export default function ImageUploader({ images, onChange, multiple = true }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    setError('')

    const newUrls: string[] = []

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Upload failed')
        if (!data.url || typeof data.url !== 'string' || !data.url.startsWith('http')) {
          throw new Error('Upload returned an invalid image URL')
        }
        newUrls.push(data.url)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
        break
      }
    }

    if (newUrls.length) {
      onChange(multiple ? [...images, ...newUrls] : newUrls)
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
            <Image src={url} alt="" fill className="object-cover" sizes="80px" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 p-0.5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition disabled:opacity-50"
        >
          {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
          <span className="text-[10px]">{uploading ? 'Uploading' : 'Upload'}</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-[10px] text-muted-foreground">Or paste image URL below. Cloudinary upload used when configured.</p>
    </div>
  )
}
