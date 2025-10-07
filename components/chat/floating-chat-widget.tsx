"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, X, Bot } from "lucide-react"

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
          style={{
            background: 'linear-gradient(to right, #14b8a6, #06b6d4)',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80">
      <Card className="card-calm shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="w-5 h-5" style={{ color: '#14b8a6' }} />
            Quick Help
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Get instant answers from our AI assistants</p>
          <div className="space-y-2">
            <Button asChild variant="outline" size="sm" className="w-full justify-start rounded-xl bg-transparent cursor-pointer">
              <a href="https://irfangpt.com" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                <Bot className="w-4 h-4 mr-2" style={{ color: '#14b8a6' }} />
                Chat with irfanGPT
              </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full justify-start rounded-xl bg-transparent cursor-pointer">
              <a href="https://xevengpt.com" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                <Bot className="w-4 h-4 mr-2" style={{ color: '#14b8a6' }} />
                Explore XevenGPT
              </a>
            </Button>
          </div>
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Or{" "}
              <a href="/business" className="hover:underline cursor-pointer" style={{ color: '#14b8a6' }}>
                book a consultation
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
