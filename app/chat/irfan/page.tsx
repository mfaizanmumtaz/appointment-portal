"use client"

import { Footer } from "@/components/ui/footer"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function IrfanChatPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <ChatInterface
          botName="irfanGPT"
          botDescription="Get instant answers about AI, business strategy, and career guidance"
          botPersonality="expert"
          disclaimer="This AI assistant provides general guidance and is not a substitute for professional legal, financial, or medical advice."
          suggestedQuestions={[
            "How can AI help my business grow?",
            "What career path should I take in AI?",
            "How do I start learning machine learning?",
            "What are the latest AI trends in 2024?",
          ]}
        />
      </main>

      <Footer />
    </div>
  )
}
