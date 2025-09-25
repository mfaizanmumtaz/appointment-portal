import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="heading-font text-3xl font-bold text-foreground mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: January 15, 2024</p>
          </div>

          <Card className="card-calm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Terms and Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <div className="space-y-6 text-sm leading-relaxed">
                <section>
                  <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
                  <p className="text-muted-foreground">
                    By accessing and using the Irfan Malik Appointments Portal, you accept and agree to be bound by the
                    terms and provision of this agreement. If you do not agree to abide by the above, please do not use
                    this service.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">2. Booking and Payment Terms</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>• All paid consultations require payment at the time of booking</p>
                    <p>• Free sessions are subject to AI triage and approval</p>
                    <p>• Cancellations must be made at least 24 hours in advance for full refund</p>
                    <p>• No-shows will be charged the full session fee</p>
                    <p>• Rescheduling is allowed up to 2 hours before the session</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">3. AI Chat Services</h3>
                  <p className="text-muted-foreground">
                    Our AI chat services (irfanGPT and XevenGPT) are provided for informational purposes only. The
                    responses generated are not professional advice and should not be relied upon for business,
                    financial, or legal decisions.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">4. Intellectual Property</h3>
                  <p className="text-muted-foreground">
                    All content, materials, and intellectual property shared during consultations remain the property of
                    their respective owners. Recording of sessions is only permitted with explicit consent from all
                    parties.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">5. Privacy and Data Protection</h3>
                  <p className="text-muted-foreground">
                    We are committed to protecting your privacy. All personal information collected is used solely for
                    providing our services and is handled in accordance with our Privacy Policy.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">6. Limitation of Liability</h3>
                  <p className="text-muted-foreground">
                    Irfan Malik and associated services shall not be liable for any indirect, incidental, special, or
                    consequential damages arising from the use of our services. Our liability is limited to the amount
                    paid for the specific service.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">7. Contact Information</h3>
                  <p className="text-muted-foreground">
                    For questions about these Terms of Service, please contact us through our booking system or via the
                    AI chat services.
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
