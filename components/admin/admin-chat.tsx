"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send, User, Phone, Video, MoreVertical, Smile, Paperclip } from "lucide-react"

interface ChatMessage {
  id: string
  sender: "admin" | "user"
  message: string
  timestamp: string
  userName?: string
}

interface ActiveChat {
  id: string
  userName: string
  userEmail: string
  status: "active" | "waiting"
  lastMessage: string
  timestamp: string
  unreadCount: number
}

const mockChats: ActiveChat[] = [
  {
    id: "1",
    userName: "Sarah Johnson",
    userEmail: "sarah@example.com",
    status: "active",
    lastMessage: "I have a question about the business consultation",
    timestamp: "2 min ago",
    unreadCount: 2,
  },
  {
    id: "2",
    userName: "Mike Chen",
    userEmail: "mike@student.edu",
    status: "waiting",
    lastMessage: "When can I schedule my session?",
    timestamp: "5 min ago",
    unreadCount: 1,
  },
]

const mockMessages: ChatMessage[] = [
  {
    id: "1",
    sender: "user",
    message: "Hi, I have a question about the business consultation",
    timestamp: "2:30 PM",
    userName: "Sarah Johnson",
  },
  {
    id: "2",
    sender: "admin",
    message: "Hello Sarah! I'd be happy to help. What would you like to know?",
    timestamp: "2:31 PM",
  },
  {
    id: "3",
    sender: "user",
    message: "What should I prepare for our session?",
    timestamp: "2:32 PM",
    userName: "Sarah Johnson",
  },
]

const quickReplies = [
  "Thank you for your interest! I'll get back to you shortly.",
  "Your session has been confirmed. You'll receive a calendar invite soon.",
  "Please provide more details about your project so I can better assist you.",
  "I'd be happy to help! Let me check my availability.",
  "Your payment has been processed successfully.",
]

export function AdminChat() {
  const [activeChats] = useState<ActiveChat[]>(mockChats)
  const [selectedChat, setSelectedChat] = useState<string | null>("1")
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: "admin",
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages([...messages, message])
      setNewMessage("")
    }
  }

  const handleQuickReply = (reply: string) => {
    setNewMessage(reply)
  }

  const selectedChatData = activeChats.find((chat) => chat.id === selectedChat)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-font text-3xl font-bold text-foreground mb-2">Quick Chat</h1>
        <p className="text-muted-foreground">Real-time communication with people booking appointments</p>
      </div>

      <div className="flex h-[700px] bg-background rounded-lg border border-border overflow-hidden shadow-sm">
        {/* Chat List Sidebar - WhatsApp style */}
        <div className="w-80 bg-muted/20 border-r border-border flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 bg-background border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Chats</h2>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border/30">
              {activeChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 cursor-pointer transition-all duration-200 hover:bg-muted/40 ${
                    selectedChat === chat.id ? "bg-primary/10 border-r-2 border-r-primary" : ""
                  }`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <div className="flex items-center gap-3">
                    {/* Contact Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      {chat.status === "active" && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm truncate text-foreground">{chat.userName}</h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{chat.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate leading-tight">{chat.lastMessage}</p>
                      <div className="flex items-center justify-between mt-1">
                        <Badge
                          variant={chat.status === "active" ? "default" : "secondary"}
                          className="text-xs h-4 px-2"
                        >
                          {chat.status}
                        </Badge>
                        {chat.unreadCount > 0 && (
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs text-primary-foreground font-medium">{chat.unreadCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-background border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{selectedChatData?.userName}</h3>
                    <p className="text-sm text-muted-foreground">{selectedChatData?.userEmail}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="w-9 h-9 p-0 hover:bg-muted">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="w-9 h-9 p-0 hover:bg-muted">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="w-9 h-9 p-0 hover:bg-muted">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 bg-gradient-to-b from-muted/10 to-muted/5 relative overflow-hidden">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}
                      >
                        <div className="flex items-end gap-2 max-w-[70%]">
                          {message.sender === "user" && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-muted/60 to-muted/80 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div
                            className={`relative px-4 py-2 rounded-2xl shadow-sm max-w-full ${
                              message.sender === "admin"
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-background border border-border/50 rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm leading-relaxed break-words">{message.message}</p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span
                                className={`text-xs ${
                                  message.sender === "admin" ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}
                              >
                                {message.timestamp}
                              </span>
                              {message.sender === "admin" && (
                                <div className="flex gap-0.5 ml-1">
                                  <div className="w-1 h-1 bg-primary-foreground/70 rounded-full"></div>
                                  <div className="w-1 h-1 bg-primary-foreground/70 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Message Input Area */}
              <div className="p-4 bg-background border-t border-border">
                {/* Quick Replies */}
                <div className="mb-3">
                  <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-2">
                      {quickReplies.slice(0, 3).map((reply, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickReply(reply)}
                          className="text-xs h-7 px-3 rounded-full hover:bg-primary/10 whitespace-nowrap flex-shrink-0"
                        >
                          {reply.substring(0, 30)}...
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Input Row */}
                <div className="flex items-end gap-3">
                  <Button size="sm" variant="ghost" className="w-9 h-9 p-0 flex-shrink-0 hover:bg-muted">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="rounded-full pr-12 py-2 h-10 bg-muted/30 border-muted focus:bg-background focus:border-primary/50"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 p-0 rounded-full hover:bg-muted"
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    className="w-10 h-10 p-0 rounded-full bg-primary hover:bg-primary/90 flex-shrink-0"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/5">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">Select a chat to start messaging</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a conversation from the sidebar to begin chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
