"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/ui/footer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Users, Briefcase, Play, ArrowRight, Send, X, Calendar, Upload, FileText } from "lucide-react"
import Link from "next/link"
import { FloatingChatWidget } from "@/components/chat/floating-chat-widget"
import { createInstantMessage } from "@/lib/message-utils"
import { createEventInvitation } from "@/lib/event-utils"
import type { AudienceSize, TravelExpenses } from "@/lib/types/database"

export default function HomePage() {
  const [showQuickMessage, setShowQuickMessage] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showEventInvitation, setShowEventInvitation] = useState(false)
  const [showEventSuccess, setShowEventSuccess] = useState(false)
  const [showQuickMessageSuccess, setShowQuickMessageSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [messageForm, setMessageForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const [eventForm, setEventForm] = useState({
    eventTitle: "",
    organiserName: "",
    eventDate: "",
    eventTime: "",
    venue: "",
    audienceSize: "" as AudienceSize | "",
    travelExpenses: "" as TravelExpenses | "",
    eventDetails: "",
    attachment: null as File | null,
  })

  const [quickMessageForm, setQuickMessageForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const [eventErrors, setEventErrors] = useState<Record<string, string>>({})
  const [quickMessageErrors, setQuickMessageErrors] = useState<Record<string, string>>({})

  const validateEventForm = () => {
    const errors: Record<string, string> = {}

    if (!eventForm.eventTitle.trim()) errors.eventTitle = "Event title is required"
    if (!eventForm.organiserName.trim()) errors.organiserName = "Organiser name is required"
    if (!eventForm.eventDate) errors.eventDate = "Event date is required"
    if (!eventForm.eventTime) errors.eventTime = "Event time is required"
    if (!eventForm.venue.trim()) errors.venue = "Venue is required"
    if (!eventForm.audienceSize) errors.audienceSize = "Audience size is required"
    if (!eventForm.travelExpenses) errors.travelExpenses = "Travel expenses option is required"
    if (!eventForm.eventDetails.trim()) errors.eventDetails = "Event details are required"
    else if (eventForm.eventDetails.trim().length < 20)
      errors.eventDetails = "Event details must be at least 20 characters"

    setEventErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateQuickMessageForm = () => {
    const errors: Record<string, string> = {}

    // Name validation
    if (!quickMessageForm.name.trim()) {
      errors.name = "Name is required"
    } else if (quickMessageForm.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters"
    }

    // Email validation
    if (!quickMessageForm.email.trim()) {
      errors.email = "Email address is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(quickMessageForm.email)) {
      errors.email = "Please enter a valid email address"
    }

    // Phone validation
    if (!quickMessageForm.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!/^[+]?[1-9][\d\s\-()]{7,15}$/.test(quickMessageForm.phone.replace(/[\s\-()]/g, ""))) {
      errors.phone = "Please enter a valid phone number with country code"
    }

    // Message validation
    if (!quickMessageForm.message.trim()) {
      errors.message = "Message is required"
    } else if (quickMessageForm.message.trim().length < 10) {
      errors.message = "Please provide at least 10 characters describing your message"
    }

    setQuickMessageErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateEventForm()) {
      setIsSubmitting(true)
      
      try {
        // TODO: Handle file upload to storage if attachment exists
        let attachmentUrl = null
        let attachmentName = null
        
        if (eventForm.attachment) {
          attachmentName = eventForm.attachment.name
          // For now, we'll just store the filename
          // In a real implementation, you'd upload to Supabase Storage
        }

        const result = await createEventInvitation({
          eventTitle: eventForm.eventTitle,
          organiserName: eventForm.organiserName,
          eventDate: eventForm.eventDate,
          eventTime: eventForm.eventTime,
          venue: eventForm.venue,
          audienceSize: eventForm.audienceSize as AudienceSize,
          travelExpenses: eventForm.travelExpenses as TravelExpenses,
          eventDetails: eventForm.eventDetails,
          attachmentUrl,
          attachmentName,
        })

        if (result.success) {
          setShowEventInvitation(false)
          setShowEventSuccess(true)
          // Reset form
          setEventForm({
            eventTitle: "",
            organiserName: "",
            eventDate: "",
            eventTime: "",
            venue: "",
            audienceSize: "",
            travelExpenses: "",
            eventDetails: "",
            attachment: null,
          })
          setEventErrors({})
        } else {
          alert("Failed to submit event invitation. Please try again.")
        }
      } catch (error) {
        console.error("Error submitting event invitation:", error)
        alert("Failed to submit event invitation. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    }
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
          // Reset form
          setQuickMessageForm({ name: "", email: "", phone: "", message: "" })
          setQuickMessageErrors({})
          // Hide success message after 5 seconds
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setEventErrors({ ...eventErrors, attachment: "File size must be less than 10MB" })
        return
      }
      setEventForm({ ...eventForm, attachment: file })
      setEventErrors({ ...eventErrors, attachment: "" })
    }
  }

  const handleOriginalQuickMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!messageForm.name || !messageForm.email || !messageForm.message) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createInstantMessage({
        name: messageForm.name,
        email: messageForm.email,
        phone: messageForm.phone,
        message: messageForm.message,
      })

      if (result.success) {
        setShowQuickMessage(false)
        setShowSuccessPopup(true)
        // Reset form
        setMessageForm({ name: "", email: "", phone: "", message: "" })
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <main className="flex-1">
        <section className="relative h-48 md:h-56 lg:h-64 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/banner-LICKUlyH7fjk60jaGNzfb3DGBhMHBb.jpeg"
              alt="Team banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>
          </div>

          {/* Profile Picture - LinkedIn style positioning */}
          <div className="absolute bottom-2 left-8 transform translate-y-1/4 z-20">
            <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo-dptwSHHbKZmmXutTPGEZwEbRKBLQQh.jpeg"
                alt="Irfan Malik"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16 pb-20 lg:pt-20 lg:pb-32 border-b border-slate-700">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(56,189,248,0.3),transparent_50%)]"></div>
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.3),transparent_50%)]"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-12">
              <div className="space-y-6 mt-4 lg:mt-8">
                <h1 className="heading-font text-5xl sm:text-6xl lg:text-7xl text-white">Hi, I'm Irfan Malik</h1>
                <div className="text-xl sm:text-2xl text-cyan-100 max-w-4xl mx-auto font-medium leading-relaxed">
                  <span className="block">Founder & CEO of Xeven Solutions</span>
                  <span className="block">AI Analyst, and Business Consultant</span>
                </div>
                <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  To ensure I can give every conversation the attention it deserves, I've shifted to appointment-based
                  meetings. Kindly book a slot via my link.
                </p>

                <div className="max-w-2xl mx-auto mt-8 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                  <h3 className="text-xl font-semibold text-white mb-4">Quick Message</h3>
                  {showQuickMessageSuccess && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                      Thank you for your message. We will review and respond shortly.
                    </div>
                  )}
                  <form onSubmit={handleQuickMessageSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="quick-name" className="text-slate-300 font-medium">
                          Name *
                        </Label>
                        <Input
                          id="quick-name"
                          value={quickMessageForm.name}
                          onChange={(e) => setQuickMessageForm({ ...quickMessageForm, name: e.target.value })}
                          className={`mt-1 bg-slate-700 border-slate-600 text-white ${quickMessageErrors.name ? "border-red-500" : ""}`}
                          placeholder="Your full name"
                          disabled={isSubmitting}
                        />
                        {quickMessageErrors.name && (
                          <p className="text-red-400 text-sm mt-1">{quickMessageErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="quick-email" className="text-slate-300 font-medium">
                          Email *
                        </Label>
                        <Input
                          id="quick-email"
                          type="email"
                          value={quickMessageForm.email}
                          onChange={(e) => setQuickMessageForm({ ...quickMessageForm, email: e.target.value })}
                          className={`mt-1 bg-slate-700 border-slate-600 text-white ${quickMessageErrors.email ? "border-red-500" : ""}`}
                          placeholder="your.email@example.com"
                          disabled={isSubmitting}
                        />
                        {quickMessageErrors.email && (
                          <p className="text-red-400 text-sm mt-1">{quickMessageErrors.email}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="quick-phone" className="text-slate-300 font-medium">
                        Phone *
                      </Label>
                      <Input
                        id="quick-phone"
                        value={quickMessageForm.phone}
                        onChange={(e) => setQuickMessageForm({ ...quickMessageForm, phone: e.target.value })}
                        className={`mt-1 bg-slate-700 border-slate-600 text-white ${quickMessageErrors.phone ? "border-red-500" : ""}`}
                        placeholder="+1 (555) 123-4567"
                        disabled={isSubmitting}
                      />
                      {quickMessageErrors.phone && (
                        <p className="text-red-400 text-sm mt-1">{quickMessageErrors.phone}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="quick-message" className="text-slate-300 font-medium">
                        Message *
                      </Label>
                      <Textarea
                        id="quick-message"
                        rows={3}
                        value={quickMessageForm.message}
                        onChange={(e) => setQuickMessageForm({ ...quickMessageForm, message: e.target.value })}
                        className={`mt-1 bg-slate-700 border-slate-600 text-white ${quickMessageErrors.message ? "border-red-500" : ""}`}
                        placeholder="Your message..."
                        disabled={isSubmitting}
                      />
                      {quickMessageErrors.message && (
                        <p className="text-red-400 text-sm mt-1">{quickMessageErrors.message}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Submit Message"}
                    </Button>
                  </form>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 justify-center items-center max-w-5xl mx-auto">
                <Button
                  onClick={() => setShowEventInvitation(true)}
                  className="btn-hero btn-secondary w-full lg:w-auto min-w-[320px] h-20"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Calendar className="w-8 h-8 mr-4" />
                      <div className="text-left">
                        <div className="text-xl font-bold">Invite for An Event</div>
                        <div className="text-sm opacity-90">Speaking & Consultation</div>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </Button>
                <Button asChild className="btn-hero btn-secondary w-full lg:w-auto min-w-[320px] h-20">
                  <Link href="/business" className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Briefcase className="w-8 h-8 mr-4" />
                      <div className="text-left">
                        <div className="text-xl font-bold">Business Consultation</div>
                        <div className="text-sm opacity-90">Strategic AI Implementation</div>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6" />
                  </Link>
                </Button>
                <Button asChild className="btn-hero btn-secondary w-full lg:w-auto min-w-[320px] h-20">
                  <Link href="/student" className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-8 h-8 mr-4" />
                      <div className="text-left">
                        <div className="text-xl font-bold">Student Sessions</div>
                        <div className="text-sm opacity-90">Career & Learning Guidance</div>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6" />
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 justify-center items-center">
                <Button
                  variant="outline"
                  asChild
                  className="rounded-lg border-2 border-cyan-400/50 text-cyan-100 hover:bg-cyan-400 hover:text-slate-900 transition-colors bg-transparent"
                >
                  <a
                    href="https://irfangpt.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <MessageSquare className="w-5 h-5 mr-3" />
                    Chat with IrfanGPT
                    <span className="ml-3 text-xs bg-green-400 text-green-900 px-2 py-1 rounded-full font-medium">
                      Free
                    </span>
                  </a>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="rounded-lg border-2 border-blue-400/50 text-blue-100 hover:bg-blue-400 hover:text-slate-900 transition-colors bg-transparent"
                >
                  <a
                    href="https://xevengpt.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <Play className="w-5 h-5 mr-3" />
                    Know more about Xeven
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-slate-100 to-cyan-50 border-b border-slate-200">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 right-10 w-40 h-40 border border-cyan-400 rounded-full"></div>
            <div className="absolute bottom-20 left-20 w-32 h-32 border border-blue-400 rounded-full"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="heading-font text-4xl text-slate-800 mb-6">Recognition & Milestones</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Grateful for the opportunities to be recognized along my professional journey.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src="/business-workshop-presentation.jpg"
                  alt="Business workshop presentation"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src="/ai-consultation-meeting.jpg"
                  alt="AI consultation meeting"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src="/speaking-at-tech-conference.jpg"
                  alt="Speaking at tech conference"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src="/student-mentoring-session.jpg"
                  alt="Student mentoring session"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src="/team-strategy-meeting.jpg"
                  alt="Team strategy meeting"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src="/ai-technology-demonstration.jpg"
                  alt="AI technology demonstration"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src="/business-networking-event.png"
                  alt="Business networking event"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img
                  src="/educational-workshop-session.jpg"
                  alt="Educational workshop session"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {showQuickMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900">Send a Quick Message</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowQuickMessage(false)} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleOriginalQuickMessageSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-slate-700 font-medium">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    required
                    value={messageForm.name}
                    onChange={(e) => setMessageForm({ ...messageForm, name: e.target.value })}
                    className="mt-1"
                    placeholder="Your full name"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={messageForm.email}
                    onChange={(e) => setMessageForm({ ...messageForm, email: e.target.value })}
                    className="mt-1"
                    placeholder="your.email@example.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-slate-700 font-medium">
                    Phone (Optional)
                  </Label>
                  <Input
                    id="phone"
                    value={messageForm.phone}
                    onChange={(e) => setMessageForm({ ...messageForm, phone: e.target.value })}
                    className="mt-1"
                    placeholder="+1 (555) 123-4567"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-slate-700 font-medium">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    rows={4}
                    required
                    value={messageForm.message}
                    onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                    className="mt-1"
                    placeholder="Your message..."
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowQuickMessage(false)} 
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Message Sent!</h3>
            <p className="text-slate-600 mb-6">
              Your message has been sent to Irfan Malik with your phone and email. He will get back to you as soon as
              possible.
            </p>
            <Button onClick={() => setShowSuccessPopup(false)} className="bg-blue-600 hover:bg-blue-700 text-white">
              Close
            </Button>
          </div>
        </div>
      )}

      {showEventInvitation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold">Event Invitation</h3>
                  <p className="text-blue-100 text-sm mt-1">Fill in the details below</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEventInvitation(false)}
                  className="h-10 w-10 p-0 hover:bg-white/20 text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <form onSubmit={handleEventSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="eventTitle" className="text-slate-700 font-semibold flex items-center gap-2">
                    Event Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="eventTitle"
                    value={eventForm.eventTitle}
                    onChange={(e) => setEventForm({ ...eventForm, eventTitle: e.target.value })}
                    className={`rounded-lg ${eventErrors.eventTitle ? "border-red-500 focus:ring-red-500" : ""}`}
                    placeholder="AI in Business Conference"
                  />
                  {eventErrors.eventTitle && <p className="text-red-500 text-sm">{eventErrors.eventTitle}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organiserName" className="text-slate-700 font-semibold flex items-center gap-2">
                    Organiser Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="organiserName"
                    value={eventForm.organiserName}
                    onChange={(e) => setEventForm({ ...eventForm, organiserName: e.target.value })}
                    className={`rounded-lg ${eventErrors.organiserName ? "border-red-500 focus:ring-red-500" : ""}`}
                    placeholder="Your organization name"
                  />
                  {eventErrors.organiserName && <p className="text-red-500 text-sm">{eventErrors.organiserName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="eventDate" className="text-slate-700 font-semibold flex items-center gap-2">
                    Event Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={eventForm.eventDate}
                    onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                    className={`rounded-lg ${eventErrors.eventDate ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {eventErrors.eventDate && <p className="text-red-500 text-sm">{eventErrors.eventDate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventTime" className="text-slate-700 font-semibold flex items-center gap-2">
                    Event Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="eventTime"
                    type="time"
                    value={eventForm.eventTime}
                    onChange={(e) => setEventForm({ ...eventForm, eventTime: e.target.value })}
                    className={`rounded-lg ${eventErrors.eventTime ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {eventErrors.eventTime && <p className="text-red-500 text-sm">{eventErrors.eventTime}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue" className="text-slate-700 font-semibold flex items-center gap-2">
                  Venue <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="venue"
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  className={`rounded-lg ${eventErrors.venue ? "border-red-500 focus:ring-red-500" : ""}`}
                  placeholder="Conference Center, City"
                />
                {eventErrors.venue && <p className="text-red-500 text-sm">{eventErrors.venue}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="audienceSize" className="text-slate-700 font-semibold flex items-center gap-2">
                  Audience Size <span className="text-red-500">*</span>
                </Label>
                <select
                  id="audienceSize"
                  value={eventForm.audienceSize}
                  onChange={(e) => setEventForm({ ...eventForm, audienceSize: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${eventErrors.audienceSize ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select audience size</option>
                  <option value="<50">Less than 50</option>
                  <option value="50-100">50 - 100</option>
                  <option value="100-250">100 - 250</option>
                  <option value="250-500">250 - 500</option>
                  <option value="500+">500+</option>
                </select>
                {eventErrors.audienceSize && <p className="text-red-500 text-sm">{eventErrors.audienceSize}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 font-semibold flex items-center gap-2">
                  Will the organiser cover travelling expenses? <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col sm:flex-row gap-4">
                  {["Yes", "No", "Partial"].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center justify-center px-6 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                        eventForm.travelExpenses === option
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="travelExpenses"
                        value={option}
                        checked={eventForm.travelExpenses === option}
                        onChange={(e) => setEventForm({ ...eventForm, travelExpenses: e.target.value })}
                        className="mr-3"
                      />
                      <span className="font-medium">{option}</span>
                    </label>
                  ))}
                </div>
                {eventErrors.travelExpenses && <p className="text-red-500 text-sm">{eventErrors.travelExpenses}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventDetails" className="text-slate-700 font-semibold flex items-center gap-2">
                  Event Details <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="eventDetails"
                  rows={5}
                  value={eventForm.eventDetails}
                  onChange={(e) => setEventForm({ ...eventForm, eventDetails: e.target.value })}
                  className={`rounded-lg ${eventErrors.eventDetails ? "border-red-500 focus:ring-red-500" : ""}`}
                  placeholder="Please provide details about the event, topics to be covered, and any specific requirements..."
                />
                <div className="flex justify-between items-center text-sm">
                  {eventErrors.eventDetails && <p className="text-red-500">{eventErrors.eventDetails}</p>}
                  <p className="text-slate-500 ml-auto">{eventForm.eventDetails.length} characters</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachment" className="text-slate-700 font-semibold flex items-center gap-2">
                  Attachment <span className="text-slate-500 text-sm font-normal">(Optional, max 10MB)</span>
                </Label>
                <div className="relative">
                  <input
                    id="attachment"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  <label
                    htmlFor="attachment"
                    className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <Upload className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-600">
                      {eventForm.attachment ? eventForm.attachment.name : "Click to upload event details or agenda"}
                    </span>
                  </label>
                  {eventForm.attachment && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <FileText className="w-4 h-4" />
                      <span>{eventForm.attachment.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEventForm({ ...eventForm, attachment: null })}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {eventErrors.attachment && <p className="text-red-500 text-sm mt-1">{eventErrors.attachment}</p>}
                </div>
                <p className="text-xs text-slate-500">Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEventInvitation(false)}
                  className="flex-1 rounded-lg h-12"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Invitation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEventSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Invitation Sent!</h3>
            <p className="text-slate-600 mb-6">
              Thank you for your invitation. We will review the details and get back to you with confirmation.
            </p>
            <Button onClick={() => setShowEventSuccess(false)} className="bg-blue-600 hover:bg-blue-700 text-white">
              Close
            </Button>
          </div>
        </div>
      )}

      <Footer />
      <FloatingChatWidget />
    </div>
  )
}
