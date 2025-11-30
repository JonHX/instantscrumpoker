"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function PokerRoomSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="h-8 w-32 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Voting Card Skeleton */}
          <Card className="bg-card border-border p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-7 w-40 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-4 w-16 rounded ml-auto" />
                <Skeleton className="h-8 w-12 rounded ml-auto" />
              </div>
            </div>

            {/* Poker Cards Skeleton */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          </Card>

          {/* Action Buttons Skeleton */}
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-12 flex-1 rounded-lg" />
            <Skeleton className="h-12 flex-1 rounded-lg" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div>
          <Card className="bg-card border-border p-6 space-y-4">
            <Skeleton className="h-6 w-32 rounded" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

