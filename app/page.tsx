"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/ui/footer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Users, Briefcase, Play, ArrowRight, Calendar, Mic } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { FloatingChatWidget } from "@/components/chat/floating-chat-widget"
import { createInstantMessage } from "@/lib/message-utils"

interface GalleryImage {
  id: string
  url: string
  title: string
  description?: string
}

export default function HomePage() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [showQuickMessageSuccess, setShowQuickMessageSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [quickMessageForm, setQuickMessageForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const [quickMessageErrors, setQuickMessageErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchGalleryImages()
  }, [])

  const fetchGalleryImages = async () => {
    try {
      const { supabase } = await import("@/lib/supabase")

      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('order', { ascending: true })
        .limit(8) // Show 8 images as in the original design

      if (error) {
        console.error('Error fetching gallery images:', error)
        return
      }

      setGalleryImages(data || [])
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const validateQuickMessageForm = () => {
    const errors: Record<string, string> = {}

    if (!quickMessageForm.name.trim()) errors.name = "Name is required"
    if (!quickMessageForm.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(quickMessageForm.email)) {
      errors.email = "Please enter a valid email address"
    }
    if (!quickMessageForm.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!/^[+]?[1-9][\d]{0,15}$/.test(quickMessageForm.phone.replace(/[\s\-()]/g, ""))) {
      errors.phone = "Please enter a valid phone number with country code"
    }
    if (!quickMessageForm.message.trim()) errors.message = "Message is required"
    else if (quickMessageForm.message.trim().length < 10) errors.message = "Message must be at least 10 characters"

    setQuickMessageErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleQuickMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateQuickMessageForm()) {
      setIsSubmitting(true)
      
      try {
        const result = await createInstantMessage({
          name: quickMessageForm.name,
          email: quickMessageForm.email,
          phone: quickMessageForm.phone,
          message: quickMessageForm.message,
        })

        if (result.success) {
          setShowQuickMessageSuccess(true)
          setQuickMessageForm({ name: "", email: "", phone: "", message: "" })
          setQuickMessageErrors({})
          setTimeout(() => setShowQuickMessageSuccess(false), 5000)
        } else {
          alert("Failed to send message. Please try again.")
        }
      } catch (error) {
        console.error("Error submitting message:", error)
        alert("Failed to send message. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <main className="flex-1">
        <section className="relative h-32 sm:h-40 md:h-48 lg:h-56 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/banner-LICKUlyH7fjk60jaGNzfb3DGBhMHBb.jpeg"
              alt="Team banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>
          </div>

          <div className="absolute bottom-0 left-4 sm:left-6 md:left-8 transform translate-y-1/3 sm:translate-y-1/4 z-20">
            <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full border-3 sm:border-4 border-white shadow-2xl overflow-hidden bg-white">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo-dptwSHHbKZmmXutTPGEZwEbRKBLQQh.jpeg"
                alt="Irfan Malik"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-12 sm:pt-14 md:pt-16 lg:pt-20 pb-12 sm:pb-16 md:pb-20 lg:pb-32 border-b border-slate-700">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(56,189,248,0.3),transparent_50%)]"></div>
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.3),transparent_50%)]"></div>
          </div>
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-8 sm:space-y-10 md:space-y-12">
              <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 mt-2 sm:mt-4 md:mt-6 lg:mt-8">
                <h1 className="heading-font text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white leading-tight">
                  Hi, I'm Irfan Malik
                </h1>
                <div className="text-sm sm:text-base md:text-lg lg:text-xl text-cyan-100 max-w-4xl mx-auto font-medium leading-relaxed space-y-1 sm:space-y-2">
                  <span className="block">Founder & CEO of Xeven Solutions</span>
                  <span className="block">AI Analyst, and Business Consultant</span>
                </div>
                <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed px-2">
                  To give every conversation my full attention, I now take meetings by appointment. Please book a slot
                  or drop me a quick message.
                </p>

                <div className="max-w-2xl mx-auto mt-6 sm:mt-8 p-4 sm:p-5 md:p-6 bg-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-700">
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-white mb-3 sm:mb-4">
                    Quick Message
                  </h3>
                  {showQuickMessageSuccess && (
                    <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                      Thank you for your message. We will review and respond shortly.
                    </div>
                  )}
                  <form onSubmit={handleQuickMessageSubmit} className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="quick-name" className="text-slate-300 font-medium text-xs sm:text-sm">
                          Name *
                        </Label>
                        <Input
                          id="quick-name"
                          value={quickMessageForm.name}
                          onChange={(e) => setQuickMessageForm({ ...quickMessageForm, name: e.target.value })}
                          className={`mt-1 bg-slate-700 border-slate-600 text-white h-9 sm:h-10 md:h-11 text-xs sm:text-sm ${quickMessageErrors.name ? "border-red-500" : ""}`}
                          placeholder="Your full name"
                          disabled={isSubmitting}
                        />
                        {quickMessageErrors.name && (
                          <p className="text-red-400 text-[10px] sm:text-xs mt-1">{quickMessageErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="quick-email" className="text-slate-300 font-medium text-xs sm:text-sm">
                          Email *
                        </Label>
                        <Input
                          id="quick-email"
                          type="email"
                          value={quickMessageForm.email}
                          onChange={(e) => setQuickMessageForm({ ...quickMessageForm, email: e.target.value })}
                          className={`mt-1 bg-slate-700 border-slate-600 text-white h-9 sm:h-10 md:h-11 text-xs sm:text-sm ${quickMessageErrors.email ? "border-red-500" : ""}`}
                          placeholder="your.email@example.com"
                          disabled={isSubmitting}
                        />
                        {quickMessageErrors.email && (
                          <p className="text-red-400 text-[10px] sm:text-xs mt-1">{quickMessageErrors.email}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="quick-phone" className="text-slate-300 font-medium text-xs sm:text-sm">
                        Phone *
                      </Label>
                      <Input
                        id="quick-phone"
                        value={quickMessageForm.phone}
                        onChange={(e) => setQuickMessageForm({ ...quickMessageForm, phone: e.target.value })}
                        className={`mt-1 bg-slate-700 border-slate-600 text-white h-9 sm:h-10 md:h-11 text-xs sm:text-sm ${quickMessageErrors.phone ? "border-red-500" : ""}`}
                        placeholder="+1 (555) 123-4567"
                        disabled={isSubmitting}
                      />
                      {quickMessageErrors.phone && (
                        <p className="text-red-400 text-[10px] sm:text-xs mt-1">{quickMessageErrors.phone}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="quick-message" className="text-slate-300 font-medium text-xs sm:text-sm">
                        Message *
                      </Label>
                      <Textarea
                        id="quick-message"
                        rows={3}
                        value={quickMessageForm.message}
                        onChange={(e) => setQuickMessageForm({ ...quickMessageForm, message: e.target.value })}
                        className={`mt-1 bg-slate-700 border-slate-600 text-white text-xs sm:text-sm ${quickMessageErrors.message ? "border-red-500" : ""}`}
                        placeholder="Your message..."
                        disabled={isSubmitting}
                      />
                      {quickMessageErrors.message && (
                        <p className="text-red-400 text-[10px] sm:text-xs mt-1">{quickMessageErrors.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 sm:h-10 md:h-11 text-xs sm:text-sm md:text-base cursor-pointer"
                      disabled={isSubmitting}
                      style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                    >
                      {isSubmitting ? "Sending..." : "Submit Message"}
                    </Button>
                  </form>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 justify-center items-stretch max-w-5xl mx-auto px-2">
                <Button asChild className="btn-hero btn-secondary w-full h-16 sm:h-18 md:h-20">
                  <Link 
                    href="/interview" 
                    className="flex items-center justify-between px-2"
                    style={{
                      background: 'linear-gradient(to right, #14b8a6, #06b6d4)',
                      color: 'white',
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                      border: 'none',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #0d9488, #0891b2)';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #14b8a6, #06b6d4)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
                    }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                      <Mic className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0" />
                      <div className="text-left">
                        <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">
                          Book Interview / Podcast
                        </div>
                        <div className="text-xs sm:text-sm opacity-90">Media & Content Creation</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
                  </Link>
                </Button>
                <Button asChild className="btn-hero btn-secondary w-full h-16 sm:h-18 md:h-20">
                  <Link 
                    href="/event" 
                    className="flex items-center justify-between px-2"
                    style={{
                      background: 'linear-gradient(to right, #14b8a6, #06b6d4)',
                      color: 'white',
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                      border: 'none',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #0d9488, #0891b2)';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #14b8a6, #06b6d4)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
                    }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0" />
                      <div className="text-left">
                        <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">Invite for An Event</div>
                        <div className="text-xs sm:text-sm opacity-90">Speaking & Consultation</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
                  </Link>
                </Button>
                <Button asChild className="btn-hero btn-secondary w-full h-16 sm:h-18 md:h-20">
                  <Link 
                    href="/business" 
                    className="flex items-center justify-between px-2"
                    style={{
                      background: 'linear-gradient(to right, #14b8a6, #06b6d4)',
                      color: 'white',
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                      border: 'none',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #0d9488, #0891b2)';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #14b8a6, #06b6d4)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
                    }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                      <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0" />
                      <div className="text-left">
                        <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">
                          Business Consultation
                        </div>
                        <div className="text-xs sm:text-sm opacity-90">Strategic AI Implementation</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
                  </Link>
                </Button>
                <Button asChild className="btn-hero btn-secondary w-full h-16 sm:h-18 md:h-20">
                  <Link 
                    href="/student" 
                    className="flex items-center justify-between px-2"
                    style={{
                      background: 'linear-gradient(to right, #14b8a6, #06b6d4)',
                      color: 'white',
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                      border: 'none',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #0d9488, #0891b2)';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #14b8a6, #06b6d4)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
                    }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0" />
                      <div className="text-left">
                        <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">Student Sessions</div>
                        <div className="text-xs sm:text-sm opacity-90">Career & Learning Guidance</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
                  </Link>
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-2">
                <Button
                  variant="outline"
                  asChild
                  className="rounded-lg border-2 border-cyan-400/50 text-cyan-100 hover:bg-cyan-400 hover:text-slate-900 transition-colors bg-transparent h-12 sm:h-auto text-sm sm:text-base"
                >
                  <a
                    href="https://irfangpt.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center"
                  >
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                    <span className="whitespace-nowrap">Chat with IrfanGPT</span>
                    <span className="ml-2 sm:ml-3 text-xs bg-green-400 text-green-900 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium">
                      Free
                    </span>
                  </a>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="rounded-lg border-2 border-blue-400/50 text-blue-100 hover:bg-blue-400 hover:text-slate-900 transition-colors bg-transparent h-12 sm:h-auto text-sm sm:text-base"
                >
                  <a
                    href="https://xevengpt.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                    <span className="whitespace-nowrap">Know more about Xeven</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-slate-100 to-cyan-50 border-b border-slate-200">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 right-10 w-40 h-40 border border-cyan-400 rounded-full"></div>
            <div className="absolute bottom-20 left-20 w-32 h-32 border border-blue-400 rounded-full"></div>
          </div>
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="heading-font text-2xl sm:text-3xl md:text-4xl text-slate-800 mb-3 sm:mb-4 md:mb-6">
                Recognition & Milestones
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto px-2">
                Grateful for the opportunities to be recognized along my professional journey.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {galleryImages.length > 0 ? (
                galleryImages.map((image) => (
                  <div key={image.id} className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
                    <div className="relative w-full h-full">
                      <Image
                        src={image.url}
                        alt={image.title || "Gallery image"}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-slate-500">No images in gallery</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingChatWidget />
    </div>
  )
}
