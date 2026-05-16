export interface Banner {
  id: number
  type: 'hero' | 'popup' | 'announcement'
  title: string | null
  image_url: string | null
  link_url: string | null
  announcement_text: string | null
  popup_duration_sec: number
  is_active: boolean
  display_start: string | null
  display_end: string | null
  sort_order: number
}
