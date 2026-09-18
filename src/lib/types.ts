export interface Event {
  id: string
  slug: string
  title: string
  start_time: string
  end_time: string
  is_active: boolean
  access_pin: string | null
  created_at: string
}

export interface EventMember {
  id: string
  event_id: string
  user_id: string
  role: "owner" | "admin"
}

export interface Photo {
  id: string
  event_id: string
  storage_path: string
  uploader_name: string
  is_approved: boolean
  created_at: string
}
