"use server"

import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function createEvent(formData: FormData) {
  try {
    const supabase = await createClient()

    // Retrieve user session / identity
    let userId: string | undefined

    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
    if (claimsError) {
      console.error("[createEvent] getClaims error:", claimsError)
    }
    userId = claimsData?.claims?.sub as string | undefined

    if (!userId) {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error("[createEvent] getUser error:", userError)
      }
      userId = userData?.user?.id
    }

    if (!userId) {
      console.error("[createEvent] Unauthorized: No active user session found")
      return { error: "Not authenticated. Please log in again." }
    }

    const title = (formData.get("title") as string)?.trim()
    let slug = (formData.get("slug") as string)?.trim()
    const startTimeRaw = formData.get("startTime") as string
    const endTimeRaw = formData.get("endTime") as string

    if (!title) {
      return { error: "Event title is required" }
    }

    if (!slug) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
    } else {
      slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-")
    }

    if (!startTimeRaw || !endTimeRaw) {
      return { error: "Start and end times are required" }
    }

    // Convert local datetime inputs to ISO strings for timestamptz
    const startTime = new Date(startTimeRaw).toISOString()
    const endTime = new Date(endTimeRaw).toISOString()

    console.log("[createEvent] Attempting insert into events:", {
      title,
      slug,
      start_time: startTime,
      end_time: endTime,
      userId,
    })

    // Insert event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        title,
        slug,
        start_time: startTime,
        end_time: endTime,
        is_active: true,
      })
      .select()
      .single()

    if (eventError) {
      console.error("[createEvent] Supabase event insert error:", eventError)
      if (eventError.code === "23505") {
        return { error: "An event with this URL slug already exists. Please pick a unique title or slug." }
      }
      return { error: `Database error: ${eventError.message || eventError.details || "Failed to create event"}` }
    }

    console.log("[createEvent] Event created successfully:", event.id)

    // Add current user as owner in event_members
    const { error: memberError } = await supabase.from("event_members").insert({
      event_id: event.id,
      user_id: userId,
      role: "owner",
    })

    if (memberError) {
      console.error("[createEvent] Failed to add user to event_members:", memberError)
      // Note: Event was created, inform user or handle partial failure
      return { error: `Event was created, but failed to assign owner membership: ${memberError.message}` }
    }

    console.log("[createEvent] Added owner membership for event:", event.id)

    revalidatePath("/dashboard")
    return { success: true }
  } catch (err: any) {
    console.error("[createEvent] Unexpected server exception:", err)
    return { error: err?.message || "An unexpected error occurred while creating the event" }
  }
}

export async function deletePhoto(photoId: string, storagePath: string, eventId: string) {
  try {
    const supabase = await createClient()

    // Delete from storage
    const { error: storageError } = await supabase.storage.from("event-photos").remove([storagePath])
    if (storageError) {
      console.error("[deletePhoto] Storage removal error:", storageError)
    }

    // Delete from database
    const { error } = await supabase.from("photos").delete().eq("id", photoId)

    if (error) {
      console.error("[deletePhoto] Database deletion error:", error)
      return { error: error.message }
    }

    revalidatePath(`/dashboard/${eventId}`)
    return { success: true }
  } catch (err: any) {
    console.error("[deletePhoto] Unexpected error:", err)
    return { error: err?.message || "Failed to delete photo" }
  }
}

export async function addMember(eventId: string, email: string, role: string) {
  try {
    const supabase = await createClient()

    // Look up user by email or store directly
    const { error } = await supabase.from("event_members").insert({
      event_id: eventId,
      user_id: email.trim(),
      role,
    })

    if (error) {
      console.error("[addMember] Supabase insert error:", error)
      return { error: error.message }
    }

    revalidatePath(`/dashboard/${eventId}`)
    return { success: true }
  } catch (err: any) {
    console.error("[addMember] Unexpected error:", err)
    return { error: err?.message || "Failed to add member" }
  }
}

export async function signOut() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (err) {
    console.error("[signOut] Error signing out:", err)
  }
  redirect("/auth")
}
