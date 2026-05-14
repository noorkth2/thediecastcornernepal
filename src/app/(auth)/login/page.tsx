'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/account'
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginInput) => {
    setServerError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError(error.message)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="glass-card rounded-2xl p-8 border border-surface-border">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-white tracking-wide">
          WELCOME BACK
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Sign in to your collector account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          {...register('email')}
          id="email"
          type="email"
          label="Email Address"
          placeholder="you@example.com"
          error={errors.email?.message}
          icon={<Mail className="w-4 h-4" />}
          autoComplete="email"
        />

        <div className="relative">
          <Input
            {...register('password')}
            id="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
            icon={<Lock className="w-4 h-4" />}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-9 text-text-muted hover:text-white transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-text-muted hover:text-brand-red-light transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {serverError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isSubmitting}
          id="login-submit-btn"
        >
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-brand-red-light hover:underline font-medium">
          Create one
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="glass-card rounded-2xl p-8 border border-surface-border animate-pulse h-96" />}>
      <LoginForm />
    </Suspense>
  )
}
