import { useRouter } from "next/router"
import { useEffect } from "react"

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home after 2 seconds
    const timer = setTimeout(() => {
      router.push("/")
    }, 2000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-gray-600 mb-4">This page could not be found.</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Home
        </button>
      </div>
    </div>
  )
}

