import { createClient } from "@/lib/server"
import { notFound } from "next/navigation"
import { Camera } from "lucide-react"
import type { Event, Photo } from "@/lib/types"
import { PhotoGallery } from "@/components/event/photo-gallery"
import { UploadBar } from "@/components/event/upload-bar"
import { Countdown } from "@/components/event/countdown"

function getEventStatus(event: Event) {
  const now = new Date()
  const start = new Date(event.start_time)
  const end = new Date(event.end_time)

  if (!event.is_active) return { status: "locked" as const, label: "Event Locked" }
  if (now < start) return { status: "upcoming" as const, label: "Opens Soon" }
  if (now > end) return { status: "ended" as const, label: "Uploads Closed" }
  return { status: "live" as const, label: "Live Uploads Open" }
}

export default async function EventPage({ params }: PageProps<"/e/[slug]">) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!event) notFound()

  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("event_id", event.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })

  const eventStatus = getEventStatus(event as Event)
  const canUpload = eventStatus.status === "live"

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="h-4 w-4 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-500">Jusnap</span>
          </div>
          <h1 className="text-xl font-bold text-white">{event.title}</h1>
          <div className="mt-2">
            {eventStatus.status === "live" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                {eventStatus.label}
              </span>
            )}
            {eventStatus.status === "upcoming" && (
              <span className="inline-flex rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400">
                {eventStatus.label}
              </span>
            )}
            {(eventStatus.status === "ended" || eventStatus.status === "locked") && (
              <span className="inline-flex rounded-full bg-zinc-700 px-3 py-1 text-xs font-medium text-zinc-400">
                {eventStatus.label}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Countdown for upcoming events */}
      {eventStatus.status === "upcoming" && (
        <Countdown targetDate={event.start_time} />
      )}

      {/* Photo Gallery */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-2 py-4 pb-24">
        <PhotoGallery
          initialPhotos={(photos ?? []) as Photo[]}
          eventId={event.id}
        />
      </main>

      {/* Upload Bar */}
      {canUpload && (
        <UploadBar eventId={event.id} />
      )}
    </div>
  )
}
