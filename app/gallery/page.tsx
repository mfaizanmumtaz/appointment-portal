import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Share2 } from "lucide-react"
import Link from "next/link"

export default function GalleryPage() {
  const galleryImages = [
    { id: 1, title: "AI Workshop Session", category: "Business" },
    { id: 2, title: "Student Mentoring", category: "Education" },
    { id: 3, title: "Tech Conference Keynote", category: "Speaking" },
    { id: 4, title: "AI Strategy Meeting", category: "Business" },
    { id: 5, title: "University Lecture", category: "Education" },
    { id: 6, title: "Innovation Summit", category: "Speaking" },
    { id: 7, title: "Corporate Training", category: "Business" },
    { id: 8, title: "Research Collaboration", category: "Education" },
  ]

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

          {/* Gallery Grid */}
          <div className="gallery-grid">
            {galleryImages.map((image) => (
              <Card key={image.id} className="gallery-item group">
                <CardContent className="p-0 h-full relative">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold">{image.id}</span>
                      </div>
                      <p className="text-white font-semibold text-sm">{image.title}</p>
                      <p className="text-white/80 text-xs">{image.category}</p>
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button className="btn-large btn-primary">Load More Images</Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
