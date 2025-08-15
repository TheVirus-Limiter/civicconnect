import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ExternalLink,
  Phone,
  User,
  Mail,
  Languages,
  MessageSquare,
  CheckCircle
} from "lucide-react";
import type { CivicEvent, EventRsvp } from "@shared/schema";

interface EventsResponse {
  events: CivicEvent[];
}

export default function Events() {
  const [selectedLevel, setSelectedLevel] = useState<"federal" | "state" | "local" | "all">("all");
  const [rsvpDialog, setRsvpDialog] = useState<{ open: boolean; event?: CivicEvent }>({ open: false });
  const [rsvpForm, setRsvpForm] = useState({
    attendeeName: "",
    attendeeEmail: "",
    attendeePhone: "",
    preferredLanguage: "en",
    accessibilityNeeds: "",
    questions: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['/api/events', selectedLevel],
  });

  const rsvpMutation = useMutation({
    mutationFn: async (data: { eventId: string; rsvpData: any }) => {
      return await apiRequest(`/api/events/${data.eventId}/rsvp`, {
        method: 'POST',
        body: JSON.stringify(data.rsvpData),
      });
    },
    onSuccess: () => {
      toast({
        title: "RSVP Confirmed",
        description: "Your RSVP has been submitted successfully. You'll receive a confirmation email shortly.",
      });
      setRsvpDialog({ open: false });
      setRsvpForm({
        attendeeName: "",
        attendeeEmail: "",
        attendeePhone: "",
        preferredLanguage: "en",
        accessibilityNeeds: "",
        questions: "",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: (error) => {
      toast({
        title: "RSVP Failed",
        description: error.message || "Failed to submit RSVP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRsvp = (event: CivicEvent) => {
    setRsvpDialog({ open: true, event });
  };

  const submitRsvp = () => {
    if (!rsvpDialog.event) return;
    
    rsvpMutation.mutate({
      eventId: rsvpDialog.event.id,
      rsvpData: rsvpForm
    });
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "federal": return "default";
      case "state": return "secondary";
      case "local": return "outline";
      default: return "default";
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case "town_hall": return "🏛️";
      case "hearing": return "👂";
      case "committee_meeting": return "📋";
      case "community_forum": return "🗣️";
      default: return "📅";
    }
  };

  const events = eventsData?.events || [];
  const upcomingEvents = events.filter((event: CivicEvent) => new Date(event.date) > new Date());

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Town Halls & Community Events
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Engage with your representatives and participate in local democracy
          </p>
        </div>

        <Tabs value={selectedLevel} onValueChange={(value) => setSelectedLevel(value as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="federal">Federal</TabsTrigger>
            <TabsTrigger value="state">State</TabsTrigger>
            <TabsTrigger value="local">Local</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedLevel} className="mt-6">
            {upcomingEvents.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Events</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Check back later for new town halls and community meetings.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event: CivicEvent) => (
                  <Card key={event.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={getLevelBadgeVariant(event.level)} className="capitalize">
                          {event.level}
                        </Badge>
                        <span className="text-2xl">{getEventTypeIcon(event.eventType)}</span>
                      </div>
                      <CardTitle className="text-lg leading-tight">{event.title}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {event.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(event.date), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <User className="h-4 w-4 mr-2" />
                        {event.organizer}
                      </div>

                      {event.maxAttendees && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Users className="h-4 w-4 mr-2" />
                          {event.currentAttendees || 0} / {event.maxAttendees} attendees
                        </div>
                      )}

                      {event.language === "both" && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Languages className="h-4 w-4 mr-2" />
                          English & Spanish
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        {event.requiresRsvp && (
                          <Button 
                            onClick={() => handleRsvp(event)} 
                            size="sm" 
                            className="flex-1"
                            disabled={
                              event.maxAttendees && 
                              (event.currentAttendees || 0) >= event.maxAttendees
                            }
                          >
                            {event.maxAttendees && (event.currentAttendees || 0) >= event.maxAttendees 
                              ? "Full" 
                              : "RSVP"
                            }
                          </Button>
                        )}
                        
                        {event.virtualUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={event.virtualUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>

                      {event.rsvpDeadline && (
                        <div className="flex items-center text-xs text-amber-600 dark:text-amber-400">
                          <Clock className="h-3 w-3 mr-1" />
                          RSVP by {format(new Date(event.rsvpDeadline), "MMM d, yyyy")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* RSVP Dialog */}
        <Dialog open={rsvpDialog.open} onOpenChange={(open) => setRsvpDialog({ open })}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>RSVP for {rsvpDialog.event?.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={rsvpForm.attendeeName}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, attendeeName: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={rsvpForm.attendeeEmail}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, attendeeEmail: e.target.value })}
                  placeholder="Enter your email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={rsvpForm.attendeePhone}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, attendeePhone: e.target.value })}
                  placeholder="Optional - for event updates"
                />
              </div>

              {rsvpDialog.event?.language === "both" && (
                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select value={rsvpForm.preferredLanguage} onValueChange={(value) => setRsvpForm({ ...rsvpForm, preferredLanguage: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="accessibility">Accessibility Needs</Label>
                <Textarea
                  id="accessibility"
                  value={rsvpForm.accessibilityNeeds}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, accessibilityNeeds: e.target.value })}
                  placeholder="Any special accommodations needed?"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="questions">Questions for the Event</Label>
                <Textarea
                  id="questions"
                  value={rsvpForm.questions}
                  onChange={(e) => setRsvpForm({ ...rsvpForm, questions: e.target.value })}
                  placeholder="Any questions you'd like to ask during the event?"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setRsvpDialog({ open: false })}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitRsvp}
                  disabled={!rsvpForm.attendeeName || !rsvpForm.attendeeEmail || rsvpMutation.isPending}
                  className="flex-1"
                >
                  {rsvpMutation.isPending ? "Submitting..." : "Confirm RSVP"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}