"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Video, MapPin, Clock, DollarSign, Users, Zap } from "lucide-react"

interface StudentOptionsProps {
  onSelect: (type: "online" | "in-person") => void
}

export function StudentOptions({ onSelect }: StudentOptionsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Choose Your Session Type</h2>
        <p className="text-muted-foreground">Select the format that works best for your learning style</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Online Option */}
        <Card className="card-calm border-2 hover:border-secondary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-secondary" />
                Free Online Session
              </CardTitle>
              <Badge variant="secondary">AI-Triaged</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                45 minutes via Zoom
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4" />
                AI pre-screening required
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                Perfect for academic guidance
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Ideal for career advice, academic planning, AI learning paths, and general mentorship questions.
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Career guidance in tech/AI</li>
              <li>• Academic pathway planning</li>
              <li>• Learning resource recommendations</li>
              <li>• Industry insights and trends</li>
            </ul>
            <Button onClick={() => onSelect("online")} className="w-full btn-large" variant="outline">
              Apply for Free Session
            </Button>
          </CardContent>
        </Card>

        {/* Paid In-Person Option */}
        <Card className="card-calm border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                In-Person Session
              </CardTitle>
              <Badge>$75</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                60 minutes face-to-face
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                Downtown office or campus visit
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4" />
                Immediate booking available
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Deep-dive sessions with hands-on guidance, portfolio reviews, and personalized action plans.
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Portfolio/project review</li>
              <li>• Hands-on coding guidance</li>
              <li>• Interview preparation</li>
              <li>• Personalized learning plan</li>
              <li>• Networking introductions</li>
            </ul>
            <Button onClick={() => onSelect("in-person")} className="w-full btn-large btn-primary">
              Book In-Person Session
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Not sure which option is right for you?{" "}
          <a href="/chat/irfan" className="text-primary hover:underline">
            Chat with our AI assistant
          </a>{" "}
          for personalized recommendations.
        </p>
      </div>
    </div>
  )
}
