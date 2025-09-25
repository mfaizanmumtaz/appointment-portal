"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Download, Upload, Webhook, TestTube, Database, FileText } from "lucide-react"

export function AdminTools() {
  const [webhookUrl, setWebhookUrl] = useState("https://api.example.com/webhook")
  const [testResult, setTestResult] = useState<string | null>(null)

  const handleExportCSV = () => {
    // Mock CSV export
    const csvData = "Date,Client,Type,Status,Revenue\n2024-01-15,Sarah Johnson,Business,Confirmed,$250"
    const blob = new Blob([csvData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "appointments-export.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleTestWebhook = () => {
    setTestResult("Testing...")
    setTimeout(() => {
      setTestResult("✅ Webhook test successful - 200 OK")
    }, 2000)
  }

  const handleBackupData = () => {
    // Mock backup
    alert("Backup initiated. You'll receive an email when complete.")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-font text-3xl font-bold text-foreground mb-2">Tools</h1>
        <p className="text-muted-foreground">Administrative tools and utilities</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Data Export */}
        <Card className="card-calm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Data Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Export your appointment data for analysis or backup</p>
            <div className="space-y-3">
              <Button
                onClick={handleExportCSV}
                variant="outline"
                className="w-full justify-start rounded-xl bg-transparent"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export Appointments (CSV)
              </Button>
              <Button variant="outline" className="w-full justify-start rounded-xl bg-transparent">
                <FileText className="w-4 h-4 mr-2" />
                Export Client Data (CSV)
              </Button>
              <Button variant="outline" className="w-full justify-start rounded-xl bg-transparent">
                <FileText className="w-4 h-4 mr-2" />
                Export Revenue Report (PDF)
              </Button>
            </div>
            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl">
              <strong>Note:</strong> Exported data includes the last 90 days by default. Contact support for custom date
              ranges.
            </div>
          </CardContent>
        </Card>

        {/* Webhook Testing */}
        <Card className="card-calm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5" />
              Webhook Testing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Test your webhook endpoints for integrations</p>
            <div>
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="rounded-xl"
                placeholder="https://your-api.com/webhook"
              />
            </div>
            <Button onClick={handleTestWebhook} className="w-full btn-primary">
              <TestTube className="w-4 h-4 mr-2" />
              Test Webhook
            </Button>
            {testResult && (
              <div className="p-3 bg-muted/30 rounded-xl">
                <p className="text-sm font-mono">{testResult}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="card-calm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Backup and manage your system data</p>
            <div className="space-y-3">
              <Button
                onClick={handleBackupData}
                variant="outline"
                className="w-full justify-start rounded-xl bg-transparent"
              >
                <Upload className="w-4 h-4 mr-2" />
                Create Data Backup
              </Button>
              <Button variant="outline" className="w-full justify-start rounded-xl bg-transparent">
                <Database className="w-4 h-4 mr-2" />
                Database Health Check
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-muted/30 rounded-xl">
                <p className="font-semibold">Last Backup</p>
                <p className="text-muted-foreground">Jan 14, 2024</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-xl">
                <p className="font-semibold">DB Status</p>
                <Badge variant="secondary" className="mt-1">
                  Healthy
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="card-calm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Monitor system health and integrations</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <span className="text-sm">Stripe Integration</span>
                <Badge variant="secondary">Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <span className="text-sm">Zoom Integration</span>
                <Badge variant="secondary">Connected</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <span className="text-sm">Email Service</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <span className="text-sm">AI Triage Service</span>
                <Badge variant="secondary">Running</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
