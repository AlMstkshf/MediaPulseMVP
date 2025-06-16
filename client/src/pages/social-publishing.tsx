import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Calendar, Sparkles, Clock, Hash, TrendingUp } from "lucide-react";
import AiContentGenerator from "@/components/social/AiContentGenerator";
import SchedulePost from "@/components/social/SchedulePost";
import ScheduledPostsList from "@/components/social/ScheduledPostsList";
import SmartHashtagRecommendations from "@/components/social/SmartHashtagRecommendations";

export default function SocialPublishingPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("scheduled");
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  
  return (
    <div className="container py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Social Media Publishing")}</h1>
          <p className="text-muted-foreground">
            {t("Manage your social media presence with AI-powered content creation and scheduling")}
          </p>
        </div>
        
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              {t("Schedule New Post")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <SchedulePost onClose={() => setShowScheduleDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("Publishing Tools")}</CardTitle>
              <CardDescription>
                {t("Create and manage your social media content")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue={activeTab}
                value={activeTab}
                onValueChange={setActiveTab}
                orientation="vertical"
                className="space-y-4"
              >
                <TabsList className="grid grid-cols-1 h-auto gap-2">
                  <TabsTrigger value="scheduled" className="justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    {t("Scheduled Posts")}
                  </TabsTrigger>
                  <TabsTrigger value="ai-generator" className="justify-start">
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t("AI Content Generator")}
                  </TabsTrigger>
                  <TabsTrigger value="smart-hashtags" className="justify-start">
                    <Hash className="h-4 w-4 mr-2" />
                    {t("Smart Hashtags")}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t("Posting Tips")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">{t("Best Times to Post")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("Engagement is highest for UAE government accounts during these times:")}
                </p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>{t("Twitter: 8-9 AM, 12-1 PM, 7-8 PM")}</li>
                  <li>{t("Facebook: 12-1 PM, 3-4 PM, 8-9 PM")}</li>
                  <li>{t("Instagram: 12-1 PM, 7-9 PM")}</li>
                  <li>{t("LinkedIn: 8-10 AM, 2-4 PM")}</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">{t("Content Best Practices")}</h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>{t("Use images and videos to increase engagement")}</li>
                  <li>{t("Keep hashtags relevant and limited (3-5 per post)")}</li>
                  <li>{t("Ask questions to encourage interaction")}</li>
                  <li>{t("Post in both English and Arabic when possible")}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <TabsContent value="scheduled" className="mt-0">
            <ScheduledPostsList />
          </TabsContent>
          
          <TabsContent value="ai-generator" className="mt-0">
            <Card>
              <CardContent className="pt-6">
                <AiContentGenerator />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="smart-hashtags" className="mt-0">
            <Card>
              <CardContent className="pt-6">
                <SmartHashtagRecommendations />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </div>
    </div>
  );
}