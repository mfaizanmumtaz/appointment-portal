"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  Upload,
  FileText,
  Users,
  MessageSquare,
  X,
  Home,
  Mic,
  Briefcase,
  Play,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { FloatingChatWidget } from "@/components/chat/floating-chat-widget"
import { createEventInvitation } from "@/lib/event-utils"
import type { AudienceSize, TravelExpenses } from "@/lib/types/database"

export default function EventPage() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [eventForm, setEventForm] = useState({
    eventTitle: "",
    organiserName: "",
    organiserEmail: "",
    eventDate: "",
    eventTime: "",
    venue: "",
    audienceSize: "" as AudienceSize | "",
    travelExpenses: "" as TravelExpenses | "",
    eventDetails: "",
    attachment: null as File | null,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!eventForm.eventTitle.trim()) newErrors.eventTitle = "Event title is required"
    if (!eventForm.organiserName.trim()) newErrors.organiserName = "Organiser name is required"
    if (!eventForm.organiserEmail.trim()) {
      newErrors.organiserEmail = "Organiser email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eventForm.organiserEmail)) {
      newErrors.organiserEmail = "Please enter a valid email address"
    }
    if (!eventForm.eventDate) {
      newErrors.eventDate = "Event date is required"
    } else {
      const selectedDate = new Date(eventForm.eventDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (isNaN(selectedDate.getTime())) {
        newErrors.eventDate = "Please enter a valid date"
      } else if (selectedDate < today) {
        newErrors.eventDate = "Event date cannot be in the past"
      }
    }
    if (!eventForm.eventTime) newErrors.eventTime = "Event time is required"
    if (!eventForm.venue.trim()) newErrors.venue = "Venue is required"
    if (!eventForm.audienceSize) newErrors.audienceSize = "Audience size is required"
    if (!eventForm.travelExpenses) newErrors.travelExpenses = "Travel expenses option is required"
    if (!eventForm.eventDetails.trim()) newErrors.eventDetails = "Event details are required"
    else if (eventForm.eventDetails.trim().length < 20)
      newErrors.eventDetails = "Event details must be at least 20 characters"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setIsSubmitting(true)
      
      try {
        // Handle file upload to Supabase Storage if attachment exists
        let attachmentUrl = null
        let attachmentName = null
        
        if (eventForm.attachment) {
          attachmentName = eventForm.attachment.name
          
          // Upload file to Supabase Storage
          const { supabase } = await import("@/lib/supabase")
          const fileExt = eventForm.attachment.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
          const filePath = `event-attachments/${fileName}`
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('event-attachments')
            .upload(filePath, eventForm.attachment, {
              cacheControl: '3600',
              upsert: false
            })
          
          if (uploadError) {
            console.error('Upload error:', uploadError)
            alert('Failed to upload attachment. Please try again.')
            setIsSubmitting(false)
            return
          }
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('event-attachments')
            .getPublicUrl(filePath)
          
          attachmentUrl = publicUrl
        }

        const result = await createEventInvitation({
          eventTitle: eventForm.eventTitle,
          organiserName: eventForm.organiserName,
          organiserEmail: eventForm.organiserEmail,
          eventDate: eventForm.eventDate,
          eventTime: eventForm.eventTime,
          venue: eventForm.venue,
          audienceSize: eventForm.audienceSize as AudienceSize,
          travelExpenses: eventForm.travelExpenses as TravelExpenses,
          eventDetails: eventForm.eventDetails,
          attachmentUrl: attachmentUrl || undefined,
          attachmentName: attachmentName || undefined,
        })

        if (result.success) {
          setShowSuccess(true)
          setEventForm({
            eventTitle: "",
            organiserName: "",
            organiserEmail: "",
            eventDate: "",
            eventTime: "",
            venue: "",
            audienceSize: "",
            travelExpenses: "",
            eventDetails: "",
            attachment: null,
          })
          setErrors({})
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, attachment: "File size must be less than 10MB" })
        return
      }
      setEventForm({ ...eventForm, attachment: file })
      setErrors({ ...errors, attachment: "" })
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-orange-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Calendar className="w-10 h-10 text-teal-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Invitation Sent!</h3>
          <p className="text-slate-600 text-base leading-relaxed mb-8">
            Thank you for your invitation. We will review the details and get back to you with confirmation.
          </p>
          <Button
            asChild
            className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl h-12 font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 text-white p-4 sm:p-5 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-9 px-3 hover:bg-white/20 text-white rounded-xl transition-all text-sm"
              >
                <Link href="/" className="flex items-center gap-2">
                  <Home className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Home</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-9 px-3 hover:bg-white/20 text-white rounded-xl transition-all text-sm"
              >
                <Link href="/admin" className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 bg-orange-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">A</span>
                  </div>
                  <span className="hidden xs:inline">Admin</span>
                </Link>
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Invite for An Event</h3>
            </div>
            <p className="text-teal-50 text-xs sm:text-sm ml-10 sm:ml-13">
              Share your event details and let's make it memorable
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto p-6 sm:p-8 space-y-6 sm:space-y-8 bg-gradient-to-br from-teal-50 to-orange-50"
      >
        <div className="space-y-4 sm:space-y-6">
          <h4 className="text-sm sm:text-base md:text-lg font-bold text-teal-900 flex items-center gap-2 pb-2 border-b-2 border-teal-200">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            Event Information
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <Label
                htmlFor="eventTitle"
                className="text-slate-700 font-semibold text-xs sm:text-sm md:text-base flex items-center gap-2"
              >
                Event Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="eventTitle"
                value={eventForm.eventTitle}
                onChange={(e) => setEventForm({ ...eventForm, eventTitle: e.target.value })}
                className={`rounded-xl h-10 sm:h-11 md:h-12 border-2 bg-white transition-all text-xs sm:text-sm md:text-base ${errors.eventTitle ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-teal-400"}`}
                placeholder="AI in Business Conference"
                disabled={isSubmitting}
              />
              {errors.eventTitle && (
                <p className="text-red-500 text-[10px] sm:text-xs md:text-sm flex items-center gap-1">
                  <span>⚠</span>
                  {errors.eventTitle}
                </p>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label
                htmlFor="organiserName"
                className="text-slate-700 font-semibold text-xs sm:text-sm md:text-base flex items-center gap-2"
              >
                Organiser Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="organiserName"
                value={eventForm.organiserName}
                onChange={(e) => setEventForm({ ...eventForm, organiserName: e.target.value })}
                className={`rounded-xl h-10 sm:h-11 md:h-12 border-2 bg-white transition-all text-xs sm:text-sm md:text-base ${errors.organiserName ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-teal-400"}`}
                placeholder="Your organization name"
                disabled={isSubmitting}
              />
              {errors.organiserName && (
                <p className="text-red-500 text-[10px] sm:text-xs md:text-sm flex items-center gap-1">
                  <span>⚠</span>
                  {errors.organiserName}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label
              htmlFor="organiserEmail"
              className="text-slate-700 font-semibold text-xs sm:text-sm md:text-base flex items-center gap-2"
            >
              Organiser Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="organiserEmail"
              type="email"
              value={eventForm.organiserEmail}
              onChange={(e) => setEventForm({ ...eventForm, organiserEmail: e.target.value })}
              className={`rounded-xl h-10 sm:h-11 md:h-12 border-2 bg-white transition-all text-xs sm:text-sm md:text-base ${errors.organiserEmail ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-teal-400"}`}
              placeholder="john@example.com"
              disabled={isSubmitting}
            />
            {errors.organiserEmail && (
              <p className="text-red-500 text-[10px] sm:text-xs md:text-sm flex items-center gap-1">
                <span>⚠</span>
                {errors.organiserEmail}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <Label
                htmlFor="eventDate"
                className="text-slate-700 font-semibold text-xs sm:text-sm md:text-base flex items-center gap-2"
              >
                Event Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="eventDate"
                type="date"
                value={eventForm.eventDate}
                onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                className={`rounded-xl h-10 sm:h-11 md:h-12 border-2 bg-white transition-all text-xs sm:text-sm md:text-base ${errors.eventDate ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-teal-400"}`}
                min={new Date().toISOString().split('T')[0]}
                disabled={isSubmitting}
              />
              {errors.eventDate && (
                <p className="text-red-500 text-[10px] sm:text-xs md:text-sm flex items-center gap-1">
                  <span>⚠</span>
                  {errors.eventDate}
                </p>
              )}
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label
                htmlFor="eventTime"
                className="text-slate-700 font-semibold text-xs sm:text-sm md:text-base flex items-center gap-2"
              >
                Event Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="eventTime"
                type="time"
                value={eventForm.eventTime}
                onChange={(e) => setEventForm({ ...eventForm, eventTime: e.target.value })}
                className={`rounded-xl h-10 sm:h-11 md:h-12 border-2 bg-white transition-all text-xs sm:text-sm md:text-base ${errors.eventTime ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-teal-400"}`}
                disabled={isSubmitting}
              />
              {errors.eventTime && (
                <p className="text-red-500 text-[10px] sm:text-xs md:text-sm flex items-center gap-1">
                  <span>⚠</span>
                  {errors.eventTime}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label
              htmlFor="venue"
              className="text-slate-700 font-semibold text-xs sm:text-sm md:text-base flex items-center gap-2"
            >
              Venue <span className="text-red-500">*</span>
            </Label>
            <Input
              id="venue"
              value={eventForm.venue}
              onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
              className={`rounded-xl h-10 sm:h-11 md:h-12 border-2 bg-white transition-all text-xs sm:text-sm md:text-base ${errors.venue ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-teal-400"}`}
              placeholder="Conference Center, City"
              disabled={isSubmitting}
            />
            {errors.venue && (
              <p className="text-red-500 text-[10px] sm:text-xs md:text-sm flex items-center gap-1">
                <span>⚠</span>
                {errors.venue}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <h4 className="text-sm sm:text-base md:text-lg font-bold text-teal-900 flex items-center gap-2 pb-2 border-b-2 border-teal-200">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            Audience & Logistics
          </h4>

          <div className="space-y-1.5 sm:space-y-2">
            <Label
              htmlFor="audienceSize"
              className="text-slate-700 font-semibold text-xs sm:text-sm md:text-base flex items-center gap-2"
            >
              Audience Size <span className="text-red-500">*</span>
            </Label>
            <select
              id="audienceSize"
              value={eventForm.audienceSize}
              onChange={(e) => setEventForm({ ...eventForm, audienceSize: e.target.value as AudienceSize })}
              className={`w-full px-3 sm:px-4 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white transition-all text-xs sm:text-sm md:text-base h-10 sm:h-11 md:h-12 ${errors.audienceSize ? "border-red-400" : "border-slate-200"}`}
              disabled={isSubmitting}
            >
              <option value="">Select audience size</option>
              <option value="<50">Less than 50</option>
              <option value="50-100">50 - 100</option>
              <option value="100-250">100 - 250</option>
              <option value="250-500">250 - 500</option>
              <option value="500+">500+</option>
            </select>
            {errors.audienceSize && (
              <p className="text-red-500 text-[10px] sm:text-xs md:text-sm flex items-center gap-1">
                <span>⚠</span>
                {errors.audienceSize}
              </p>
            )}
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label className="text-slate-700 font-semibold text-xs sm:text-sm md:text-base flex items-center gap-2">
              Will the organiser cover travelling expenses? <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {["Yes", "No", "Partial"].map((option) => (
                <label
                  key={option}
                  className={`flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 border-2 rounded-xl cursor-pointer transition-all text-xs sm:text-sm md:text-base h-10 sm:h-11 md:h-12 ${
                    eventForm.travelExpenses === option
                      ? "border-teal-600 bg-teal-50 text-teal-700"
                      : "border-slate-300 hover:border-teal-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="travelExpenses"
                    value={option}
                    checked={eventForm.travelExpenses === option}
                    onChange={(e) => setEventForm({ ...eventForm, travelExpenses: e.target.value as TravelExpenses })}
                    className="mr-2 sm:mr-3"
                    disabled={isSubmitting}
                  />
                  <span className="font-medium">{option}</span>
                </label>
              ))}
            </div>
            {errors.travelExpenses && (
              <p className="text-red-500 text-[10px] sm:text-xs md:text-sm flex items-center gap-1">
                <span>⚠</span>
                {errors.travelExpenses}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <h4 className="text-sm sm:text-base md:text-lg font-bold text-teal-900 flex items-center gap-2 pb-2 border-b-2 border-teal-200">
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            Additional Details
          </h4>

          <div className="space-y-1.5 sm:space-y-2">
            <Label
              htmlFor="eventDetails"
              className="text-slate-700 font-semibold text-xs sm:text-sm md:text-base flex items-center gap-2"
            >
              Event Details <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="eventDetails"
              rows={5}
              value={eventForm.eventDetails}
              onChange={(e) => setEventForm({ ...eventForm, eventDetails: e.target.value })}
              className={`rounded-xl border-2 bg-white transition-all resize-none text-xs sm:text-sm md:text-base ${errors.eventDetails ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-teal-400"}`}
              placeholder="Please provide details about the event, topics to be covered, and any specific requirements..."
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center text-xs sm:text-sm">
              {errors.eventDetails && (
                <p className="text-red-500 flex items-center gap-1">
                  <span>⚠</span>
                  {errors.eventDetails}
                </p>
              )}
              <p className="text-slate-500 ml-auto">{eventForm.eventDetails.length} characters</p>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label
              htmlFor="attachment"
              className="text-slate-700 font-semibold text-xs sm:text-sm md:text-base flex items-center gap-2"
            >
              Attachment <span className="text-slate-500 text-xs sm:text-sm font-normal">(Optional, max 10MB)</span>
            </Label>
            <div className="relative">
              <input
                id="attachment"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                className="hidden"
                disabled={isSubmitting}
              />
              <label
                htmlFor="attachment"
                className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-2 border-dashed border-slate-300 rounded-xl ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-teal-500 hover:bg-teal-50'} transition-all`}
              >
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
                <span className="text-slate-600 text-xs sm:text-sm md:text-base">
                  {eventForm.attachment ? eventForm.attachment.name : "Click to upload event details or agenda"}
                </span>
              </label>
              {eventForm.attachment && (
                <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-green-600">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{eventForm.attachment.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEventForm({ ...eventForm, attachment: null })}
                    className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-red-500 hover:text-red-700"
                    disabled={isSubmitting}
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              )}
              {errors.attachment && (
                <p className="text-red-500 text-[10px] sm:text-xs md:text-sm mt-1 flex items-center gap-1">
                  <span>⚠</span>
                  {errors.attachment}
                </p>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500">Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t-2 border-teal-100">
          <Button
            type="button"
            asChild
            variant="outline"
            className="flex-1 rounded-xl h-12 sm:h-14 text-sm sm:text-base font-semibold border-2 border-slate-300 hover:bg-slate-100 transition-all bg-transparent"
            disabled={isSubmitting}
          >
            <Link href="/">Cancel</Link>
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl h-12 sm:h-14 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
            disabled={isSubmitting}
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {isSubmitting ? "Submitting..." : "Submit Invitation"}
          </Button>
        </div>
      </form>

      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 sm:py-16 md:py-20 border-t border-slate-700">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">Explore Other Options</h2>
            <p className="text-sm sm:text-base text-slate-300">
              Choose from our range of services to connect with Irfan Malik
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4 md:gap-5">
            <Button asChild className="btn-hero btn-secondary w-full h-16 sm:h-18 md:h-20">
              <Link href="/interview" className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                  <Mic className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">Book Interview / Podcast</div>
                    <div className="text-xs sm:text-sm opacity-90">Media & Content Creation</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
              </Link>
            </Button>

            <Button asChild className="btn-hero btn-secondary w-full h-16 sm:h-18 md:h-20">
              <Link href="/business" className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">Business Consultation</div>
                    <div className="text-xs sm:text-sm opacity-90">Strategic AI Implementation</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0" />
              </Link>
            </Button>

            <Button asChild className="btn-hero btn-secondary w-full h-16 sm:h-18 md:h-20">
              <Link href="/student" className="flex items-center justify-between px-2">
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

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center items-stretch sm:items-center mt-8 sm:mt-12">
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
      </section>

      <FloatingChatWidget />
    </div>
  )
}


