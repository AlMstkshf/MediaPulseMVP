import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileQuestion, BookOpen, MessageSquare, Info, HelpCircle, FileText, Mail } from "lucide-react";

export default function SupportCenter() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('supportCenter.title')}</h1>
            <p className="text-muted-foreground">{t('supportCenter.subtitle')}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">{t('supportCenter.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="resources">{t('supportCenter.tabs.resources')}</TabsTrigger>
            <TabsTrigger value="help">{t('supportCenter.tabs.help')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <FileQuestion className="h-5 w-5 text-primary" />
                    {t('supportCenter.faq.title')}
                  </CardTitle>
                  <CardDescription>{t('supportCenter.faq.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{t('supportCenter.faq.content')}</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/support/faq">{t('supportCenter.faq.browseButton')}</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    {t('supportCenter.knowledgeBase.title')}
                  </CardTitle>
                  <CardDescription>{t('supportCenter.knowledgeBase.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{t('supportCenter.knowledgeBase.content')}</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/support/knowledge-base">{t('supportCenter.knowledgeBase.browseButton')}</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    {t('supportCenter.supportTickets.title')}
                  </CardTitle>
                  <CardDescription>{t('supportCenter.supportTickets.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{t('supportCenter.supportTickets.content')}</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/support/tickets">{t('supportCenter.supportTickets.browseButton')}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('supportCenter.getHelp.title')}</CardTitle>
                <CardDescription>{t('supportCenter.getHelp.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button asChild variant="default" className="w-full">
                    <Link href="/support/tickets/new">{t('supportCenter.getHelp.createTicketButton')}</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/tutorials">{t('supportCenter.getHelp.tutorialsButton')}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('supportCenter.resources.title')}</CardTitle>
                <CardDescription>{t('supportCenter.resources.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary" />
                      {t('supportCenter.resources.documentation')}
                    </h3>
                    <p className="text-sm text-muted-foreground">{t('supportCenter.resources.documentationDescription')}</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/support/knowledge-base?category=documentation">{t('supportCenter.resources.documentationButton')}</Link>
                    </Button>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Info className="h-5 w-5 mr-2 text-primary" />
                      {t('supportCenter.resources.guides')}
                    </h3>
                    <p className="text-sm text-muted-foreground">{t('supportCenter.resources.guidesDescription')}</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/support/knowledge-base?category=guides">{t('supportCenter.resources.guidesButton')}</Link>
                    </Button>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                      {t('supportCenter.resources.tutorials')}
                    </h3>
                    <p className="text-sm text-muted-foreground">{t('supportCenter.resources.tutorialsDescription')}</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/tutorials">{t('supportCenter.resources.tutorialsButton')}</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="help" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('supportCenter.help.title')}</CardTitle>
                <CardDescription>{t('supportCenter.help.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>{t('supportCenter.help.content')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button asChild variant="default">
                      <Link href="/support/tickets/new">{t('supportCenter.help.createTicketButton')}</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/support/faq">{t('supportCenter.help.faqButton')}</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  {t('supportCenter.contactUs.title')}
                </CardTitle>
                <CardDescription>{t('supportCenter.contactUs.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{t('supportCenter.contactUs.content')}</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/support/contact">{t('supportCenter.contactUs.button')}</Link>
                </Button>
              </CardContent>
            </Card>
            
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('supportCenter.yourTickets.title')}</CardTitle>
                  <CardDescription>{t('supportCenter.yourTickets.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/support/tickets">{t('supportCenter.yourTickets.viewButton')}</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}