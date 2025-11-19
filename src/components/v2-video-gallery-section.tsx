"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Play, MapPin, Pause } from "lucide-react"
import Link from "next/link"
import { generateSlug } from "@/lib/slug-utils"

interface VideoItem {
  id: number
  location: string
  title: string
  videoSrc?: string
}

const videoCategories: { location: string; videos: VideoItem[] }[] = [
  {
    location: "Highcross Shopping Centre",
    videos: [
      { id: 1, location: "Highcross Shopping Centre", title: "Centre Overview", videoSrc: "/highcross1.mp4" },
      { id: 2, location: "Highcross Shopping Centre", title: "Trader Spotlight" },
      { id: 3, location: "Highcross Shopping Centre", title: "Event Highlights" },
    ]
  },
  {
    location: "One Stop Shopping Centre",
    videos: [
      { id: 4, location: "One Stop Shopping Centre", title: "Centre Tour" },
      { id: 5, location: "One Stop Shopping Centre", title: "Trader Success Story" },
    ]
  },
  {
    location: "Other Locations",
    videos: [
      { id: 6, location: "Various", title: "Trader Montage" },
      { id: 7, location: "Various", title: "Behind the Scenes" },
    ]
  }
]

function VideoCard({ video, category, videoLink }: { video: VideoItem; category: { location: string; videos: VideoItem[] }; videoLink: string }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
      }
    }
  }

  const handleVideoPlay = () => {
    setIsPlaying(true)
  }

  const handleVideoPause = () => {
    setIsPlaying(false)
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
  }

  return (
    <Card className="border-[#D8D8D6] overflow-hidden hover:shadow-lg transition-shadow group">
      <CardContent className="p-0">
        {/* Mobile-sized video aspect ratio */}
        <div className="aspect-[9/16] bg-[#F7F4F2] relative overflow-hidden">
          {video.videoSrc ? (
            <>
              <video
                ref={videoRef}
                src={video.videoSrc}
                className="w-full h-full object-cover cursor-pointer"
                muted
                loop={false}
                playsInline
                onClick={handleVideoClick}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onEnded={handleVideoEnd}
              />
              {!isPlaying && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors cursor-pointer"
                  onClick={handleVideoClick}
                >
                  <div className="bg-white/90 rounded-full p-3 group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 text-[#E6FB60] fill-[#E6FB60]" />
                  </div>
                </div>
              )}
              {isPlaying && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors cursor-pointer"
                  onClick={handleVideoClick}
                >
                  <div className="bg-white/90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pause className="h-8 w-8 text-[#E6FB60] fill-[#E6FB60]" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Play className="h-12 w-12 text-[#E6FB60] mx-auto mb-2" />
                <p className="text-xs text-muted-foreground px-2">{video.title}</p>
              </div>
            </div>
          )}
          {category.location !== "Various" && (
            <div className="absolute bottom-2 left-2 right-2">
              <Link href={videoLink}>
                <p className="text-xs text-[#4D4A46] font-medium bg-white/90 px-2 py-1 rounded text-center truncate hover:bg-white transition-colors cursor-pointer">
                  {category.location}
                </p>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function V2VideoGallerySection() {
  return (
    <section id="video-gallery" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#4D4A46]">
            Video Gallery
          </h2>
          <p className="text-lg text-[#4D4A46] font-medium max-w-2xl mx-auto">
            Explore our locations through video
          </p>
        </div>

        {/* Video Categories */}
        <div className="space-y-12">
          {videoCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="h-5 w-5 text-[#E6FB60]" />
                <h3 className="text-2xl font-bold text-[#4D4A46]">{category.location}</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {category.videos.map((video) => {
                  const slug = generateSlug(category.location)
                  const videoLink = category.location !== "Various" 
                    ? `/locations/${slug}` 
                    : "#"
                  
                  return (
                    <VideoCard 
                      key={video.id}
                      video={video}
                      category={category}
                      videoLink={videoLink}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


