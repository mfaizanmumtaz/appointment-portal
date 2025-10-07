"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Users, Briefcase, Play, ArrowRight, Mic, Calendar, Home } from "lucide-react"
import Link from "next/link"
import { FloatingChatWidget } from "@/components/chat/floating-chat-widget"

export default function InterviewPage() {
  const [showPodcastSuccess, setShowPodcastSuccess] = useState(false)
  const [podcastForm, setPodcastForm] = useState({
    podcasterName: "",
    phone: "",
    email: "",
    linkedinUrl: "",
    youtubeLink: "",
    facebookLink: "",
    agenda: "",
    date: "",
    notes: "",
  })

  const [podcastErrors, setPodcastErrors] = useState<Record<string, string>>({})

  const validatePodcastForm = () => {
    const errors: Record<string, string> = {}

    if (!podcastForm.podcasterName.trim()) errors.podcasterName = "Podcaster name is required"
    if (!podcastForm.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(podcastForm.email)) {
      errors.email = "Please enter a valid email address"
    }
    if (!podcastForm.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!/^[+]?[1-9][\d]{0,15}$/.test(podcastForm.phone.replace(/[\s\-()]/g, ""))) {
      errors.phone = "Please enter a valid phone number"
    }
    if (!podcastForm.linkedinUrl.trim()) {
      errors.linkedinUrl = "LinkedIn URL is required"
    } else if (!/^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/.+$/.test(podcastForm.linkedinUrl)) {
      errors.linkedinUrl = "Please enter a valid LinkedIn profile/company URL"
    }
    if (!podcastForm.youtubeLink.trim()) {
      errors.youtubeLink = "YouTube channel is required"
    } else if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(podcastForm.youtubeLink)) {
      errors.youtubeLink = "Please enter a valid YouTube URL"
    }
    if (!podcastForm.facebookLink.trim()) {
      errors.facebookLink = "Facebook page is required"
    } else if (!/^https?:\/\/(www\.)?facebook\.com\/.+$/.test(podcastForm.facebookLink)) {
      errors.facebookLink = "Please enter a valid Facebook URL"
    }
    if (!podcastForm.agenda.trim()) errors.agenda = "Agenda or topic is required"
    if (!podcastForm.date.trim()) errors.date = "Preferred date is required"

    setPodcastErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePodcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validatePodcastForm()) {
      try {
        const { createInterviewRequest } = await import("@/lib/interview-utils")
        
        const result = await createInterviewRequest({
          podcasterName: podcastForm.podcasterName,
          email: podcastForm.email,
          phone: podcastForm.phone,
          linkedinUrl: podcastForm.linkedinUrl,
          youtubeLink: podcastForm.youtubeLink,
          facebookLink: podcastForm.facebookLink,
          agenda: podcastForm.agenda,
          preferredDate: podcastForm.date || undefined,
          notes: podcastForm.notes || undefined
        })

        if (!result.success) {
          console.error('Error submitting interview request:', result.error)
          // Still show success to user, but log error for admin
        }

        setShowPodcastSuccess(true)
        setPodcastForm({
          podcasterName: "",
          phone: "",
          email: "",
          linkedinUrl: "",
          youtubeLink: "",
          facebookLink: "",
          agenda: "",
          date: "",
          notes: "",
        })
        setPodcastErrors({})
      } catch (error) {
        console.error('Error:', error)
        // Still show success to user to not break UX
        setShowPodcastSuccess(true)
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <main className="flex-1">
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 sm:py-12">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(56,189,248,0.3),transparent_50%)]"></div>
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.3),transparent_50%)]"></div>
          </div>

          <div className="w-full relative z-10">
            <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 mb-4 sm:mb-6">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  asChild
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent h-9 text-sm border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <Link href="/">
                    <Home className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Back to Home</span>
                    <span className="xs:hidden">Home</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent border-orange-200 text-orange-400 hover:bg-orange-950 h-9 text-sm"
                >
                  <Link href="/admin">
                    <div className="w-3.5 h-3.5 bg-orange-500 rounded-sm flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">A</span>
                    </div>
                    <span className="hidden xs:inline">Admin Panel</span>
                    <span className="xs:hidden">Admin</span>
                  </Link>
                </Button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-orange-50 shadow-2xl border-2 border-teal-100">
              <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 text-white p-4 sm:p-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
                <div className="relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Book Interview / Podcast</h1>
                    </div>
                    <p className="text-teal-50 text-xs sm:text-sm ml-10 sm:ml-13">
                      Share your details and let's create something amazing together
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePodcastSubmit} className="p-6 sm:p-8 space-y-6 sm:space-y-8">
                <div className="space-y-4 sm:space-y-6">
                  <h4 className="text-sm sm:text-base md:text-lg font-bold text-teal-900 flex items-center gap-2 pb-2 border-b-2 border-teal-200">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    Contact Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="podcasterName"
                        className="text-slate-700 font-semibold text-xs sm:text-sm md:text-base flex items-center gap-2"
                      >
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="podcasterName"
                        value={podcastForm.podcasterName}
                        onChange={(e) => setPodcastForm({ ...podcastForm, podcasterName: e.target.value })}
                        className={`rounded-xl h-10 sm:h-11 md:h-12 border-2 bg-white transition-all text-xs sm:text-sm md:text-base ${podcastErrors.podcasterName ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-teal-400"}`}
                        placeholder="John Doe"
                      />
                      {podcastErrors.podcasterName && (
                        <p className="text-red-500 text-[10px] sm:text-xs md:text-sm flex items-center gap-1">
                          <span>⚠</span>
                          {podcastErrors.podcasterName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-slate-700 font-semibold text-xs sm:text-sm md:text-base flex items-center gap-2"
                      >
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        value={podcastForm.phone}
                        onChange={(e) => setPodcastForm({ ...podcastForm, phone: e.target.value })}
                        className={`rounded-xl h-10 sm:h-11 md:h-12 border-2 bg-white transition-all text-xs sm:text-sm md:text-base ${podcastErrors.phone ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-teal-400"}`}
                        placeholder="+1 (555) 123-4567"
                      />
                      {podcastErrors.phone && (
                        <p className="text-red-500 text-[10px] sm:text-xs md:text-sm flex items-center gap-1">
                          <span>⚠</span>
                          {podcastErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-slate-700 font-semibold text-xs sm:text-sm md:text-base flex items-center gap-2"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={podcastForm.email}
                      onChange={(e) => setPodcastForm({ ...podcastForm, email: e.target.value })}
                      className={`rounded-xl h-10 sm:h-11 md:h-12 border-2 bg-white transition-all text-xs sm:text-sm md:text-base ${podcastErrors.email ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-teal-400"}`}
                      placeholder="john@example.com"
                    />
                    {podcastErrors.email && (
                      <p className="text-red-500 text-[10px] sm:text-xs md:text-sm flex items-center gap-1">
                        <span>⚠</span>
                        {podcastErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="linkedinUrl"
                      className="text-slate-700 font-semibold text-xs sm:text-sm md:text-base flex items-center gap-2"
                    >
                      LinkedIn Profile <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="linkedinUrl"
                      value={podcastForm.linkedinUrl}
                      onChange={(e) => setPodcastForm({ ...podcastForm, linkedinUrl: e.target.value })}
                      className={`rounded-xl h-10 sm:h-11 md:h-12 border-2 bg-white transition-all text-xs sm:text-sm md:text-base ${podcastErrors.linkedinUrl ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-teal-400"}`}
                      placeholder="https://linkedin.com/in/username"
                    />
                    {podcastErrors.linkedinUrl && (
                      <p className="text-red-500 text-[10px] sm:text-xs md:text-sm flex items-center gap-1">
                        <span>⚠</span>
                        {podcastErrors.linkedinUrl}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <h4 className="text-sm sm:text-base md:text-lg font-bold text-teal-900 flex items-center gap-2 pb-2 border-b-2 border-teal-200">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                    Your Channels
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="youtubeLink"
                        className="text-slate-700 font-semibold text-xs sm:text-sm md:text-base flex items-center gap-2"
                      >
                        YouTube Channel <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="youtubeLink"
                        value={podcastForm.youtubeLink}
                        onChange={(e) => setPodcastForm({ ...podcastForm, youtubeLink: e.target.value })}
                        className={`rounded-xl h-10 sm:h-11 md:h-12 border-2 bg-white transition-all text-xs sm:text-sm md:text-base ${podcastErrors.youtubeLink ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-teal-400"}`}
                        placeholder="https://youtube.com/@channel"
                      />
                      {podcastErrors.youtubeLink && (
                        <p className="text-red-500 text-[10px] sm:text-xs md:text-sm flex items-center gap-1">
                          <span>⚠</span>
                          {podcastErrors.youtubeLink}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="facebookLink"
                        className="text-slate-700 font-semibold text-xs sm:text-sm md:text-base flex items-center gap-2"
                      >
                        Facebook Page <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="facebookLink"
                        value={podcastForm.facebookLink}
                        onChange={(e) => setPodcastForm({ ...podcastForm, facebookLink: e.target.value })}
                        className={`rounded-xl h-10 sm:h-11 md:h-12 border-2 bg-white transition-all text-xs sm:text-sm md:text-base ${podcastErrors.facebookLink ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-teal-400"}`}
                        placeholder="https://facebook.com/page"
                      />
                      {podcastErrors.facebookLink && (
                        <p className="text-red-500 text-[10px] sm:text-xs md:text-sm flex items-center gap-1">
                          <span>⚠</span>
                          {podcastErrors.facebookLink}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <h4 className="text-sm sm:text-base md:text-lg font-bold text-teal-900 flex items-center gap-2 pb-2 border-b-2 border-teal-200">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    Interview Details
                  </h4>

                  <div className="space-y-2">
                    <Label
                      htmlFor="agenda"
                      className="text-slate-700 font-semibold text-xs sm:text-sm md:text-base flex items-center gap-2"
                    >
                      Topic & Agenda <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="agenda"
                      rows={4}
                      value={podcastForm.agenda}
                      onChange={(e) => setPodcastForm({ ...podcastForm, agenda: e.target.value })}
                      className={`rounded-xl border-2 bg-white transition-all resize-none text-xs sm:text-sm md:text-base ${podcastErrors.agenda ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-teal-400"}`}
                      placeholder="Describe the main topics and themes you'd like to discuss during the interview..."
                    />
                    {podcastErrors.agenda && (
                      <p className="text-red-500 text-[10px] sm:text-xs md:text-sm flex items-center gap-1">
                        <span>⚠</span>
                        {podcastErrors.agenda}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-slate-700 font-semibold text-xs sm:text-sm md:text-base flex items-center gap-2">
                      Preferred Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={podcastForm.date}
                      onChange={(e) => setPodcastForm({ ...podcastForm, date: e.target.value })}
                      className={`rounded-xl h-10 sm:h-11 md:h-12 border-2 bg-white transition-all text-xs sm:text-sm md:text-base ${podcastErrors.date ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-teal-400"}`}
                    />
                    {podcastErrors.date && (
                      <p className="text-red-500 text-[10px] sm:text-xs md:text-sm flex items-center gap-1">
                        <span>⚠</span>
                        {podcastErrors.date}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-slate-700 font-semibold text-xs sm:text-sm md:text-base">
                      Additional Notes <span className="text-slate-500 text-xs sm:text-sm font-normal">(Optional)</span>
                    </Label>
                    <Textarea
                      id="notes"
                      rows={3}
                      value={podcastForm.notes}
                      onChange={(e) => setPodcastForm({ ...podcastForm, notes: e.target.value })}
                      className="rounded-xl border-2 border-slate-200 bg-white focus:border-teal-400 transition-all resize-none text-xs sm:text-sm md:text-base"
                      placeholder="Any special requirements, technical setup preferences, or other information we should know..."
                    />
                  </div>
                </div>

                <div className="pt-4 sm:pt-6 border-t-2 border-teal-100">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl h-12 sm:h-14 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                  >
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Submit
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 sm:py-16 md:py-20 border-t border-slate-700">
          <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
                Explore Other Options
              </h2>
              <p className="text-sm sm:text-base text-slate-300">
                Choose from our range of services to connect with Irfan Malik
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:gap-4 md:gap-5">
              <Button asChild className="btn-hero btn-secondary w-full h-16 sm:h-18 md:h-20">
                <Link href="/event" className="flex items-center justify-between px-2">
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
      </main>

      {showPodcastSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center transform animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Mic className="w-10 h-10 text-teal-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Request Submitted!</h3>
            <p className="text-slate-600 text-base leading-relaxed mb-8">
              Thank you for your interest! Our team will review your request and get back to you via email within 24-48
              hours.
            </p>
            <Button
              onClick={() => setShowPodcastSuccess(false)}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl h-12 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      <FloatingChatWidget />
    </div>
  )
}


