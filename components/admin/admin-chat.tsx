"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, User, Clock, Check, CheckCheck, RefreshCw, Mail, Phone } from "lucide-react"
import { fetchInstantMessages, updateInstantMessage, markMessageAsRead, subscribeToMessages } from "@/lib/message-utils"
import type { InstantMessage } from "@/lib/types/database"
import { useOffline } from "@/hooks/use-offline"
import { OfflineStatus, ErrorBanner } from "@/components/ui/offline-status"

const quickReplies = [
  "Thank you for your message! I'll get back to you shortly.",
  "Your request has been received. I'll review it and respond within 24 hours.",
  "Please provide more details about your project so I can better assist you.",
  "Your session has been confirmed. You'll receive a calendar invite soon.",
  "Thank you for your interest in our services.",
]

export function AdminChat() {
  const [messages, setMessages] = useState<InstantMessage[]>([])
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    isOnline,
    error,
    lastUpdated,
    isRefreshing,
    setLastUpdated,
    setIsRefreshing,
    executeWithOfflineCheck
  } = useOffline({ autoRefresh: true, refreshInterval: 30000 })

  const selectedMessage = messages.find(msg => msg.id === selectedMessageId)

  // Load messages on component mount
  useEffect(() => {
    executeWithOfflineCheck(loadMessages)

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (navigator.onLine) {
        executeWithOfflineCheck(loadMessages)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    const subscription = subscribeToMessages((payload) => {
      console.log('Real-time message update:', payload)
      executeWithOfflineCheck(loadMessages) // Reload all messages when there's an update
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await executeWithOfflineCheck(loadMessages)
    setIsRefreshing(false)
  }

  const loadMessages = async () => {
    setIsLoading(true)

    const result = await fetchInstantMessages()
    if (result.success) {
      setMessages(result.data)
      // Auto-select first message if none selected
      if (!selectedMessageId && result.data.length > 0) {
        setSelectedMessageId(result.data[0].id)
      }
    }
    setLastUpdated(new Date())
    setIsLoading(false)
  }


  const handleMessageSelect = async (messageId: string) => {
    setSelectedMessageId(messageId)
    const message = messages.find(msg => msg.id === messageId)
    if (message && message.status === 'unread') {
      // Mark as read
      await markMessageAsRead(messageId)
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      ))
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessageId) return

    setIsSubmitting(true)
    try {
      const result = await updateInstantMessage(selectedMessageId, {
        admin_reply: replyText,
        status: 'replied'
      })

      if (result.success) {
        // Update local state
        setMessages(prev => prev.map(msg => 
          msg.id === selectedMessageId 
            ? { ...msg, admin_reply: replyText, status: 'replied', replied_at: new Date().toISOString() }
            : msg
        ))
        setReplyText("")
      } else {
        alert("Failed to send reply. Please try again.")
      }
    } catch (error) {
      console.error("Error sending reply:", error)
      alert("Failed to send reply. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickReply = (reply: string) => {
    setReplyText(reply)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes} min ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread':
        return <Clock className="w-3 h-3 text-orange-500" />
      case 'read':
        return <Check className="w-3 h-3 text-blue-500" />
      case 'replied':
        return <CheckCheck className="w-3 h-3 text-green-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'read':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'replied':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-slate-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Quick Chat</h2>
            <p className="text-sm text-slate-600">Manage instant messages from visitors</p>
          </div>
        </div>
        <OfflineStatus
          isOnline={isOnline}
          error={error}
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={handleManualRefresh}
        />
      </div>

      <ErrorBanner error={error} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Messages List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Messages</span>
              <Badge variant="secondary">{messages.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {messages.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No messages yet</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleMessageSelect(message.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                        selectedMessageId === message.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-slate-50 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-900 truncate">
                            {message.name}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">{message.email}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {getStatusIcon(message.status)}
                          <span className="text-xs text-slate-500">
                            {formatTimestamp(message.created_at)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                        {message.message}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(message.status)}`}
                      >
                        {message.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Detail & Reply */}
        <Card className="lg:col-span-2">
          {selectedMessage ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {selectedMessage.name}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {selectedMessage.email}
                      </div>
                      {selectedMessage.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {selectedMessage.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge 
                    className={getStatusColor(selectedMessage.status)}
                  >
                    {selectedMessage.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Original Message */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Original Message</span>
                    <span className="text-xs text-slate-500">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-800 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                {/* Admin Reply if exists */}
                {selectedMessage.admin_reply && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700">Your Reply</span>
                      <span className="text-xs text-blue-600">
                        {selectedMessage.replied_at && new Date(selectedMessage.replied_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-blue-800 whitespace-pre-wrap">{selectedMessage.admin_reply}</p>
                  </div>
                )}

                {/* Reply Form */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      {selectedMessage.admin_reply ? 'Send Another Reply' : 'Send Reply'}
                    </span>
                  </div>

                  {/* Quick Replies */}
                  <div className="space-y-2">
                    <span className="text-xs text-slate-600">Quick Replies:</span>
                    <div className="flex flex-wrap gap-2">
                      {quickReplies.slice(0, 3).map((reply, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickReply(reply)}
                          className="text-xs h-7 px-3 rounded-full hover:bg-primary/10"
                        >
                          {reply.substring(0, 30)}...
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Reply Textarea */}
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    disabled={isSubmitting}
                  />

                  {/* Send Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Reply
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Select a message to view details and reply</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}