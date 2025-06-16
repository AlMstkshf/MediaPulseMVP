import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SupportTicket } from "@shared/schema";
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Plus,
  Filter
} from "lucide-react";

// Status badge variants
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'open':
      return 'default';
    case 'in-progress':
      return 'secondary';
    case 'resolved':
      return 'success';
    case 'closed':
      return 'outline';
    default:
      return 'outline';
  }
};

// Priority badge variants
const getPriorityBadgeVariant = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    default:
      return 'outline';
  }
};

// Status icons
const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'open':
      return <HelpCircle className="h-4 w-4" />;
    case 'in-progress':
      return <Clock className="h-4 w-4" />;
    case 'resolved':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'closed':
      return <CheckCircle2 className="h-4 w-4" />;
    default:
      return <HelpCircle className="h-4 w-4" />;
  }
};

export default function SupportTickets() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Fetch tickets
  const { data: tickets, isLoading, error } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support-tickets", { status: activeTab !== "all" ? activeTab : undefined }],
    queryFn: async () => {
      const url = activeTab !== "all" 
        ? `/api/support-tickets?status=${activeTab}` 
        : "/api/support-tickets";
        
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch support tickets");
      return res.json();
    },
    enabled: !!user
  });

  // Format date to localized string
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  if (!user) {
    return (
      <Layout>
        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>{t('supportTickets.loginRequired.title')}</CardTitle>
              <CardDescription>{t('supportTickets.loginRequired.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/login">{t('supportTickets.loginRequired.loginButton')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center">
              <Link href="/support">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  {t('supportTickets.backToSupport')}
                </Button>
              </Link>
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
              <span className="text-muted-foreground">{t('supportTickets.title')}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-2">{t('supportTickets.title')}</h1>
            <p className="text-muted-foreground">{t('supportTickets.subtitle')}</p>
          </div>
          
          <Button asChild className="gap-1">
            <Link href="/support/tickets/new">
              <Plus className="h-4 w-4" />
              {t('supportTickets.newTicket')}
            </Link>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">
                {t('supportTickets.tabs.all')}
              </TabsTrigger>
              <TabsTrigger value="open">
                {t('supportTickets.tabs.open')}
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                {t('supportTickets.tabs.inProgress')}
              </TabsTrigger>
              <TabsTrigger value="resolved">
                {t('supportTickets.tabs.resolved')}
              </TabsTrigger>
              <TabsTrigger value="closed">
                {t('supportTickets.tabs.closed')}
              </TabsTrigger>
            </TabsList>
            
            {isAdmin && (
              <div className="text-sm text-muted-foreground">
                {t('supportTickets.adminView')}
              </div>
            )}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                {activeTab === "all" 
                  ? t('supportTickets.allTickets') 
                  : t(`supportTickets.statusTickets.${activeTab}`)}
              </CardTitle>
              <CardDescription>
                {activeTab === "all"
                  ? t('supportTickets.allTicketsDescription')
                  : t(`supportTickets.statusTicketsDescription.${activeTab}`)}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center p-10">
                  <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
                  <p className="text-destructive mb-2">{t('supportTickets.errorLoading')}</p>
                  <Button onClick={() => window.location.reload()}>
                    {t('supportTickets.tryAgain')}
                  </Button>
                </div>
              ) : tickets && tickets.length > 0 ? (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border rounded-lg p-4 hover:border-primary transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(ticket.status)} className="gap-1">
                            <StatusIcon status={ticket.status} />
                            {t(`supportTickets.status.${ticket.status}`)}
                          </Badge>
                          <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                            {t(`supportTickets.priority.${ticket.priority}`)}
                          </Badge>
                          <Badge variant="outline">
                            {ticket.category}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {formatDate(ticket.createdAt)}
                        </div>
                      </div>
                      
                      <Link href={`/support/tickets/${ticket.id}`}>
                        <h3 className="text-lg font-medium hover:text-primary hover:underline transition-colors">
                          {ticket.subject}
                        </h3>
                      </Link>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-3">
                        {ticket.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          ID: #{ticket.id}
                        </div>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/support/tickets/${ticket.id}`}>
                            {t('supportTickets.viewDetails')}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-10">
                  <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    {t('supportTickets.noTicketsFound')}
                  </p>
                  <Button asChild>
                    <Link href="/support/tickets/new">
                      {t('supportTickets.createFirstTicket')}
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs>

        {/* Help Box */}
        <Card>
          <CardHeader>
            <CardTitle>{t('supportTickets.needHelp.title')}</CardTitle>
            <CardDescription>{t('supportTickets.needHelp.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="outline">
                <Link href="/support/faq">{t('supportTickets.needHelp.browseFaq')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/support/knowledge-base">{t('supportTickets.needHelp.browseKnowledgeBase')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}