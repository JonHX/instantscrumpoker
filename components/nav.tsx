"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Moon, Sun } from "lucide-react"

export function Nav() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check initial theme on mount
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme")
      const isDarkMode = savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
      setIsDark(isDarkMode)
      if (isDarkMode) {
        document.documentElement.classList.add("dark")
      }
    }
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    if (newIsDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  return (
    <nav className="w-full border-b border-border bg-card/50 backdrop-blur-sm" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-lg"
          aria-label="InstantScrumPoker home"
        >
          <Image
            src="/logo2.png"
            alt="InstantScrumPoker logo"
            width={32}
            height={32}
            className="w-8 h-8"
            priority
          />
          <span className="text-lg font-bold text-foreground">InstantScrumPoker</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/what-is-scrum-poker"
            className="text-sm font-medium text-foreground hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded px-2 py-1"
          >
            What is Scrum Poker?
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-foreground hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded px-2 py-1"
          >
            About
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            type="button"
          >
            {isDark ? <Sun className="w-5 h-5 text-foreground" aria-hidden="true" /> : <Moon className="w-5 h-5 text-foreground" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </nav>
  )
}

