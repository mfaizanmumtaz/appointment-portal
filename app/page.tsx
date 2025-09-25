"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/ui/footer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Users, Briefcase, Play, ArrowRight, Send, X } from "lucide-react"
import Link from "next/link"
import { FloatingChatWidget } from "@/components/chat/floating-chat-widget"
import { createInstantMessage } from "@/lib/message-utils"

export default function HomePage() {
  const [showQuickMessage, setShowQuickMessage] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [messageForm, setMessageForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const handleQuickMessageSubmit = async (e: React.FormEvent) => {
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
              </div>

              <div className="flex flex-col lg:flex-row gap-6 justify-center items-center max-w-5xl mx-auto">
                <Button
                  onClick={() => setShowQuickMessage(true)}
                  className="btn-hero btn-secondary w-full lg:w-auto min-w-[320px] h-20"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Send className="w-8 h-8 mr-4" />
                      <div className="text-left">
                        <div className="text-xl font-bold">Send a Quick Message</div>
                        <div className="text-sm opacity-90">Get in Touch Instantly</div>
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

              <form onSubmit={handleQuickMessageSubmit} className="space-y-4">
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

      <Footer />
      <FloatingChatWidget />
    </div>
  )
}
