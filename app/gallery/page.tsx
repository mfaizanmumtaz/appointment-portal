"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Share2, RefreshCw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface GalleryImage {
  id: string
  url: string
  title: string
  description?: string
  created_at: string
}

export default function GalleryPage() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGalleryImages()
  }, [])

  const fetchGalleryImages = async () => {
    setLoading(true)
    setError(null)
    try {
      const { supabase } = await import("@/lib/supabase")

      const { data, error: fetchError } = await supabase
        .from('gallery_images')
        .select('*')
        .order('order', { ascending: true })
        .limit(8) // Limit to 8 images as requested

      if (fetchError) {
        console.error('Error fetching gallery images:', fetchError)
        setError('Failed to load gallery images')
        return
      }

      setGalleryImages(data || [])
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to load gallery images')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <Button variant="outline" asChild className="mb-6 bg-transparent">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>

            <h1 className="heading-font text-4xl font-bold text-foreground mb-4">Image Gallery</h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Explore moments from workshops, consultations, speaking engagements, and educational sessions.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-muted-foreground">Loading gallery...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchGalleryImages} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Gallery Grid - 2 rows of 4 images each */}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {galleryImages.length > 0 ? (
                galleryImages.map((image) => (
                  <Card key={image.id} className="gallery-item group overflow-hidden">
                    <CardContent className="p-0 h-full relative">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={image.url}
                          alt={image.title || "Gallery image"}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                        
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => {
                                const link = document.createElement('a')
                                link.href = image.url
                                link.download = image.title || 'gallery-image'
                                link.click()
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => {
                                if (navigator.share) {
                                  navigator.share({
                                    title: image.title,
                                    text: image.description,
                                    url: image.url
                                  })
                                } else {
                                  navigator.clipboard.writeText(image.url)
                                }
                              }}
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Image info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-1">{image.title}</h3>
                        {image.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{image.description}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No images in gallery</p>
                </div>
              )}
            </div>
          )}

          {/* Gallery Info */}
          {!loading && !error && galleryImages.length > 0 && (
            <div className="text-center mt-12">
              <p className="text-sm text-muted-foreground">
                Showing {galleryImages.length} featured images
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
