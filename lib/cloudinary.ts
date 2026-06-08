export function getCloudinaryUrl(publicId: string, transforms = 'f_auto,q_auto') {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName || !publicId) return publicId
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`
}

export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_UPLOAD_PRESET
  )
}

export function getCloudinaryConfigStatus(): { configured: boolean; missing: string[] } {
  const missing: string[] = []
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) missing.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')
  if (!process.env.CLOUDINARY_UPLOAD_PRESET) missing.push('CLOUDINARY_UPLOAD_PRESET')
  return { configured: missing.length === 0, missing }
}
