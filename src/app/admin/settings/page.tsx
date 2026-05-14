'use client'

import { useState } from 'react'
import { Save, Store, Truck, Bell, Globe, CheckCircle } from 'lucide-react'

const SETTINGS_SECTIONS = [
  {
    id: 'store',
    label: 'Store Info',
    icon: Store,
    fields: [
      { key: 'store_name', label: 'Store Name', type: 'text', placeholder: 'The Diecast Corner Nepal' },
      { key: 'store_email', label: 'Contact Email', type: 'email', placeholder: 'hello@diecastcorner.com.np' },
      { key: 'store_phone', label: 'Contact Phone', type: 'text', placeholder: '+977 98XXXXXXXX' },
      { key: 'store_address', label: 'Store Address', type: 'text', placeholder: 'Kathmandu, Nepal' },
    ],
  },
  {
    id: 'shipping',
    label: 'Shipping',
    icon: Truck,
    fields: [
      { key: 'free_shipping_threshold', label: 'Free Shipping Threshold (NPR)', type: 'number', placeholder: '2000' },
      { key: 'standard_shipping_charge', label: 'Standard Shipping Charge (NPR)', type: 'number', placeholder: '150' },
      { key: 'delivery_estimate', label: 'Delivery Estimate', type: 'text', placeholder: 'e.g. 2–5 business days' },
    ],
  },
  {
    id: 'social',
    label: 'Social Links',
    icon: Globe,
    fields: [
      { key: 'instagram_url', label: 'Instagram URL', type: 'url', placeholder: 'https://instagram.com/...' },
      { key: 'facebook_url', label: 'Facebook URL', type: 'url', placeholder: 'https://facebook.com/...' },
      { key: 'tiktok_url', label: 'TikTok URL', type: 'url', placeholder: 'https://tiktok.com/@...' },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    fields: [
      { key: 'order_notification_email', label: 'Order Notification Email', type: 'email', placeholder: 'orders@diecastcorner.com.np' },
    ],
  },
]

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState('store')
  const [saved, setSaved] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({
    store_name: 'The Diecast Corner Nepal',
    store_email: '',
    store_phone: '',
    store_address: 'Kathmandu, Nepal',
    free_shipping_threshold: '2000',
    standard_shipping_charge: '150',
    delivery_estimate: '2–5 business days',
    instagram_url: 'https://instagram.com/thediecastcornernepal',
    facebook_url: 'https://facebook.com/thediecastcornernepal',
    tiktok_url: 'https://tiktok.com/@thediecastcornernepal',
    order_notification_email: '',
  })

  const currentSection = SETTINGS_SECTIONS.find((s) => s.id === activeSection)!

  async function handleSave() {
    // In a full implementation this would POST to /api/admin/settings
    // For now, show a success state
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-white tracking-wide">SETTINGS</h1>
        <p className="text-text-muted text-sm mt-1">Configure your store preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0 space-y-1">
          {SETTINGS_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              id={`settings-tab-${id}`}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                activeSection === id
                  ? 'bg-brand-red text-white font-semibold shadow-lg shadow-brand-red/20'
                  : 'text-text-muted hover:text-white hover:bg-surface-elevated'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* Form panel */}
        <div className="flex-1 bg-surface-card rounded-xl border border-surface-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <currentSection.icon className="w-5 h-5 text-brand-red" />
            <h2 className="font-semibold text-text-primary text-lg">{currentSection.label}</h2>
          </div>

          <div className="space-y-5">
            {currentSection.fields.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={`setting-${field.key}`}
                  className="block text-sm font-medium text-text-muted mb-1.5"
                >
                  {field.label}
                </label>
                <input
                  id={`setting-${field.key}`}
                  type={field.type}
                  value={values[field.key] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:border-brand-red/60 focus:ring-1 focus:ring-brand-red/30 transition-colors"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <button
              id="save-settings-btn"
              onClick={handleSave}
              className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-light text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-brand-red/20"
            >
              {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
            {saved && (
              <span className="text-green-400 text-sm font-medium animate-pulse">
                Settings saved successfully
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
