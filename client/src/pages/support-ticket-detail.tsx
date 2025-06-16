import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { SupportTicket, TicketResponse } from "@shared/schema";
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Upload,
  Send,
  XCircle,
  User,
  FileText,
  Settings
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

// Response schema
const responseSchema = z.object({
  message: z.string().min(2, {
    message: "Message must be at least 2 characters long"
  }),
  attachments: z.array(z.string()).optional()
});

// Status update schema
const statusUpdateSchema = z.object({
  status: z.enum(['open', 'in-progress', 'resolved', 'closed'])
});

type ResponseFormValues = z.infer<typeof responseSchema>;
type StatusUpdateFormValues = z.infer<typeof statusUpdateSchema>;

interface TicketDataResponse {
  ticket: SupportTicket;
  responses: TicketResponse[];
}

export default function SupportTicketDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const ticketId = parseInt(id);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  
  // Form for adding a new response
  const responseForm = useForm<ResponseFormValues>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      message: "",
      attachments: []
    }
  });

  // Form for updating ticket status
  const statusForm = useForm<StatusUpdateFormValues>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: 'open'
    }
  });
  
  // Fetch ticket details and responses
  const { data, isLoading, error } = useQuery<TicketDataResponse>({
    queryKey: [`/api/support-tickets/${ticketId}`],
    queryFn: async () => {
      if (isNaN(ticketId)) throw new Error("Invalid ticket ID");
      const res = await fetch(`/api/support-tickets/${ticketId}`);
      if (!res.ok) throw new Error("Failed to fetch ticket details");
      return res.json();
    },
    enabled: !isNaN(ticketId) && !!user
  });

  // Add response mutation
  const addResponseMutation = useMutation({
    mutationFn: async (values: ResponseFormValues) => {
      const response = await apiRequest(
        "POST",
        `/api/support-tickets/${ticketId}/responses`,
        values
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/support-tickets/${ticketId}`] });
      responseForm.reset();
      toast({
        title: t('ticketDetail.responseAdded'),
        description: t('ticketDetail.responseAddedDescription')
      });
    },
    onError: (error) => {
      toast({
        title: t('ticketDetail.responseError'),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update ticket status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (values: StatusUpdateFormValues) => {
      const response = await apiRequest(
        "PATCH",
        `/api/support-tickets/${ticketId}`,
        values
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/support-tickets/${ticketId}`] });
      setIsStatusDialogOpen(false);
      toast({
        title: t('ticketDetail.statusUpdated'),
        description: t('ticketDetail.statusUpdatedDescription')
      });
    },
    onError: (error) => {
      toast({
        title: t('ticketDetail.statusUpdateError'),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Format date to localized string
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Handle submit response
  const onSubmitResponse = (values: ResponseFormValues) => {
    addResponseMutation.mutate(values);
  };

  // Handle submit status update
  const onSubmitStatusUpdate = (values: StatusUpdateFormValues) => {
    updateStatusMutation.mutate(values);
  };

  if (!user) {
    return (
      <Layout>
        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>{t('ticketDetail.loginRequired.title')}</CardTitle>
              <CardDescription>{t('ticketDetail.loginRequired.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/login">{t('ticketDetail.loginRequired.loginButton')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isNaN(ticketId)) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-destructive">
            {t('ticketDetail.invalidId')}
          </h1>
          <p className="mb-4">{t('ticketDetail.invalidIdDescription')}</p>
          <Button asChild>
            <Link href="/support/tickets">
              {t('ticketDetail.backToTickets')}
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center">
          <Link href="/support">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              {t('ticketDetail.backToSupport')}
            </Button>
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
          <Link href="/support/tickets">
            <Button variant="ghost" size="sm">
              {t('ticketDetail.supportTickets')}
            </Button>
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
          <span className="text-muted-foreground truncate max-w-[200px]">
            {isLoading ? t('ticketDetail.loading') : data?.ticket?.subject || t('ticketDetail.ticket')}
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : error || !data?.ticket ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-4">{t('ticketDetail.errorLoading')}</p>
              <Button asChild>
                <Link href="/support/tickets">
                  {t('ticketDetail.backToTickets')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant={getStatusBadgeVariant(data.ticket.status)} className="gap-1">
                        <StatusIcon status={data.ticket.status} />
                        {t(`ticketDetail.status.${data.ticket.status}`)}
                      </Badge>
                      <Badge variant={getPriorityBadgeVariant(data.ticket.priority)}>
                        {t(`ticketDetail.priority.${data.ticket.priority}`)}
                      </Badge>
                      <Badge variant="outline">
                        {data.ticket.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl">{data.ticket.subject}</CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                      ID: #{data.ticket.id} • {t('ticketDetail.createdOn', { date: formatDate(data.ticket.createdAt) })}
                    </div>
                  </div>
                  
                  {/* Status Management (Admin only) */}
                  {isAdmin && (
                    <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Settings className="h-4 w-4" />
                          {t('ticketDetail.manageTicket')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('ticketDetail.updateTicketStatus')}</DialogTitle>
                          <DialogDescription>
                            {t('ticketDetail.updateTicketStatusDescription')}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Form {...statusForm}>
                          <form onSubmit={statusForm.handleSubmit(onSubmitStatusUpdate)} className="space-y-4">
                            <FormField
                              control={statusForm.control}
                              name="status"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('ticketDetail.status.label')}</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={data.ticket.status}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder={t('ticketDetail.status.selectStatus')} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="open">{t('ticketDetail.status.open')}</SelectItem>
                                      <SelectItem value="in-progress">{t('ticketDetail.status.in-progress')}</SelectItem>
                                      <SelectItem value="resolved">{t('ticketDetail.status.resolved')}</SelectItem>
                                      <SelectItem value="closed">{t('ticketDetail.status.closed')}</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <DialogFooter>
                              <Button 
                                type="submit" 
                                disabled={updateStatusMutation.isPending}
                              >
                                {updateStatusMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('ticketDetail.updating')}
                                  </>
                                ) : (
                                  t('ticketDetail.updateStatus')
                                )}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  {/* Regular user can close ticket */}
                  {!isAdmin && data.ticket.status !== 'closed' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                          <XCircle className="h-4 w-4" />
                          {t('ticketDetail.closeTicket')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('ticketDetail.closeTicketDialog.title')}</DialogTitle>
                          <DialogDescription>
                            {t('ticketDetail.closeTicketDialog.description')}
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="ghost" onClick={() => {
                            updateStatusMutation.mutate({ status: 'closed' });
                          }}>
                            {t('ticketDetail.closeTicketDialog.cancel')}
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => {
                              updateStatusMutation.mutate({ status: 'closed' });
                            }}
                            disabled={updateStatusMutation.isPending}
                          >
                            {updateStatusMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('ticketDetail.closing')}
                              </>
                            ) : (
                              t('ticketDetail.closeTicketDialog.confirm')
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              
              <Separator />
              
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-lg mb-2 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      {t('ticketDetail.description')}
                    </h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/50 p-4 rounded-md">
                      <p>{data.ticket.description}</p>
                    </div>

                    {data.ticket.attachments && data.ticket.attachments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">{t('ticketDetail.attachments')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {data.ticket.attachments.map((attachment, index) => (
                            <a 
                              key={index}
                              href={attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-muted px-3 py-1 rounded text-sm inline-flex items-center gap-1 hover:bg-muted/80"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              {t('ticketDetail.attachment')} {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ticket status alerts */}
                  {(data.ticket.status === 'resolved' || data.ticket.status === 'closed') && (
                    <Alert variant={data.ticket.status === 'resolved' ? 'default' : 'destructive'}>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>
                        {data.ticket.status === 'resolved'
                          ? t('ticketDetail.alerts.resolved.title')
                          : t('ticketDetail.alerts.closed.title')}
                      </AlertTitle>
                      <AlertDescription>
                        {data.ticket.status === 'resolved'
                          ? t('ticketDetail.alerts.resolved.description')
                          : t('ticketDetail.alerts.closed.description')}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Responses */}
                  <div>
                    <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      {t('ticketDetail.responses')} ({data.responses.length})
                    </h3>
                    
                    {data.responses.length === 0 ? (
                      <div className="text-center py-6 bg-muted/50 rounded-md">
                        <p className="text-muted-foreground">
                          {t('ticketDetail.noResponses')}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {data.responses.map((response) => (
                          <div 
                            key={response.id} 
                            className={`border rounded-lg p-4 ${
                              response.isStaff ? 'bg-muted/30' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {response.isStaff ? 'S' : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <div className="font-medium flex items-center gap-2">
                                    {response.isStaff && (
                                      <Badge variant="outline" className="text-xs">
                                        {t('ticketDetail.staffResponse')}
                                      </Badge>
                                    )}
                                    <span>
                                      {response.isStaff 
                                        ? t('ticketDetail.supportTeam') 
                                        : t('ticketDetail.you')}
                                    </span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatDate(response.createdAt)}
                                  </div>
                                </div>
                                
                                <div className="text-sm whitespace-pre-wrap">
                                  {response.message}
                                </div>
                                
                                {response.attachments && response.attachments.length > 0 && (
                                  <div className="mt-3">
                                    <div className="text-xs text-muted-foreground mb-1">
                                      {t('ticketDetail.attachments')}:
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {response.attachments.map((attachment, index) => (
                                        <a 
                                          key={index}
                                          href={attachment}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="bg-muted px-2 py-1 rounded text-xs inline-flex items-center gap-1 hover:bg-muted/80"
                                        >
                                          <FileText className="h-3 w-3" />
                                          {t('ticketDetail.attachment')} {index + 1}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Response Form */}
                  {(data.ticket.status !== 'closed') && (
                    <div>
                      <h3 className="font-medium mb-3">{t('ticketDetail.addResponse')}</h3>
                      <Form {...responseForm}>
                        <form onSubmit={responseForm.handleSubmit(onSubmitResponse)} className="space-y-4">
                          <FormField
                            control={responseForm.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea 
                                    placeholder={t('ticketDetail.responsePlaceholder')}
                                    className="min-h-[120px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <Label className="text-sm text-muted-foreground mb-2">
                                {t('ticketDetail.attachFilesLabel')}
                              </Label>
                              <div className="flex items-center">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-1"
                                  disabled
                                >
                                  <Upload className="h-4 w-4" />
                                  {t('ticketDetail.attachFiles')}
                                </Button>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {t('ticketDetail.comingSoon')}
                                </span>
                              </div>
                            </div>
                            
                            <Button 
                              type="submit" 
                              disabled={addResponseMutation.isPending}
                              className="gap-1"
                            >
                              {addResponseMutation.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  {t('ticketDetail.sending')}
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4" />
                                  {t('ticketDetail.sendResponse')}
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ticket Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('ticketDetail.ticketInfo.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">{t('ticketDetail.ticketInfo.ticketId')}</h4>
                    <p className="text-sm text-muted-foreground">#{data.ticket.id}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">{t('ticketDetail.ticketInfo.status')}</h4>
                    <Badge variant={getStatusBadgeVariant(data.ticket.status)} className="gap-1">
                      <StatusIcon status={data.ticket.status} />
                      {t(`ticketDetail.status.${data.ticket.status}`)}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">{t('ticketDetail.ticketInfo.category')}</h4>
                    <p className="text-sm text-muted-foreground">{data.ticket.category}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">{t('ticketDetail.ticketInfo.priority')}</h4>
                    <Badge variant={getPriorityBadgeVariant(data.ticket.priority)}>
                      {t(`ticketDetail.priority.${data.ticket.priority}`)}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">{t('ticketDetail.ticketInfo.created')}</h4>
                    <p className="text-sm text-muted-foreground">{formatDate(data.ticket.createdAt)}</p>
                  </div>
                  
                  {data.ticket.resolvedAt && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">{t('ticketDetail.ticketInfo.resolved')}</h4>
                      <p className="text-sm text-muted-foreground">{formatDate(data.ticket.resolvedAt)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t">
                <div className="flex w-full justify-between">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/support/tickets">
                      {t('ticketDetail.backToAllTickets')}
                    </Link>
                  </Button>
                  
                  {data.ticket.status === 'closed' && (
                    <Button asChild variant="outline" size="sm">
                      <Link href="/support/tickets/new">
                        {t('ticketDetail.createNewTicket')}
                      </Link>
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}