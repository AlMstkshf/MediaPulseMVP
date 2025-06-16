import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Phone, MapPin, Clock, ArrowLeft, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout";
import { insertContactMessageSchema } from "@shared/schema";

export default function ContactPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Extended schema with validation
  const contactFormSchema = insertContactMessageSchema.extend({
    email: z.string()
      .min(1, { message: t("validation.required") })
      .email({ message: t("validation.invalidEmail") }),
    name: z.string().min(1, { message: t("validation.required") }),
    subject: z.string().min(1, { message: t("validation.required") }),
    message: z.string().min(10, { message: t("validation.minLength", { length: 10 }) }),
    department: z.string().min(1, { message: t("validation.required") }),
  });

  type FormValues = z.infer<typeof contactFormSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      department: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (formData: FormValues) => {
      const response = await apiRequest("POST", "/api/contact", formData);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
    },
    onError: (error) => {
      toast({
        title: t("contact.errorTitle"),
        description: t("contact.errorMessage"),
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: FormValues) {
    contactMutation.mutate(data);
  }

  return (
    <Layout>
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        {!isSubmitted ? (
          <>
            <div className="flex justify-start mb-8">
              <Link href="/support" className="text-primary hover:underline flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                <span>{t("contact.backToHome")}</span>
              </Link>
            </div>

            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold">{t("contact.title")}</h1>
              <p className="text-muted-foreground mt-2">{t("contact.subtitle")}</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Contact Form */}
              <Card className="md:col-span-2">
                <CardContent className="p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("contact.form.name")}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t("contact.form.namePlaceholder")}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("contact.form.email")}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t("contact.form.emailPlaceholder")}
                                  type="email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("contact.form.subject")}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t("contact.form.subjectPlaceholder")}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("contact.form.department")}</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t("contact.form.departmentPlaceholder")} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="support">{t("contact.form.departments.support")}</SelectItem>
                                  <SelectItem value="sales">{t("contact.form.departments.sales")}</SelectItem>
                                  <SelectItem value="billing">{t("contact.form.departments.billing")}</SelectItem>
                                  <SelectItem value="technical">{t("contact.form.departments.technical")}</SelectItem>
                                  <SelectItem value="partnership">{t("contact.form.departments.partnership")}</SelectItem>
                                  <SelectItem value="other">{t("contact.form.departments.other")}</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contact.form.message")}</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t("contact.form.messagePlaceholder")}
                                rows={6}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={contactMutation.isPending}
                      >
                        {contactMutation.isPending ? t("contact.form.sending") : t("contact.form.submit")}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">{t("contact.contactInfo.title")}</h2>
                  <p className="text-muted-foreground mb-6">{t("contact.contactInfo.subtitle")}</p>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <Mail className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-medium">{t("contact.contactInfo.email")}</h3>
                        <p className="text-muted-foreground">support@media-intelligence.gov.ae</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Phone className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-medium">{t("contact.contactInfo.phone")}</h3>
                        <p className="text-muted-foreground">+971 2 123 4567</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <MapPin className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-medium">{t("contact.contactInfo.address")}</h3>
                        <p className="text-muted-foreground">
                          {t("contact.contactInfo.addressLine1")}<br />
                          {t("contact.contactInfo.addressLine2")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Clock className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-medium">{t("contact.contactInfo.hours")}</h3>
                        <p className="text-muted-foreground">
                          {t("contact.contactInfo.workdays")}: 8:00 AM - 5:00 PM<br />
                          {t("contact.contactInfo.weekend")}: {t("contact.contactInfo.closed")}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="mb-6 bg-primary/10 rounded-full p-3">
              <Check className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{t("contact.thankYou")}</h1>
            <p className="text-xl font-medium mb-2">{t("contact.successTitle")}</p>
            <p className="text-muted-foreground mb-8 max-w-md">
              {t("contact.successMessage")}<br />
              {t("contact.responseTime")}
            </p>
            <Button onClick={() => setIsSubmitted(false)}>
              {t("contact.sendAnother")}
            </Button>
            <Link href="/support" className="mt-4 text-primary hover:underline">
              {t("contact.backToHome")}
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}