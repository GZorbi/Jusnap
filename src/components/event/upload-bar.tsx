"use client"

import { useState, useRef } from "react"
import { Camera, Loader2, Check } from "lucide-react"
import imageCompression from "browser-image-compression"
import confetti from "canvas-confetti"
import { createClient } from "@/lib/client"

export function UploadBar({ eventId }: { eventId: string }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const [done, setDone] = useState(false)
  const [guestName, setGuestName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("jusnap_guest_name") || ""
    }
    return ""
  })
  const [showNamePrompt, setShowNamePrompt] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  async function processUpload(files: File[], uploaderName: string) {
    if (!files || files.length === 0) return

    setUploading(true)
    setProgress(0)
    setTotal(files.length)
    setDone(false)

    const supabase = createClient()
    const name = uploaderName.trim() || "Guest"

    for (let i = 0; i < files.length; i++) {
      try {
        console.log(`[UploadBar] Processing file ${i + 1}/${files.length}: ${files[i].name}`)
        // Compress image
        const compressed = await imageCompression(files[i], {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        })

        // Generate unique filename
        const ext = files[i].name.split(".").pop() || "jpg"
        const uniqueName = `${crypto.randomUUID()}.${ext}`
        const storagePath = `${eventId}/${uniqueName}`

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("event-photos")
          .upload(storagePath, compressed, {
            contentType: compressed.type,
          })

        if (uploadError) {
          console.error("[UploadBar] Upload error:", uploadError)
          continue
        }

        // Insert photo record
        const { error: insertError } = await supabase.from("photos").insert({
          event_id: eventId,
          storage_path: storagePath,
          uploader_name: name,
          is_approved: true,
        })

        if (insertError) {
          console.error("[UploadBar] Photo metadata insert error:", insertError)
        }

        setProgress(i + 1)
      } catch (err) {
        console.error("[UploadBar] Error processing file:", err)
      }
    }

    setUploading(false)
    setDone(true)

    // Confetti celebration!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ["#ffffff", "#a1a1aa", "#3f3f46"],
      })
    } catch (confettiErr) {
      console.warn("[UploadBar] Confetti error:", confettiErr)
    }

    // Reset after delay and refresh gallery
    setTimeout(() => {
      setDone(false)
      setProgress(0)
      setTotal(0)
      window.location.reload()
    }, 2000)

    // Reset file input value so re-selecting same files triggers onChange
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return

    const filesArray = Array.from(fileList)
    console.log(`[UploadBar] ${filesArray.length} file(s) selected by user`)

    // If guest name is already set in localStorage / state, upload immediately
    if (guestName && guestName.trim() !== "") {
      processUpload(filesArray, guestName)
    } else {
      // Store pending files and ask for name before running the upload
      setPendingFiles(filesArray)
      setShowNamePrompt(true)
      setTimeout(() => nameInputRef.current?.focus(), 150)
    }
  }

  function handleNameSubmit() {
    const name = nameInputRef.current?.value?.trim() || "Guest"
    setGuestName(name)
    if (typeof window !== "undefined") {
      localStorage.setItem("jusnap_guest_name", name)
    }
    setShowNamePrompt(false)
    if (pendingFiles.length > 0) {
      processUpload(pendingFiles, name)
      setPendingFiles([])
    }
  }

  function handleSkipName() {
    const defaultName = "Guest"
    setGuestName(defaultName)
    if (typeof window !== "undefined") {
      localStorage.setItem("jusnap_guest_name", defaultName)
    }
    setShowNamePrompt(false)
    if (pendingFiles.length > 0) {
      processUpload(pendingFiles, defaultName)
      setPendingFiles([])
    }
  }

  return (
    <>
      {/* Optional Name Prompt Modal shown AFTER photos are selected */}
      {showNamePrompt && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={handleSkipName}
          />
          {/* Dialog Container with safe bottom margin on mobile */}
          <div className="relative w-full max-w-sm animate-slide-up rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl mb-2 sm:mb-0">
            <h3 className="mb-2 text-lg font-semibold text-white">
              Who is sharing these photos?
            </h3>
            <p className="mb-4 text-xs text-zinc-400">
              Your name will appear next to your photos in the live feed.
            </p>
            <input
              ref={nameInputRef}
              type="text"
              placeholder="e.g. Maya or Cousin Dave"
              defaultValue={guestName}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              className="mb-4 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSkipName}
                className="flex-1 rounded-full border border-zinc-700 py-3 text-sm font-medium text-zinc-400 hover:text-white"
              >
                Post as Guest
              </button>
              <button
                type="button"
                onClick={handleNameSubmit}
                className="flex-1 rounded-full bg-white py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        Sticky Bottom Bar with z-30:
        Completely hidden when the name modal is open to avoid obscuring modal actions.
      */}
      {!showNamePrompt && (
        <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-auto flex justify-center p-4 pb-6">
          <label
            htmlFor="jusnap-photo-input"
            onClick={() => console.log("Add Photos tapped")}
            className={`flex items-center gap-2.5 rounded-full border border-zinc-700 bg-zinc-900/90 px-6 py-3.5 text-base font-semibold text-white shadow-2xl backdrop-blur-xl transition-all hover:border-zinc-500 hover:bg-zinc-800 active:scale-95 cursor-pointer select-none ${
              uploading ? "opacity-70 pointer-events-none" : ""
            }`}
          >
            {/* 
              Semantic native input linked to label.
              Directly triggered by native browser behavior on user tap.
            */}
            <input
              id="jusnap-photo-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={uploading}
              className="sr-only opacity-0 absolute w-0 h-0 pointer-events-none"
              tabIndex={-1}
              aria-hidden="true"
            />

            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Uploading {progress}/{total}...
              </>
            ) : done ? (
              <>
                <Check className="h-5 w-5 text-emerald-400" />
                Uploaded!
              </>
            ) : (
              <>
                <Camera className="h-5 w-5" />
                Add Photos
              </>
            )}
          </label>
        </div>
      )}
    </>
  )
}
