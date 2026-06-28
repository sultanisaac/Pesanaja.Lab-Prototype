'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const attempts = parseInt(formData.get('attempts') as string || '0', 10)

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const newAttempts = attempts + 1
    if (newAttempts >= 3) {
      return redirect('/forgot-password')
    }
    return redirect(`/login?error=Wrong email or password&attempts=${newAttempts}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const role = formData.get('role') as string // 'customer' or 'business'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: role || 'customer',
      }
    }
  })

  if (error) {
    return redirect('/register?error=Could not create user')
  }

  // Usually, Supabase sends a confirmation email.
  // We can redirect to a page that tells them to check their email.
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
    if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
    return 'http://localhost:3000'
  }
  
  const baseUrl = getBaseUrl()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${baseUrl}/api/auth/callback`,
    },
  })

  if (error) {
    return redirect('/login?error=Could not authenticate with Google')
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
    if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
    return 'http://localhost:3000'
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getBaseUrl()}/dashboard/profile`,
  })

  if (error) {
    return redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/forgot-password?success=true')
}
