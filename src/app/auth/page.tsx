"use client"

import { useState, useTransition } from "react"
import { login, signup } from "./actions"
import { Camera } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const action = isSignUp ? signup : login
      const result = await action(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    // full page centered, dark bg already from layout
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in-scale">
        {/* Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Jusnap</span>
          </div>

          {/* Toggle */}
          <div className="flex mb-6 rounded-xl bg-zinc-800 p-1">
            <button
              onClick={() => { setIsSignUp(false); setError(null); }}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
                !isSignUp ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-300"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(null); }}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
                isSignUp ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-300"
              )}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form action={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm text-zinc-400">Email</label>
              <input id="email" name="email" type="email" required placeholder="you@example.com"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500" />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm text-zinc-400">Password</label>
              <input id="password" name="password" type="password" required placeholder="••••••••" minLength={6}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500" />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button type="submit" disabled={isPending}
              className="mt-2 flex h-12 items-center justify-center rounded-full bg-white text-base font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-50">
              {isPending ? "Please wait..." : (isSignUp ? "Create Account" : "Sign In")}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
