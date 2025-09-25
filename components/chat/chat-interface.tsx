"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send, Bot, User, AlertTriangle, Sparkles, Home } from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

interface ChatInterfaceProps {
  botName: string
  botDescription: string
  botPersonality: "expert" | "company"
  disclaimer: string
  suggestedQuestions: string[]
}

export function ChatInterface({
  botName,
  botDescription,
  botPersonality,
  disclaimer,
  suggestedQuestions,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [sessionStats, setSessionStats] = useState({ messages: 0, opened: Date.now() })
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: Message = {
      id: "welcome",
      content: `Hello! I'm ${botName}. ${botDescription}. How can I help you today?`,
      sender: "bot",
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])
  }, [botName, botDescription])

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const generateBotResponse = (userMessage: string): string => {
    // Mock AI responses based on bot personality
    const responses = {
      expert: [
        "That's a great question about AI implementation. Based on current industry trends, I'd recommend starting with...",
        "From my experience in business strategy, the key factors to consider are...",
        "AI technology in this area is rapidly evolving. Here's what I suggest...",
        "This is a common challenge I see with businesses. The best approach would be...",
      ],
      company: [
        "Xeven Solutions specializes in exactly this type of challenge. Our approach typically involves...",
        "We've helped many clients with similar needs. Our services include...",
        "This aligns perfectly with our AI innovation framework. Let me explain how...",
        "At Xeven, we've developed specific solutions for this. Here's how we can help...",
      ],
    }

    const botResponses = responses[botPersonality]
    const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)]

    // Add some context based on keywords
    if (userMessage.toLowerCase().includes("price") || userMessage.toLowerCase().includes("cost")) {
      return `${randomResponse} For detailed pricing information, I'd recommend booking a consultation to discuss your specific needs.`
    }

    if (userMessage.toLowerCase().includes("book") || userMessage.toLowerCase().includes("appointment")) {
      return `${randomResponse} If you'd like to dive deeper into this topic, you can book a consultation through our booking system.`
    }

    return `${randomResponse} Feel free to ask any follow-up questions!`
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)
    setSessionStats((prev) => ({ ...prev, messages: prev.messages + 1 }))

    // Simulate AI thinking time
    setTimeout(
      () => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: generateBotResponse(content),
          sender: "bot",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, botResponse])
        setIsTyping(false)
      },
      1000 + Math.random() * 2000,
    ) // 1-3 seconds delay
  }

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="flex items-center gap-2 bg-transparent">
            <Link href="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex items-center gap-2 bg-transparent border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            <Link href="/admin">
              <div className="w-4 h-4 bg-orange-500 rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              Admin Panel
            </Link>
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="heading-font text-3xl font-bold text-foreground">{botName}</h1>
            <p className="text-muted-foreground">{botDescription}</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-xl p-3 max-w-2xl mx-auto">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{disclaimer}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="card-calm h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Chat with {botName}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.sender === "bot" && (
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {message.sender === "user" && (
                        <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-secondary" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div className="bg-muted rounded-2xl px-4 py-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t border-border p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`Ask ${botName} anything...`}
                    className="rounded-xl"
                    disabled={isTyping}
                  />
                  <Button type="submit" disabled={isTyping || !inputValue.trim()} className="rounded-xl">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Suggested Questions */}
          <Card className="card-calm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5" />
                Quick Start
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-3 rounded-xl bg-transparent"
                  onClick={() => handleSuggestedQuestion(question)}
                  disabled={isTyping}
                >
                  <span className="text-sm">{question}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Session Stats */}
          <Card className="card-calm">
            <CardHeader>
              <CardTitle className="text-lg">Session Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Messages:</span>
                <Badge variant="outline">{sessionStats.messages}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Started:</span>
                <span className="text-sm">
                  {new Date(sessionStats.opened).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Need more detailed help?{" "}
                  <a href="/business" className="text-primary hover:underline">
                    Book a consultation
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-calm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" size="sm" className="w-full justify-start rounded-xl bg-transparent">
                <a href="/">Go to Home</a>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start rounded-xl bg-transparent">
                <a href="/business">Book Business Consultation</a>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start rounded-xl bg-transparent">
                <a href="/student">Book Student Session</a>
              </Button>
              {botName === "irfanGPT" && (
                <Button asChild variant="outline" size="sm" className="w-full justify-start rounded-xl bg-transparent">
                  <a href="https://xevengpt.com" target="_blank" rel="noopener noreferrer">
                    Try XevenGPT
                  </a>
                </Button>
              )}
              {botName === "XevenGPT" && (
                <Button asChild variant="outline" size="sm" className="w-full justify-start rounded-xl bg-transparent">
                  <a href="https://irfangpt.com" target="_blank" rel="noopener noreferrer">
                    Try irfanGPT
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
