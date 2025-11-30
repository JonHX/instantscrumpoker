import "@/app/globals.css"
import type { AppProps } from "next/app"
import { useEffect } from "react"

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Apply saved theme on mount
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark")
    }
  }, [])

  return <Component {...pageProps} />
}

