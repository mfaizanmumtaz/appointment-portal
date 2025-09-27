"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, Trash2, Edit3, Eye, ImageIcon, Plus, X, Check, Move, RefreshCw } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface GalleryImage {
  id: string
  src: string
  alt: string
  title: string
  description?: string
  uploadDate: string
  size: string
  dimensions: string
}

export function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const { toast } = useToast()
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, imageId?: string, count?: number, type: 'single' | 'bulk'}>({isOpen: false, type: 'single'})
  const [draggedImage, setDraggedImage] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchGalleryImages()
  }, [])

  const fetchGalleryImages = async () => {
    setLoading(true)
    try {
      const { supabase } = await import("@/lib/supabase")

      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('order', { ascending: true })

      if (error) {
        console.error('Error fetching gallery images:', error)
        return
      }

      const formattedImages: GalleryImage[] = (data || []).map(img => ({
        id: img.id,
        src: img.url,
        alt: img.title || '',
        title: img.title || '',
        description: img.description || '',
        uploadDate: new Date(img.created_at).toISOString().split('T')[0],
        size: '2.0 MB',
        dimensions: '1920x1080',
      }))

      setImages(formattedImages)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const oldImages = [
    {
      id: "1",
      src: "/business-workshop-presentation.jpg",
      alt: "Business workshop presentation",
      title: "Business Workshop Presentation",
      description: "Leading a strategic business workshop for enterprise clients",
      uploadDate: "2024-01-15",
      size: "2.4 MB",
      dimensions: "1920x1080",
    },
    {
      id: "2",
      src: "/ai-consultation-meeting.jpg",
      alt: "AI consultation meeting",
      title: "AI Consultation Meeting",
      description: "Discussing AI implementation strategies with clients",
      uploadDate: "2024-01-12",
      size: "1.8 MB",
      dimensions: "1920x1080",
    },
    {
      id: "3",
      src: "/speaking-at-tech-conference.jpg",
      alt: "Speaking at tech conference",
      title: "Tech Conference Speaking",
      description: "Keynote presentation on AI trends and business transformation",
      uploadDate: "2024-01-10",
      size: "3.1 MB",
      dimensions: "1920x1080",
    },
    {
      id: "4",
      src: "/student-mentoring-session.jpg",
      alt: "Student mentoring session",
      title: "Student Mentoring Session",
      description: "One-on-one career guidance session with university students",
      uploadDate: "2024-01-08",
      size: "2.0 MB",
      dimensions: "1920x1080",
    },
    {
      id: "5",
      src: "/team-strategy-meeting.jpg",
      alt: "Team strategy meeting",
      title: "Team Strategy Meeting",
      description: "Strategic planning session with the Xeven Solutions team",
      uploadDate: "2024-01-05",
      size: "2.7 MB",
      dimensions: "1920x1080",
    },
    {
      id: "6",
      src: "/ai-technology-demonstration.jpg",
      alt: "AI technology demonstration",
      title: "AI Technology Demo",
      description: "Demonstrating latest AI solutions to potential clients",
      uploadDate: "2024-01-03",
      size: "2.2 MB",
      dimensions: "1920x1080",
    },
    {
      id: "7",
      src: "/business-networking-event.png",
      alt: "Business networking event",
      title: "Business Networking Event",
      description: "Networking with industry leaders at business summit",
      uploadDate: "2024-01-01",
      size: "1.9 MB",
      dimensions: "1920x1080",
    },
    {
      id: "8",
      src: "/educational-workshop-session.jpg",
      alt: "Educational workshop session",
      title: "Educational Workshop",
      description: "Teaching advanced AI concepts to professionals",
      uploadDate: "2023-12-28",
      size: "2.5 MB",
      dimensions: "1920x1080",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-slate-600">Loading gallery...</p>
        </div>
      </div>
    )
  }

  const handleImageSelect = (imageId: string) => {
    setSelectedImages((prev) => (prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]))
  }

  const handleSelectAll = () => {
    setSelectedImages(selectedImages.length === images.length ? [] : images.map((img) => img.id))
  }

  const handleDeleteSelected = () => {
    setDeleteConfirm({isOpen: true, count: selectedImages.length, type: 'bulk'})
  }

  const confirmBulkDelete = () => {
    setImages((prev) => prev.filter((img) => !selectedImages.includes(img.id)))
    setSelectedImages([])
    setDeleteConfirm({isOpen: false, type: 'bulk'})
    toast({
      title: "Success",
      description: `Successfully deleted ${deleteConfirm.count} image(s)!`,
      variant: "default"
    })
  }

  const handleDeleteImage = (imageId: string) => {
    setDeleteConfirm({isOpen: true, imageId, type: 'single'})
  }

  const confirmDeleteImage = () => {
    const imageId = deleteConfirm.imageId
    if (!imageId) return

    setImages((prev) => prev.filter((img) => img.id !== imageId))
    setSelectedImages((prev) => prev.filter((id) => id !== imageId))
    setDeleteConfirm({isOpen: false, type: 'single'})
    toast({
      title: "Success",
      description: "Image deleted successfully!",
      variant: "default"
    })
  }

  const handleEditImage = (image: GalleryImage) => {
    setEditingImage({ ...image })
  }

  const handleSaveEdit = () => {
    if (editingImage) {
      setImages((prev) => prev.map((img) => (img.id === editingImage.id ? editingImage : img)))
      setEditingImage(null)
    }
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    setIsUploading(true)
    setUploadProgress(0)

    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newImage: GalleryImage = {
            id: Date.now().toString() + index,
            src: e.target?.result as string,
            alt: file.name.replace(/\.[^/.]+$/, ""),
            title: file.name
              .replace(/\.[^/.]+$/, "")
              .replace(/-/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            description: "",
            uploadDate: new Date().toISOString().split("T")[0],
            size: (file.size / (1024 * 1024)).toFixed(1) + " MB",
            dimensions: "1920x1080", // Would be determined from actual image
          }

          setImages((prev) => [newImage, ...prev])

          // Simulate upload progress
          const progress = ((index + 1) / files.length) * 100
          setUploadProgress(progress)

          if (index === files.length - 1) {
            setTimeout(() => {
              setIsUploading(false)
              setShowUploadModal(false)
              setUploadProgress(0)
            }, 500)
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleDragStart = (imageId: string) => {
    setDraggedImage(imageId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetImageId: string) => {
    e.preventDefault()
    if (draggedImage && draggedImage !== targetImageId) {
      const draggedIndex = images.findIndex((img) => img.id === draggedImage)
      const targetIndex = images.findIndex((img) => img.id === targetImageId)

      const newImages = [...images]
      const [draggedItem] = newImages.splice(draggedIndex, 1)
      newImages.splice(targetIndex, 0, draggedItem)

      setImages(newImages)
    }
    setDraggedImage(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-font text-3xl font-bold text-foreground mb-2">Gallery Management</h1>
          <p className="text-muted-foreground">Manage images for your homepage gallery</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Upload Images
        </Button>
      </div>

      {/* Gallery Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-calm">
          <CardContent className="p-4 text-center">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{images.length}</p>
            <p className="text-sm text-muted-foreground">Total Images</p>
          </CardContent>
        </Card>
        <Card className="card-calm">
          <CardContent className="p-4 text-center">
            <Check className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">{selectedImages.length}</p>
            <p className="text-sm text-muted-foreground">Selected</p>
          </CardContent>
        </Card>
        <Card className="card-calm">
          <CardContent className="p-4 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">
              {images.reduce((acc, img) => acc + Number.parseFloat(img.size), 0).toFixed(1)} MB
            </p>
            <p className="text-sm text-muted-foreground">Total Size</p>
          </CardContent>
        </Card>
        <Card className="card-calm">
          <CardContent className="p-4 text-center">
            <Eye className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold">Live</p>
            <p className="text-sm text-muted-foreground">Gallery Status</p>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedImages.length > 0 && (
        <Card className="card-calm border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">{selectedImages.length} selected</Badge>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedImages.length === images.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="text-red-600 hover:text-red-700 bg-transparent"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((image) => (
          <Card
            key={image.id}
            className={`card-calm cursor-pointer transition-all hover:shadow-lg ${
              selectedImages.includes(image.id) ? "ring-2 ring-primary" : ""
            } ${draggedImage === image.id ? "opacity-50" : ""}`}
            draggable
            onDragStart={() => handleDragStart(image.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, image.id)}
          >
            <div className="relative">
              <div
                className="aspect-square rounded-t-lg overflow-hidden bg-muted"
                onClick={() => handleImageSelect(image.id)}
              >
                <img
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2">
                  <div
                    className={`w-5 h-5 rounded border-2 border-white ${
                      selectedImages.includes(image.id) ? "bg-primary" : "bg-white/20"
                    } flex items-center justify-center`}
                  >
                    {selectedImages.includes(image.id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <Move className="w-4 h-4 text-white/70" />
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-1 truncate">{image.title}</h3>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{image.description}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>{image.size}</span>
                <span>{image.dimensions}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditImage(image)
                  }}
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(image.src, "_blank")
                  }}
                >
                  <Eye className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-red-600 hover:text-red-700 bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteImage(image.id)
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Upload Images
                <Button variant="ghost" size="sm" onClick={() => setShowUploadModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.add("border-primary")
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove("border-primary")
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove("border-primary")
                  handleFileUpload(e.dataTransfer.files)
                }}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-2">Drop images here or click to browse</p>
                <p className="text-xs text-muted-foreground">Supports JPG, PNG, WebP up to 10MB each</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Edit Image
                <Button variant="ghost" size="sm" onClick={() => setEditingImage(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={editingImage.src || "/placeholder.svg"}
                  alt={editingImage.alt}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editingImage.title}
                    onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="alt">Alt Text</Label>
                  <Input
                    id="alt"
                    value={editingImage.alt}
                    onChange={(e) => setEditingImage({ ...editingImage, alt: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingImage.description || ""}
                    onChange={(e) => setEditingImage({ ...editingImage, description: e.target.value })}
                    className="rounded-xl"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditingImage(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} className="flex-1 btn-primary">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.isOpen} onOpenChange={(open) => setDeleteConfirm({...deleteConfirm, isOpen: open})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteConfirm.type === 'single' ? 'Delete Image' : 'Delete Multiple Images'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm.type === 'single'
                ? 'Are you sure you want to delete this image? This action cannot be undone.'
                : `Are you sure you want to delete ${deleteConfirm.count} selected images? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteConfirm.type === 'single' ? confirmDeleteImage : confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
