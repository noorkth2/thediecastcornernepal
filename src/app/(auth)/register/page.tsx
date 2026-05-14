'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name, phone: data.phone },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setServerError(error.message)
      return
    }

    router.push('/account?registered=true')
  }

  return (
    <div className="glass-card rounded-2xl p-8 border border-surface-border">
      <div className="mb-6">
        <h1 className="font-display text-3xl text-white tracking-wide">
          JOIN THE CREW
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Create your free collector account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          {...register('full_name')}
          id="full_name"
          type="text"
          label="Full Name"
          placeholder="Your name"
          error={errors.full_name?.message}
          icon={<User className="w-4 h-4" />}
          autoComplete="name"
        />
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
        <Input
          {...register('phone')}
          id="phone"
          type="tel"
          label="Phone Number"
          placeholder="98XXXXXXXX"
          error={errors.phone?.message}
          icon={<Phone className="w-4 h-4" />}
          autoComplete="tel"
        />

        <div className="relative">
          <Input
            {...register('password')}
            id="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Min 6 characters"
            error={errors.password?.message}
            icon={<Lock className="w-4 h-4" />}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-9 text-text-muted hover:text-white transition-colors"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <Input
          {...register('confirm_password')}
          id="confirm_password"
          type={showPassword ? 'text' : 'password'}
          label="Confirm Password"
          placeholder="Re-enter password"
          error={errors.confirm_password?.message}
          icon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
        />

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
          id="register-submit-btn"
        >
          {isSubmitting ? 'Creating account…' : 'Create Account'}
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-red-light hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
