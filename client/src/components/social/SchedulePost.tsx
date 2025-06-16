import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Image, Loader2, Send, PlusCircle, Save, AlertTriangle, X, Hash, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import AiContentGenerator from "./AiContentGenerator";
import SmartHashtagRecommendations from "./SmartHashtagRecommendations";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface SchedulePostProps {
  onClose?: () => void;
}

export default function SchedulePost({ onClose }: SchedulePostProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showAiGenerator, setShowAiGenerator] = useState(false);
  const [showSmartHashtags, setShowSmartHashtags] = useState(false);
  
  // Form state
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("twitter");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("12:00");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  
  // Best posting time
  const bestPostingTimesQuery = useQuery({
    queryKey: ["/api/social/best-posting-times"],
    queryFn: async () => {
      const res = await fetch("/api/social/best-posting-times");
      if (!res.ok) throw new Error("Failed to fetch best posting times");
      return res.json();
    },
    retry: 1,
  });
  
  // Mutations
  const schedulePostMutation = useMutation({
    mutationFn: async () => {
      if (!date) {
        throw new Error("Date is required");
      }
      
      // Combine date and time
      const scheduledTime = new Date(date);
      const [hours, minutes] = time.split(":").map(Number);
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      const res = await apiRequest("POST", "/api/social/schedule-post", {
        content,
        platform,
        scheduledTime: scheduledTime.toISOString(),
        hashtags,
        mediaUrls,
        aiGenerated,
        metadata
      });
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/scheduled-posts"] });
      toast({
        title: t("Post Scheduled"),
        description: t("Your post has been scheduled successfully"),
      });
      if (onClose) onClose();
    },
    onError: (error) => {
      console.error("Error scheduling post:", error);
      toast({
        title: t("Scheduling Failed"),
        description: t("Failed to schedule post. Please try again."),
        variant: "destructive"
      });
    }
  });
  
  const publishNowMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/social/publish-now", {
        content,
        platform,
        hashtags,
        mediaUrls
      });
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-posts"] });
      toast({
        title: t("Post Published"),
        description: t("Your post has been published successfully"),
      });
      if (onClose) onClose();
    },
    onError: (error) => {
      console.error("Error publishing post:", error);
      toast({
        title: t("Publishing Failed"),
        description: t("Failed to publish post. Please try again."),
        variant: "destructive"
      });
    }
  });
  
  // Handle hashtag input
  const addHashtag = () => {
    if (hashtagInput && !hashtags.includes(hashtagInput)) {
      setHashtags([...hashtags, hashtagInput]);
      setHashtagInput("");
    }
  };
  
  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };
  
  // Handle generated content from AI
  const handleGeneratedContent = (generatedData: {
    content: string;
    hashtags: string[];
    bestTimeToPost: string;
    estimatedEngagement: {
      likes: number;
      comments: number;
      shares: number;
    };
  }) => {
    setContent(generatedData.content);
    setHashtags(generatedData.hashtags);
    setAiGenerated(true);
    setMetadata({
      sentimentPrediction: 75, // Default positive sentiment since we don't have the exact value
      estimatedEngagement: generatedData.estimatedEngagement,
      bestTimeToPost: generatedData.bestTimeToPost
    });
    
    // If best time to post is provided, try to parse it
    if (generatedData.bestTimeToPost) {
      try {
        // Format like "Monday at 9:00 AM"
        const timeParts = generatedData.bestTimeToPost.split(' at ');
        if (timeParts.length === 2) {
          setTime(convertTo24HourFormat(timeParts[1]));
        }
      } catch (e) {
        console.error("Could not parse best time to post", e);
      }
    }
    
    setShowAiGenerator(false);
  };
  
  // Helper to convert from 12-hour to 24-hour format
  const convertTo24HourFormat = (time12h: string) => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM') {
      hours = String(parseInt(hours, 10) + 12);
    }
    
    return `${hours.padStart(2, '0')}:${minutes}`;
  };
  
  // Check if form is valid
  const isFormValid = () => {
    return content.trim().length > 0 && platform && date;
  };
  
  return (
    <div className="space-y-6">
      <Dialog open={showAiGenerator} onOpenChange={setShowAiGenerator}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <AiContentGenerator onGeneratedContent={handleGeneratedContent} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={showSmartHashtags} onOpenChange={setShowSmartHashtags}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <SmartHashtagRecommendations 
            initialContent={content}
            platform={platform}
            onHashtagsSelected={(selectedHashtags) => {
              setHashtags(selectedHashtags);
              setShowSmartHashtags(false);
              toast({
                title: t("Hashtags Applied"),
                description: t("Smart hashtags have been applied to your post"),
              });
            }} 
          />
        </DialogContent>
      </Dialog>
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("Schedule Social Media Post")}</h2>
          <p className="text-muted-foreground">
            {t("Create and schedule posts for your social media platforms")}
          </p>
        </div>
        <DialogTrigger asChild>
          <Button onClick={() => setShowAiGenerator(true)} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            {t("Use AI Generator")}
          </Button>
        </DialogTrigger>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("Post Content")}</CardTitle>
              <CardDescription>
                {t("Write the content you want to post on social media")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform">{t("Platform")}</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger id="platform">
                    <SelectValue placeholder={t("Select platform")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twitter">{t("Twitter")}</SelectItem>
                    <SelectItem value="facebook">{t("Facebook")}</SelectItem>
                    <SelectItem value="instagram">{t("Instagram")}</SelectItem>
                    <SelectItem value="linkedin">{t("LinkedIn")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">{t("Post Content")}</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t("Write your post content here...")}
                  className="min-h-[200px]"
                />
                {platform === "twitter" && content.length > 280 && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    {t("Content exceeds Twitter's 280 character limit")}
                  </div>
                )}
                <div className="text-right text-sm text-muted-foreground">
                  {content.length} {t("characters")}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hashtags">{t("Hashtags")}</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      id="hashtags"
                      value={hashtagInput}
                      onChange={(e) => setHashtagInput(e.target.value.replace(/\s+/g, ''))}
                      placeholder={t("Enter hashtag without # and press Add")}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addHashtag();
                        }
                      }}
                    />
                    <Button type="button" onClick={addHashtag} variant="outline">
                      {t("Add")}
                    </Button>
                  </div>
                  <Button 
                    type="button" 
                    onClick={() => setShowSmartHashtags(true)} 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Hash className="h-4 w-4" />
                    <Sparkles className="h-3 w-3" />
                    {t("Use Smart Hashtags")}
                  </Button>
                </div>
                
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {hashtags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary"
                        className="cursor-pointer flex items-center gap-1"
                        onClick={() => removeHashtag(tag)}
                      >
                        #{tag}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>{t("Media")}</Label>
                <div className="border rounded-md p-4 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t("Drag and drop or click to upload images")}
                    </p>
                    <Button variant="outline" className="mt-4" disabled>
                      {t("Upload Images")}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("Media upload feature coming soon. Support for images and videos will be available.")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("Schedule")}</CardTitle>
              <CardDescription>
                {t("Choose when to publish your post")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("Publication Date")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal flex gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      {date ? format(date, "PPP") : <span>{t("Pick a date")}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>{t("Publication Time")}</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal flex gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        {time}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <div className="p-4">
                        <div className="space-y-2">
                          <Label>{t("Select Time")}</Label>
                          <Select value={time} onValueChange={setTime}>
                            <SelectTrigger>
                              <SelectValue placeholder={t("Select time")} />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }).map((_, hour) => (
                                <>
                                  <SelectItem key={`${hour}:00`} value={`${hour.toString().padStart(2, '0')}:00`}>
                                    {`${hour.toString().padStart(2, '0')}:00`}
                                  </SelectItem>
                                  <SelectItem key={`${hour}:30`} value={`${hour.toString().padStart(2, '0')}:30`}>
                                    {`${hour.toString().padStart(2, '0')}:30`}
                                  </SelectItem>
                                </>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {bestPostingTimesQuery.isSuccess && (
                <div className="space-y-2 rounded-md border p-4">
                  <Label>{t("Recommended Times")}</Label>
                  {platform && bestPostingTimesQuery.data[platform.toLowerCase()] && (
                    <ScrollArea className="h-[150px] pr-4">
                      <RadioGroup value={time} onValueChange={setTime}>
                        {bestPostingTimesQuery.data[platform.toLowerCase()].map((dayData: any) => (
                          <div key={dayData.day} className="mb-3">
                            <h4 className="text-sm font-medium mb-1">{dayData.day}</h4>
                            <div className="space-y-1 ml-3">
                              {dayData.times.map((timeStr: string) => {
                                const converted = convertTo24HourFormat(timeStr);
                                return (
                                  <div key={`${dayData.day}-${timeStr}`} className="flex items-center space-x-2">
                                    <RadioGroupItem value={converted} id={`${dayData.day}-${timeStr}`} />
                                    <Label htmlFor={`${dayData.day}-${timeStr}`} className="cursor-pointer">
                                      {timeStr}
                                    </Label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </ScrollArea>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={onClose}
              >
                {t("Cancel")}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => publishNowMutation.mutate()}
                  disabled={!isFormValid() || publishNowMutation.isPending}
                >
                  {publishNowMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("Publishing...")}
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {t("Publish Now")}
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => schedulePostMutation.mutate()}
                  disabled={!isFormValid() || schedulePostMutation.isPending}
                >
                  {schedulePostMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("Scheduling...")}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t("Schedule Post")}
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          {aiGenerated && metadata.estimatedEngagement && (
            <Card>
              <CardHeader>
                <CardTitle>{t("AI Insights")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t("Estimated Engagement")}</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="rounded-md border p-2 text-center">
                      <div className="text-lg font-semibold">{metadata.estimatedEngagement.likes || 0}</div>
                      <div className="text-xs text-muted-foreground">{t("Likes")}</div>
                    </div>
                    <div className="rounded-md border p-2 text-center">
                      <div className="text-lg font-semibold">{metadata.estimatedEngagement.comments || 0}</div>
                      <div className="text-xs text-muted-foreground">{t("Comments")}</div>
                    </div>
                    <div className="rounded-md border p-2 text-center">
                      <div className="text-lg font-semibold">{metadata.estimatedEngagement.shares || 0}</div>
                      <div className="text-xs text-muted-foreground">{t("Shares")}</div>
                    </div>
                  </div>
                </div>
                {metadata.bestTimeToPost && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {t("Best time to post")}: <span className="font-medium">{metadata.bestTimeToPost}</span>
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}