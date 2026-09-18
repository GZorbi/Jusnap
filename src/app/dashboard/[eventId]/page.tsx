import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Camera, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Event, Photo, EventMember } from "@/lib/types"
import { EventDetailClient } from "./client"

export default async function EventDetailPage({ params }: PageProps<"/dashboard/[eventId]">) {
  const { eventId } = await params
  const supabase = await createClient()
  let userId: string | undefined

  const { data: claims } = await supabase.auth.getClaims()
  userId = claims?.claims?.sub as string | undefined

  if (!userId) {
    const { data: userData } = await supabase.auth.getUser()
    userId = userData?.user?.id
  }

  if (!userId) redirect("/auth")

  // Fetch event
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single()

  if (!event) redirect("/dashboard")

  // Fetch photos
  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })

  // Fetch members
  const { data: members } = await supabase
    .from("event_members")
    .select("*")
    .eq("event_id", eventId)

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">{event.title}</h1>
            <p className="text-sm text-zinc-500">/e/{event.slug}</p>
          </div>
        </div>
      </header>

      <EventDetailClient
        event={event as Event}
        photos={(photos ?? []) as Photo[]}
        members={(members ?? []) as EventMember[]}
      />
    </div>
  )
}
