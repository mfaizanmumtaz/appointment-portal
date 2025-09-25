"use client"

import { Footer } from "@/components/ui/footer"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function XevenChatPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <ChatInterface
          botName="XevenGPT"
          botDescription="Learn about Xeven Solutions' products, services, and AI innovations"
          botPersonality="company"
          disclaimer="This AI assistant provides information about Xeven Solutions and general business guidance."
          suggestedQuestions={[
            "What services does Xeven Solutions offer?",
            "How can Xeven help with digital transformation?",
            "What AI products does Xeven develop?",
            "How do I get started with Xeven's services?",
          ]}
        />
      </main>

      <Footer />
    </div>
  )
}
