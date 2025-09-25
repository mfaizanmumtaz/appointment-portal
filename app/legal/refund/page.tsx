import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"

export default function RefundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="heading-font text-3xl font-bold text-foreground mb-4">Refund Policy</h1>
            <p className="text-muted-foreground">Last updated: January 15, 2024</p>
          </div>

          <Card className="card-calm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Refund Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <div className="space-y-6 text-sm leading-relaxed">
                <section>
                  <h3 className="text-lg font-semibold mb-3">1. Cancellation and Refund Timeline</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>
                      • <strong>24+ hours before session:</strong> Full refund available
                    </p>
                    <p>
                      • <strong>2-24 hours before session:</strong> 50% refund available
                    </p>
                    <p>
                      • <strong>Less than 2 hours:</strong> No refund, but rescheduling allowed
                    </p>
                    <p>
                      • <strong>No-show:</strong> No refund or rescheduling
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">2. Refund Process</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>To request a refund:</p>
                    <p>• Contact us through the booking system or admin panel</p>
                    <p>• Provide your booking ID and reason for cancellation</p>
                    <p>• Refunds are processed within 3-5 business days</p>
                    <p>• Refunds are issued to the original payment method</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">3. Service-Specific Policies</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Business Consultations</h4>
                      <p className="text-muted-foreground">
                        Standard refund policy applies. For 6-month consultancy packages, refunds are prorated based on
                        unused sessions.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Student Sessions</h4>
                      <p className="text-muted-foreground">
                        In-person paid sessions follow the standard policy. Free sessions can be cancelled without
                        penalty but may affect future free session eligibility.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">AI Chat Services</h4>
                      <p className="text-muted-foreground">
                        AI chat services are free and do not require refunds. Premium AI features, if introduced, will
                        have separate refund terms.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">4. Emergency Situations</h3>
                  <p className="text-muted-foreground">
                    In case of emergencies, illness, or unforeseen circumstances, we may waive standard cancellation
                    fees on a case-by-case basis. Please contact us as soon as possible to discuss your situation.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">5. Technical Issues</h3>
                  <p className="text-muted-foreground">
                    If technical issues on our end prevent a session from taking place, you will receive a full refund
                    or the option to reschedule at no additional cost.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">6. Dispute Resolution</h3>
                  <p className="text-muted-foreground">
                    If you're unsatisfied with our refund decision, you may request a review. We aim to resolve all
                    disputes fairly and promptly. For payment disputes, you may also contact your payment provider.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">7. Contact for Refunds</h3>
                  <p className="text-muted-foreground">
                    To request a refund or discuss your situation, please use the contact information provided in your
                    booking confirmation or reach out through our AI chat services for immediate assistance.
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
