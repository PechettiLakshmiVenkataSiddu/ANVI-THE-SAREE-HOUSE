import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidCloudinaryUrl } from '@/lib/admin/sanitize'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized — please log in to admin.' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('[upload] profile check failed:', profileError.message)
      return NextResponse.json({ error: 'Could not verify admin role.' }, { status: 403 })
    }

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden — admin access required.' }, { status: 403 })
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      console.error('[upload] Missing Cloudinary env vars')
      return NextResponse.json(
        {
          error:
            'Cloudinary not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in environment variables.',
        },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Invalid file type: ${file.type}. Use JPEG, PNG, WebP, or GIF.` }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
    }

    const cloudinaryForm = new FormData()
    cloudinaryForm.append('file', file)
    cloudinaryForm.append('upload_preset', uploadPreset)
    cloudinaryForm.append('folder', 'saree-elegance')
    cloudinaryForm.append('quality', 'auto')
    cloudinaryForm.append('fetch_format', 'auto')

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: cloudinaryForm,
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('[upload] Cloudinary error:', result?.error?.message ?? result)
      return NextResponse.json(
        { error: result?.error?.message ?? 'Cloudinary upload failed.' },
        { status: 500 }
      )
    }

    const url = result.secure_url as string | undefined
    if (!isValidCloudinaryUrl(url)) {
      console.error('[upload] Invalid response URL:', result)
      return NextResponse.json({ error: 'Upload succeeded but returned an invalid image URL.' }, { status: 500 })
    }

    return NextResponse.json({
      url,
      publicId: result.public_id as string,
      width: result.width,
      height: result.height,
    })
  } catch (err) {
    console.error('[upload] Unexpected error:', err)
    return NextResponse.json({ error: 'Image upload failed unexpectedly.' }, { status: 500 })
  }
}
