import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThumbsUp, ThumbsDown, MessageSquare, Plus, Calendar, User, ChevronDown, ChevronUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { FeedbackSubmission, FeedbackComment } from "@shared/schema";

const feedbackSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  category: z.string().min(1, "Category is required"),
  userEmail: z.string().email("Valid email is required").optional().or(z.literal("")),
  tags: z.string().optional(),
});

interface FeedbackWithComments extends FeedbackSubmission {
  comments?: FeedbackComment[];
}

export function CommunityFeedback() {
  const [activeTab, setActiveTab] = useState<string>("browse");
  const [language, setLanguage] = useState<string>("en");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ["/api/feedback", { isPublic: true }],
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: z.infer<typeof feedbackSchema>) => {
      const tags = data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [];
      await apiRequest("/api/feedback", {
        method: "POST",
        body: {
          ...data,
          tags,
          userEmail: data.userEmail || null,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      setActiveTab("browse");
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ feedbackId, voteType }: { feedbackId: string; voteType: "upvote" | "downvote" }) => {
      await apiRequest(`/api/feedback/${feedbackId}/vote`, {
        method: "POST",
        body: { voteType, userId: null }, // Anonymous voting for now
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
    },
  });

  const submissions: FeedbackWithComments[] = feedbackData?.submissions || [];

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleVote = async (feedbackId: string, voteType: "upvote" | "downvote") => {
    try {
      await voteMutation.mutateAsync({ feedbackId, voteType });
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {language === "es" ? "Comentarios de la Comunidad" : "Community Feedback"}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {language === "es" 
            ? "Comparte tus ideas y preocupaciones con tu representante"
            : "Share your ideas and concerns with your representative"
          }
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">
            {language === "es" ? "Ver Comentarios" : "Browse Feedback"}
          </TabsTrigger>
          <TabsTrigger value="submit">
            {language === "es" ? "Enviar Comentario" : "Submit Feedback"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {submissions.length > 0 ? (
            submissions.map((submission) => (
              <FeedbackCard 
                key={submission.id} 
                submission={submission} 
                language={language}
                isExpanded={expandedItems.has(submission.id)}
                onToggleExpanded={() => toggleExpanded(submission.id)}
                onVote={handleVote}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {language === "es" ? "No hay comentarios aún" : "No feedback yet"}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {language === "es" 
                    ? "Sé el primero en compartir tu opinión."
                    : "Be the first to share your thoughts."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="submit">
          <FeedbackForm 
            onSubmit={submitFeedbackMutation.mutateAsync}
            isSubmitting={submitFeedbackMutation.isPending}
            language={language}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FeedbackCard({ 
  submission, 
  language, 
  isExpanded, 
  onToggleExpanded, 
  onVote 
}: { 
  submission: FeedbackWithComments; 
  language: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onVote: (feedbackId: string, voteType: "upvote" | "downvote") => void;
}) {
  const getCategoryBadge = (category: string) => {
    const categoryMap = {
      bill_feedback: { en: "Bill Feedback", es: "Comentario de Ley", variant: "default" as const },
      general: { en: "General", es: "General", variant: "secondary" as const },
      feature_request: { en: "Feature Request", es: "Solicitud", variant: "outline" as const },
      issue_report: { en: "Issue Report", es: "Reporte", variant: "destructive" as const },
    };
    
    const info = categoryMap[category as keyof typeof categoryMap] || categoryMap.general;
    return (
      <Badge variant={info.variant}>
        {language === "es" ? info.es : info.en}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { en: "Pending", es: "Pendiente", variant: "outline" as const },
      reviewed: { en: "Reviewed", es: "Revisado", variant: "secondary" as const },
      responded: { en: "Responded", es: "Respondido", variant: "default" as const },
      closed: { en: "Closed", es: "Cerrado", variant: "destructive" as const },
    };
    
    const info = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return (
      <Badge variant={info.variant}>
        {language === "es" ? info.es : info.en}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{submission.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {getCategoryBadge(submission.category)}
              {getStatusBadge(submission.status)}
              {submission.priority && submission.priority !== "medium" && (
                <Badge variant={submission.priority === "high" ? "destructive" : "outline"}>
                  {submission.priority === "high" ? 
                    (language === "es" ? "Alta Prioridad" : "High Priority") :
                    (language === "es" ? "Baja Prioridad" : "Low Priority")
                  }
                </Badge>
              )}
            </div>
            {submission.tags && submission.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {submission.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className={`text-gray-700 dark:text-gray-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
            {submission.content}
          </div>
          
          {submission.content.length > 200 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpanded}
              className="text-blue-600 hover:text-blue-800 p-0 h-auto font-normal"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  {language === "es" ? "Ver menos" : "Show less"}
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  {language === "es" ? "Ver más" : "Show more"}
                </>
              )}
            </Button>
          )}

          {submission.adminResponse && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  {language === "es" ? "Respuesta Oficial" : "Official Response"}
                </span>
              </div>
              <p className="text-blue-800 dark:text-blue-200">{submission.adminResponse}</p>
              {submission.respondedAt && (
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                  {new Date(submission.respondedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote(submission.id, "upvote")}
                className="flex items-center gap-1 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{submission.upvotes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote(submission.id, "downvote")}
                className="flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <ThumbsDown className="w-4 h-4" />
                <span>{submission.downvotes}</span>
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {language === "es" ? "ID: " : "ID: "}{submission.id.slice(-8)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FeedbackForm({ 
  onSubmit, 
  isSubmitting, 
  language 
}: { 
  onSubmit: (data: z.infer<typeof feedbackSchema>) => Promise<void>;
  isSubmitting: boolean;
  language: string;
}) {
  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      userEmail: "",
      tags: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {language === "es" ? "Enviar Comentario" : "Submit Feedback"}
        </CardTitle>
        <CardDescription>
          {language === "es" 
            ? "Comparte tus ideas, preocupaciones o sugerencias sobre temas en TX-23."
            : "Share your ideas, concerns, or suggestions about issues in TX-23."
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {language === "es" ? "Categoría" : "Category"}
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={language === "es" ? "Selecciona una categoría" : "Select a category"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">
                        {language === "es" ? "General" : "General"}
                      </SelectItem>
                      <SelectItem value="bill_feedback">
                        {language === "es" ? "Comentario sobre Ley" : "Bill Feedback"}
                      </SelectItem>
                      <SelectItem value="feature_request">
                        {language === "es" ? "Solicitud de Función" : "Feature Request"}
                      </SelectItem>
                      <SelectItem value="issue_report">
                        {language === "es" ? "Reporte de Problema" : "Issue Report"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {language === "es" ? "Título" : "Title"}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={language === "es" ? "Breve resumen de tu comentario" : "Brief summary of your feedback"} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {language === "es" ? "Contenido" : "Content"}
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={language === "es" ? "Explica tu comentario en detalle..." : "Explain your feedback in detail..."} 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {language === "es" ? "Email (Opcional)" : "Email (Optional)"}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder={language === "es" ? "tu@email.com" : "your@email.com"} 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    {language === "es" 
                      ? "Para recibir actualizaciones sobre tu comentario"
                      : "To receive updates about your feedback"
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {language === "es" ? "Etiquetas (Opcional)" : "Tags (Optional)"}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={language === "es" ? "transporte, educación, salud" : "transportation, education, healthcare"} 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    {language === "es" 
                      ? "Separa las etiquetas con comas"
                      : "Separate tags with commas"
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                language === "es" ? "Enviando..." : "Submitting..."
              ) : (
                language === "es" ? "Enviar Comentario" : "Submit Feedback"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}