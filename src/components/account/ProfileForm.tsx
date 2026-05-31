'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { profileSchema, type ProfileInput } from '@/lib/validations/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { NEPAL_CITIES } from '@/lib/constants'
import type { Profile } from '@/lib/types'

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name ?? '',
      phone: profile.phone ?? '',
      address: profile.address ?? '',
      city: profile.city ?? '',
      landmark: profile.shipping_address?.landmark ?? '',
    },
  })

  const onSubmit = async (data: ProfileInput) => {
    setError(null)
    setSuccess(false)
    const supabase = createClient()
    
    const shipping_address = {
      name: data.full_name,
      phone: data.phone,
      address: data.address,
      city: data.city,
      landmark: data.landmark,
    }

    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: data.full_name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        shipping_address,
        updated_at: new Date().toISOString() 
      })
      .eq('id', profile.id)

    if (error) { setError(error.message); return }
    setSuccess(true)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input {...register('full_name')} id="profile-name" label="Full Name" error={errors.full_name?.message} />
      <Input {...register('phone')} id="profile-phone" label="Phone Number" error={errors.phone?.message} />
      <Input {...register('address')} id="profile-address" label="Street Address" placeholder="Street, Area" error={errors.address?.message} />
      <Input {...register('landmark')} id="profile-landmark" label="Landmark (Optional)" placeholder="Near ABC School" error={errors.landmark?.message} />
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">City</label>
        <select {...register('city')} id="profile-city" className="input-base">
          <option value="">Select city</option>
          {NEPAL_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.city && <p className="text-xs text-red-400 mt-1">{errors.city.message}</p>}
      </div>

      {success && <p className="text-green-400 text-sm">Profile updated successfully!</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <Button type="submit" variant="primary" isLoading={isSubmitting} id="save-profile-btn">
        Save Changes
      </Button>
    </form>
  )
}
