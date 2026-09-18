import Link from "next/link"
import { Calendar, ImageIcon, ExternalLink } from "lucide-react"
import type { Event } from "@/lib/types"

function getEventStatus(event: Event): { label: string; color: string } {
  const now = new Date()
  const start = new Date(event.start_time)
  const end = new Date(event.end_time)

  if (!event.is_active) return { label: "Inactive", color: "bg-zinc-700 text-zinc-400" }
  if (now < start) return { label: "Upcoming", color: "bg-blue-500/20 text-blue-400" }
  if (now > end) return { label: "Ended", color: "bg-zinc-700 text-zinc-400" }
  return { label: "Live", color: "bg-emerald-500/20 text-emerald-400" }
}

export function EventCard({ event }: { event: Event & { photo_count: number } }) {
  const status = getEventStatus(event)
  const startDate = new Date(event.start_time).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Link
      href={`/dashboard/${event.id}`}
      className="group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-900/80"
    >
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-white group-hover:text-zinc-100">
          {event.title}
        </h3>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>

      <p className="mb-4 text-sm text-zinc-500">/e/{event.slug}</p>

      <div className="mt-auto flex items-center gap-4 text-sm text-zinc-400">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {startDate}
        </span>
        <span className="flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5" />
          {event.photo_count} photos
        </span>
        <ExternalLink className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  )
}
