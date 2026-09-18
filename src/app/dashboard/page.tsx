import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Camera, Plus, LogOut } from "lucide-react"
import { signOut } from "./actions"
import { EventCard } from "@/components/dashboard/event-card"
import { CreateEventDialog } from "@/components/dashboard/create-event-dialog"
import type { Event } from "@/lib/types"

export default async function DashboardPage() {
  const supabase = await createClient()
  let userId: string | undefined

  const { data: claims } = await supabase.auth.getClaims()
  userId = claims?.claims?.sub as string | undefined

  if (!userId) {
    const { data: userData } = await supabase.auth.getUser()
    userId = userData?.user?.id
  }

  if (!userId) {
    redirect("/auth")
  }

  // Fetch events where user is a member
  const { data: memberships } = await supabase
    .from("event_members")
    .select("event_id")
    .eq("user_id", userId)

  const eventIds = memberships?.map((m) => m.event_id) ?? []

  let events: (Event & { photo_count: number })[] = []
  if (eventIds.length > 0) {
    const { data } = await supabase
      .from("events")
      .select("*, photos(count)")
      .in("id", eventIds)
      .order("created_at", { ascending: false })

    events = (data ?? []).map((e: any) => ({
      ...e,
      photo_count: e.photos?.[0]?.count ?? 0,
    }))
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-white" />
            <span className="text-lg font-bold text-white">Jusnap</span>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Events</h1>
            <p className="mt-1 text-sm text-zinc-400">
              {events.length} event{events.length !== 1 ? "s" : ""}
            </p>
          </div>
          <CreateEventDialog />
        </div>

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-20">
            <Camera className="mb-4 h-12 w-12 text-zinc-700" />
            <p className="text-lg font-medium text-zinc-400">No events yet</p>
            <p className="mt-1 text-sm text-zinc-600">Create your first event to get started</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
