"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, DollarSign, MessageSquare, Zap } from "lucide-react"

interface ConsultationOptionsProps {
  onSelect: (option: "free" | "paid") => void
}

export function BusinessConsultationOptions({ onSelect }: ConsultationOptionsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Choose Your Consultation Type</h2>
        <p className="text-muted-foreground">Select the option that best fits your needs</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Option */}
        <Card className="card-calm border-2 hover:border-secondary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-secondary" />
                Free Consultation
              </CardTitle>
              <Badge variant="secondary">AI-Triaged</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                30 minutes
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4" />
                AI pre-screening required
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Perfect for initial AI strategy discussions, quick questions, or project feasibility assessment.
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• AI implementation roadmap</li>
              <li>• Technology recommendations</li>
              <li>• Basic strategy guidance</li>
            </ul>
            <Button onClick={() => onSelect("free")} className="w-full btn-large" variant="outline">
              Apply for Free Session
            </Button>
          </CardContent>
        </Card>

        {/* Paid Option */}
        <Card className="card-calm border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Paid Consultation
              </CardTitle>
              <Badge>Guaranteed</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                30min, 60min, or 6-month plans
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4" />
                Immediate booking available
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Comprehensive consultation with detailed analysis, custom solutions, and ongoing support options.
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Custom AI solution design</li>
              <li>• Implementation planning</li>
              <li>• ROI analysis & metrics</li>
              <li>• Follow-up support</li>
            </ul>
            <Button onClick={() => onSelect("paid")} className="w-full btn-large btn-primary">
              View Paid Options
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
