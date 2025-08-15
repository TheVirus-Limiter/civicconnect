import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Send, Mic, Globe, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  language?: string;
}

interface ChatSession {
  id: string;
  messages: ChatMessage[];
}

export default function CivicaChatbot() {
  const { t, language } = useTranslation();
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm Civica, your AI assistant for understanding legislation. I can help explain bills, their impacts, and answer questions about the legislative process. What would you like to know?",
      timestamp: new Date().toISOString(),
      language,
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create chat session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/chat/sessions", {});
      return response.json();
    },
    onSuccess: (session: ChatSession) => {
      setSessionId(session.id);
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; sessionId: string | null; language: string }) => {
      const response = await apiRequest("POST", "/api/chat", messageData);
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
        language,
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date().toISOString(),
        language,
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
      language,
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");

    sendMessageMutation.mutate({
      message: message.trim(),
      sessionId,
      language,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!sessionId) {
      createSessionMutation.mutate();
    }
  }, []);

  // Update greeting when language changes
  useEffect(() => {
    setMessages(prev => [
      {
        role: "assistant",
        content: "Hello! I'm Civica, your AI assistant for understanding legislation. I can help explain bills, their impacts, and answer questions about the legislative process. What would you like to know?",
        timestamp: new Date().toISOString(),
        language,
      },
      ...prev.slice(1),
    ]);
  }, [language, t]);

  return (
    <section id="civica-chat" className="mb-12">
      <div className="bg-gradient-to-r from-primary/5 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-8 border border-primary/20 dark:border-slate-600">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Bot className="text-primary-foreground text-xl w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Meet Civica</h3>
            <p className="text-muted-foreground">Your AI assistant for understanding legislation</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <ScrollArea className="h-96 pr-4">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex space-x-3 ${msg.role === "user" ? "justify-end" : ""}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="text-primary-foreground text-sm w-4 h-4" />
                      </div>
                    )}
                    
                    <div className={`flex-1 ${msg.role === "user" ? "max-w-xs" : ""}`}>
                      <div
                        className={`rounded-lg p-3 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <span className={`text-xs text-muted-foreground mt-1 block ${
                        msg.role === "user" ? "text-right" : ""
                      }`}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>

                    {msg.role === "user" && (
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="text-muted-foreground text-sm w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {sendMessageMutation.isPending && (
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="text-primary-foreground text-sm w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-100"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="border-t border-border pt-4 mt-4">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder={t("civica.placeholder")}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sendMessageMutation.isPending}
                      className="pr-20"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          // Toggle language functionality would be implemented here
                        }}
                      >
                        <Globe className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          // Voice input functionality would be implemented here
                        }}
                      >
                        <Mic className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleQuickQuestion(t("civica.quickQuestions.howBillBecomesLaw"))}
                  disabled={sendMessageMutation.isPending}
                >
                  {t("civica.quickQuestions.howBillBecomesLaw")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleQuickQuestion(t("civica.quickQuestions.localNews"))}
                  disabled={sendMessageMutation.isPending}
                >
                  {t("civica.quickQuestions.localNews")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleQuickQuestion(t("civica.quickQuestions.explainBill"))}
                  disabled={sendMessageMutation.isPending}
                >
                  {t("civica.quickQuestions.explainBill")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
