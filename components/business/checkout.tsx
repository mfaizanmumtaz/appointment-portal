"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Lock, Calendar } from "lucide-react"

interface BusinessCheckoutProps {
  plan: "30min" | "60min" | "6month"
  onSuccess: () => void
}

const planDetails = {
  "30min": { name: "30-Minute Session", price: 150 },
  "60min": { name: "60-Minute Deep Dive", price: 250 },
  "6month": { name: "6-Month Consultancy", price: 2500 },
}

export function BusinessCheckout({ plan, onSuccess }: BusinessCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const details = planDetails[plan]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    setTimeout(() => {
      setIsProcessing(false)
      onSuccess()
    }, 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Complete Your Booking</h2>
        <p className="text-muted-foreground">Secure payment powered by Stripe</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Summary */}
        <Card className="card-calm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>{details.name}</span>
              <span className="font-semibold">${details.price}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${details.price}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>• Zoom link will be sent after payment</p>
              <p>• 24-hour cancellation policy</p>
              <p>• Recording available upon request</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card className="card-calm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" className="rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" className="rounded-xl" />
                </div>
              </div>
              <div>
                <Label htmlFor="name">Cardholder Name</Label>
                <Input id="name" placeholder="John Doe" className="rounded-xl" />
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>Your payment information is secure and encrypted</span>
              </div>

              <Button type="submit" disabled={isProcessing} className="w-full btn-large btn-primary">
                {isProcessing ? "Processing..." : `Pay $${details.price}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
