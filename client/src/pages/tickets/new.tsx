import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Layout from "../../components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  FileUp,
  HelpCircle,
  Send
} from "lucide-react";

// Form schema
const createTicketSchema = z.object({
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters long"
  }).max(100, {
    message: "Subject must be at most 100 characters long"
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters long"
  }),
  category: z.string({
    required_error: "Please select a category"
  }),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Please select a priority"
  }),
  attachments: z.array(z.string()).optional()
});

type FormValues = z.infer<typeof createTicketSchema>;

export default function NewTicket() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Define ticket categories
  const categories = [
    "General Inquiry",
    "Technical Support",
    "Billing & Subscription",
    "Feature Request",
    "Bug Report",
    "Account Management",
    "Data Management",
    "Integration Issues",
    "Security Concern",
    "Other"
  ];
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      subject: "",
      description: "",
      category: "",
      priority: "medium",
      attachments: []
    }
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest(
        "POST",
        "/api/support-tickets",
        values
      );
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh the tickets list
      queryClient.invalidateQueries({queryKey: ['/api/support-tickets']});
      
      toast({
        title: t('newTicket.ticketCreated'),
        description: t('newTicket.ticketCreatedDescription')
      });
      
      // Redirect to the ticket detail page
      setLocation(`/support/tickets/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: t('newTicket.ticketCreateError'),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    createTicketMutation.mutate(values);
  };

  if (!user) {
    return (
      <Layout>
        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>{t('newTicket.loginRequired.title')}</CardTitle>
              <CardDescription>{t('newTicket.loginRequired.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/login">{t('newTicket.loginRequired.loginButton')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center">
          <Link href="/support">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              {t('newTicket.backToSupport')}
            </Button>
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
          <Link href="/support/tickets">
            <Button variant="ghost" size="sm">
              {t('newTicket.supportTickets')}
            </Button>
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
          <span className="text-muted-foreground">{t('newTicket.title')}</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('newTicket.title')}</CardTitle>
            <CardDescription>{t('newTicket.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('newTicket.form.subject')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('newTicket.form.subjectPlaceholder')} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('newTicket.form.category')}</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('newTicket.form.categoryPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('newTicket.form.priority')}</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('newTicket.form.priorityPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">{t('newTicket.form.lowPriority')}</SelectItem>
                            <SelectItem value="medium">{t('newTicket.form.mediumPriority')}</SelectItem>
                            <SelectItem value="high">{t('newTicket.form.highPriority')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('newTicket.form.description')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('newTicket.form.descriptionPlaceholder')} 
                          className="min-h-[180px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <Label>{t('newTicket.form.attachments')}</Label>
                  <div className="mt-2 flex items-center">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="gap-1"
                      disabled
                    >
                      <FileUp className="h-4 w-4" />
                      {t('newTicket.form.attachFilesButton')}
                    </Button>
                    <span className="text-xs text-muted-foreground ml-3">
                      {t('newTicket.form.comingSoon')}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-between">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setLocation("/support/tickets")}
                  >
                    {t('newTicket.form.cancel')}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createTicketMutation.isPending}
                    className="gap-1"
                  >
                    {createTicketMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('newTicket.form.submitting')}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {t('newTicket.form.submitTicket')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              {t('newTicket.helpBox.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>{t('newTicket.helpBox.tip1')}</p>
              <p>{t('newTicket.helpBox.tip2')}</p>
              <p>{t('newTicket.helpBox.tip3')}</p>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="w-full flex flex-col sm:flex-row justify-between gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/support/faq">{t('newTicket.helpBox.viewFaq')}</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/support/knowledge-base">{t('newTicket.helpBox.browseKnowledgeBase')}</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}