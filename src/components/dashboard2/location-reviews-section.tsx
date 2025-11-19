"use client"

import { Star, Facebook } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Location } from "@/types/location"

interface LocationReviewsSectionProps {
  location: Location
}

export function LocationReviewsSection({ location }: LocationReviewsSectionProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
        <span className="ml-2 text-lg font-semibold">{rating.toFixed(1)}</span>
      </div>
    )
  }

  const hasReviews = location.googleRating || location.facebookRating

  if (!hasReviews) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Online Reviews</CardTitle>
        <CardDescription>Customer ratings and feedback</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {location.googleRating && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <CardTitle className="text-lg">Google Reviews</CardTitle>
              </div>
              {renderStars(location.googleRating)}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Reviews</span>
                  <span className="text-lg font-semibold">
                    {location.googleReviews ? location.googleReviews.toLocaleString() : 'N/A'}
                  </span>
                </div>
                {location.googleVotes && (
                  <div className="text-xs text-muted-foreground">
                    Based on {location.googleVotes.toLocaleString()} votes
                  </div>
                )}
                <Progress value={(location.googleRating || 0) * 20} className="h-2" />
              </div>
            </div>
          )}

          {location.facebookRating && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Facebook className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Facebook Reviews</CardTitle>
              </div>
              {renderStars(location.facebookRating)}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Reviews</span>
                  <span className="text-lg font-semibold">
                    {location.facebookReviews ? location.facebookReviews.toLocaleString() : 'N/A'}
                  </span>
                </div>
                {location.facebookVotes && (
                  <div className="text-xs text-muted-foreground">
                    Based on {location.facebookVotes.toLocaleString()} votes
                  </div>
                )}
                <Progress value={(location.facebookRating || 0) * 20} className="h-2" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

