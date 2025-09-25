import { Navigation } from "@/components/ui/navigation"
import { Footer } from "@/components/ui/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="heading-font text-3xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: January 15, 2024</p>
          </div>

          <Card className="card-calm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <div className="space-y-6 text-sm leading-relaxed">
                <section>
                  <h3 className="text-lg font-semibold mb-3">1. Information We Collect</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>We collect information you provide directly to us, including:</p>
                    <p>• Name, email address, and phone number for booking appointments</p>
                    <p>• Company or school information for context</p>
                    <p>• Project descriptions and learning goals</p>
                    <p>• Payment information (processed securely through Stripe)</p>
                    <p>• Chat conversations with our AI assistants</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">2. How We Use Your Information</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>We use the information we collect to:</p>
                    <p>• Schedule and manage your appointments</p>
                    <p>• Process payments for paid consultations</p>
                    <p>• Send appointment confirmations and reminders</p>
                    <p>• Improve our AI triage system</p>
                    <p>• Provide customer support</p>
                    <p>• Analyze usage patterns to improve our services</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">3. Information Sharing</h3>
                  <p className="text-muted-foreground">
                    We do not sell, trade, or otherwise transfer your personal information to third parties except as
                    described in this policy. We may share information with trusted service providers who assist us in
                    operating our platform (such as payment processors and email services).
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">4. AI Chat Data</h3>
                  <p className="text-muted-foreground">
                    Conversations with our AI assistants (irfanGPT and XevenGPT) are used to improve the service and
                    provide better responses. Chat data is anonymized and used for training purposes only.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">5. Data Security</h3>
                  <p className="text-muted-foreground">
                    We implement appropriate security measures to protect your personal information against unauthorized
                    access, alteration, disclosure, or destruction. All payment information is processed through
                    industry-standard secure payment gateways.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">6. Your Rights</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>You have the right to:</p>
                    <p>• Access your personal information</p>
                    <p>• Correct inaccurate information</p>
                    <p>• Request deletion of your information</p>
                    <p>• Opt out of marketing communications</p>
                    <p>• Export your data in a portable format</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">7. Contact Us</h3>
                  <p className="text-muted-foreground">
                    If you have questions about this Privacy Policy or wish to exercise your rights, please contact us
                    through our appointment booking system or AI chat services.
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
