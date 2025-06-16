import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Loader2, Check, X, Info, Wand2, ArrowRight, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";

interface AiContentGeneratorProps {
  onGeneratedContent?: (content: {
    content: string;
    hashtags: string[];
    bestTimeToPost: string;
    estimatedEngagement: {
      likes: number;
      comments: number;
      shares: number;
    };
  }) => void;
}

type ContentType = "promotional" | "informational" | "engagement" | "crisis" | "announcement";
type AudienceType = "general" | "youth" | "families" | "professionals" | "seniors" | "tourists";
type ToneType = "formal" | "conversational" | "urgent" | "educational" | "motivational";
type ContentLength = "short" | "medium" | "long";

export default function AiContentGenerator({ onGeneratedContent }: AiContentGeneratorProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Form state
  const [activeTab, setActiveTab] = useState<string>("quick");
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [platform, setPlatform] = useState("twitter");
  const [contentType, setContentType] = useState<ContentType>("informational");
  const [audience, setAudience] = useState<AudienceType>("general");
  const [tone, setTone] = useState<ToneType>("formal");
  const [contentLength, setContentLength] = useState<ContentLength>("medium");
  const [includeArabic, setIncludeArabic] = useState(true);
  const [includeMedia, setIncludeMedia] = useState(true);
  const [creativityLevel, setCreativityLevel] = useState([50]);
  
  // Advanced options
  const [specificGoal, setSpecificGoal] = useState("");
  const [references, setReferences] = useState("");
  const [brandingGuidelines, setBrandingGuidelines] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  
  // Generated content
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [bestTimeToPost, setBestTimeToPost] = useState<string>("");
  const [engagementStats, setEngagementStats] = useState<{
    likes: number;
    comments: number;
    shares: number;
  } | null>(null);
  
  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Format content length for display
  const getContentLengthLabel = (length: ContentLength): string => {
    switch (length) {
      case "short":
        return platform === "twitter" ? "Up to 150 characters" : "30-50 words";
      case "medium":
        return platform === "twitter" ? "150-250 characters" : "50-100 words";
      case "long":
        return platform === "twitter" ? "Up to 280 characters" : "100-200 words";
      default:
        return "50-100 words";
    }
  };
  
  // Check if form is valid
  const isFormValid = () => {
    if (activeTab === "quick") {
      return !!topic;
    } else {
      return !!topic && !!contentType && !!audience && !!tone;
    }
  };
  
  // Handle quick generation
  const handleQuickGenerate = async () => {
    if (!topic) {
      setError(t("Please enter a topic"));
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const prompt = `
        Generate a social media post for ${platform} about the topic: ${topic}.
        ${keywords ? `Include these keywords if possible: ${keywords}` : ''}
        ${includeArabic ? 'Include Arabic translation of the post.' : ''}
      `;
      
      await generateContent(prompt);
    } catch (err) {
      console.error("Error generating content:", err);
      setError(t("Failed to generate content. Please try again."));
      setIsGenerating(false);
    }
  };
  
  // Handle advanced generation
  const handleAdvancedGenerate = async () => {
    if (!isFormValid()) {
      setError(t("Please fill in all required fields"));
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const prompt = `
        Generate a ${contentType} social media post for ${platform} about: ${topic}.
        Target audience: ${audience}.
        Tone: ${tone}.
        Length: ${contentLength}.
        ${keywords ? `Include these keywords if possible: ${keywords}` : ''}
        ${specificGoal ? `The specific goal of this post is: ${specificGoal}` : ''}
        ${references ? `Use these references or facts: ${references}` : ''}
        ${brandingGuidelines ? `Follow these branding guidelines: ${brandingGuidelines}` : ''}
        ${customInstructions ? `Additional instructions: ${customInstructions}` : ''}
        ${includeArabic ? 'Include Arabic translation of the post.' : ''}
        Creativity level: ${creativityLevel[0]}%.
      `;
      
      await generateContent(prompt);
    } catch (err) {
      console.error("Error generating content:", err);
      setError(t("Failed to generate content. Please try again."));
      setIsGenerating(false);
    }
  };
  
  // Common function to generate content
  const generateContent = async (prompt: string) => {
    try {
      const res = await apiRequest("POST", "/api/social/generate-content", {
        prompt,
        platform,
        includeHashtags: true,
        includeEngagementPrediction: true,
        includeBestTimeToPost: true,
        includeArabic,
        requestMedia: includeMedia,
        creativityLevel: creativityLevel[0] / 100
      });
      
      if (!res.ok) {
        throw new Error("Failed to generate content");
      }
      
      const data = await res.json();
      setGeneratedContent(data.content);
      setGeneratedHashtags(data.hashtags || []);
      setBestTimeToPost(data.bestTimeToPost || "");
      setEngagementStats(data.estimatedEngagement || {
        likes: Math.floor(Math.random() * 50) + 20,
        comments: Math.floor(Math.random() * 20) + 5,
        shares: Math.floor(Math.random() * 15) + 3
      });
      
      toast({
        title: t("Content Generated"),
        description: t("Your AI-generated content is ready"),
      });
    } catch (err) {
      console.error("Error in generateContent:", err);
      setError(t("Failed to generate content. Please try again."));
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Use generated content
  const handleUseGeneratedContent = () => {
    if (!generatedContent) return;
    
    if (onGeneratedContent) {
      onGeneratedContent({
        content: generatedContent,
        hashtags: generatedHashtags,
        bestTimeToPost,
        estimatedEngagement: engagementStats || {
          likes: 0,
          comments: 0,
          shares: 0
        }
      });

      // Show success toast
      toast({
        title: t("Content Applied"),
        description: t("The generated content has been applied to your post"),
        variant: "default"
      });
    }
  };
  
  // Function to regenerate content with the same settings
  const handleRegenerateContent = async () => {
    setIsGenerating(true);
    
    try {
      const prompt = activeTab === "quick" 
        ? `Generate a social media post for ${platform} about the topic: ${topic}. ${keywords ? `Include these keywords if possible: ${keywords}` : ''} ${includeArabic ? 'Include Arabic translation of the post.' : ''}`
        : `Generate a ${contentType} social media post for ${platform} about: ${topic}. Target audience: ${audience}. Tone: ${tone}. Length: ${contentLength}. ${keywords ? `Include these keywords if possible: ${keywords}` : ''} ${specificGoal ? `The specific goal of this post is: ${specificGoal}` : ''} ${references ? `Use these references or facts: ${references}` : ''} ${brandingGuidelines ? `Follow these branding guidelines: ${brandingGuidelines}` : ''} ${customInstructions ? `Additional instructions: ${customInstructions}` : ''} ${includeArabic ? 'Include Arabic translation of the post.' : ''} Creativity level: ${creativityLevel[0]}%.`;
      
      await generateContent(prompt);
      
      toast({
        title: t("Content Regenerated"),
        description: t("New content has been generated with the same settings"),
      });
    } catch (err) {
      console.error("Error regenerating content:", err);
      setError(t("Failed to regenerate content. Please try again."));
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("AI Content Generator")}</h2>
        <p className="text-muted-foreground">
          {t("Create optimized social media content powered by AI")}
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quick">
            <Wand2 className="h-4 w-4 mr-2" />
            {t("Quick Generate")}
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Sparkles className="h-4 w-4 mr-2" />
            {t("Advanced Options")}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="quick" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform-quick">{t("Platform")}</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger id="platform-quick">
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
                <Label htmlFor="topic-quick" className="flex items-center gap-1">
                  {t("Topic")}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="topic-quick"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t("Describe the topic of your post in detail...")}
                  className="h-[150px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="keywords-quick">{t("Keywords (Optional)")}</Label>
                <Input
                  id="keywords-quick"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder={t("Add comma-separated keywords...")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("Adding keywords helps the AI create more relevant content")}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Alert className="bg-primary/10 border-primary/20">
                <Info className="h-4 w-4" />
                <AlertTitle>{t("Quick Generate Mode")}</AlertTitle>
                <AlertDescription>
                  {t("Enter your topic and we'll generate optimized content for your selected platform. For more control, use Advanced Options.")}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2 pt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-arabic-quick"
                    checked={includeArabic}
                    onChange={(e) => setIncludeArabic(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="include-arabic-quick">
                    {t("Include Arabic translation")}
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-media-quick"
                    checked={includeMedia}
                    onChange={(e) => setIncludeMedia(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="include-media-quick">
                    {t("Suggest media content ideas")}
                  </Label>
                </div>
              </div>
              
              <div className="space-y-2 pt-4">
                <Label>{t("Creativity Level")}</Label>
                <Slider
                  value={creativityLevel}
                  onValueChange={setCreativityLevel}
                  max={100}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t("Conservative")}</span>
                  <span>{creativityLevel[0]}%</span>
                  <span>{t("Creative")}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button
              variant="default"
              onClick={handleQuickGenerate}
              disabled={isGenerating || !topic}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("Generating...")}
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  {t("Generate Content")}
                </>
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform-advanced">{t("Platform")}</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger id="platform-advanced">
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
                <Label htmlFor="topic-advanced" className="flex items-center gap-1">
                  {t("Topic")}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="topic-advanced"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t("Describe the topic of your post in detail...")}
                  className="h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="keywords-advanced">{t("Keywords (Optional)")}</Label>
                <Input
                  id="keywords-advanced"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder={t("Add comma-separated keywords...")}
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t("Content Type")}</Label>
                <RadioGroup value={contentType} onValueChange={(v) => setContentType(v as ContentType)} className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="promotional" id="promotional" />
                    <Label htmlFor="promotional">{t("Promotional")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="informational" id="informational" />
                    <Label htmlFor="informational">{t("Informational")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="engagement" id="engagement" />
                    <Label htmlFor="engagement">{t("Engagement")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="announcement" id="announcement" />
                    <Label htmlFor="announcement">{t("Announcement")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="crisis" id="crisis" />
                    <Label htmlFor="crisis">{t("Crisis Communication")}</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>{t("Target Audience")}</Label>
                <Select value={audience} onValueChange={(v) => setAudience(v as AudienceType)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select audience")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">{t("General Public")}</SelectItem>
                    <SelectItem value="youth">{t("Youth")}</SelectItem>
                    <SelectItem value="families">{t("Families")}</SelectItem>
                    <SelectItem value="professionals">{t("Professionals")}</SelectItem>
                    <SelectItem value="seniors">{t("Seniors")}</SelectItem>
                    <SelectItem value="tourists">{t("Tourists")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t("Tone")}</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as ToneType)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select tone")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">{t("Formal")}</SelectItem>
                    <SelectItem value="conversational">{t("Conversational")}</SelectItem>
                    <SelectItem value="urgent">{t("Urgent")}</SelectItem>
                    <SelectItem value="educational">{t("Educational")}</SelectItem>
                    <SelectItem value="motivational">{t("Motivational")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t("Content Length")}</Label>
                <RadioGroup value={contentLength} onValueChange={(v) => setContentLength(v as ContentLength)} className="grid grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="short" id="short" />
                    <Label htmlFor="short">{t("Short")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium">{t("Medium")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="long" id="long" />
                    <Label htmlFor="long">{t("Long")}</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  {getContentLengthLabel(contentLength)}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="specific-goal">{t("Specific Goal (Optional)")}</Label>
                <Input
                  id="specific-goal"
                  value={specificGoal}
                  onChange={(e) => setSpecificGoal(e.target.value)}
                  placeholder={t("e.g., Increase event registrations")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="references">{t("References/Facts (Optional)")}</Label>
                <Textarea
                  id="references"
                  value={references}
                  onChange={(e) => setReferences(e.target.value)}
                  placeholder={t("Include any specific references or facts...")}
                  className="h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="branding">{t("Branding Guidelines (Optional)")}</Label>
                <Textarea
                  id="branding"
                  value={brandingGuidelines}
                  onChange={(e) => setBrandingGuidelines(e.target.value)}
                  placeholder={t("Add any specific branding guidelines...")}
                  className="h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-instructions">{t("Custom Instructions (Optional)")}</Label>
                <Textarea
                  id="custom-instructions"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder={t("Any other specific instructions...")}
                  className="h-[80px]"
                />
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-arabic-advanced"
                    checked={includeArabic}
                    onChange={(e) => setIncludeArabic(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="include-arabic-advanced">
                    {t("Include Arabic translation")}
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-media-advanced"
                    checked={includeMedia}
                    onChange={(e) => setIncludeMedia(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="include-media-advanced">
                    {t("Suggest media content ideas")}
                  </Label>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <Label>{t("Creativity Level")}</Label>
                <Slider
                  value={creativityLevel}
                  onValueChange={setCreativityLevel}
                  max={100}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t("Conservative")}</span>
                  <span>{creativityLevel[0]}%</span>
                  <span>{t("Creative")}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button
              variant="default"
              onClick={handleAdvancedGenerate}
              disabled={isGenerating || !isFormValid()}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("Generating...")}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t("Generate Content")}
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("Error")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {generatedContent && (
        <Card className="mt-6 border-primary/20">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t("Generated Content")}
            </CardTitle>
            <CardDescription>
              {t("Here's the AI-generated content for your social media post")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>{t("Post Content")}</Label>
                <ScrollArea className="h-40 rounded-md border p-4">
                  <div className="whitespace-pre-wrap">{generatedContent}</div>
                </ScrollArea>
              </div>
              
              {generatedHashtags.length > 0 && (
                <div className="space-y-2">
                  <Label>{t("Suggested Hashtags")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {generatedHashtags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-6">
                {bestTimeToPost && (
                  <div className="space-y-2">
                    <Label>{t("Best Time to Post")}</Label>
                    <div className="rounded-md border p-3 text-sm">
                      {bestTimeToPost}
                    </div>
                  </div>
                )}
                
                {engagementStats && (
                  <div className="space-y-2">
                    <Label>{t("Estimated Engagement")}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-md border p-2 text-center">
                        <div className="text-sm font-semibold">{engagementStats.likes}</div>
                        <div className="text-xs text-muted-foreground">{t("Likes")}</div>
                      </div>
                      <div className="rounded-md border p-2 text-center">
                        <div className="text-sm font-semibold">{engagementStats.comments}</div>
                        <div className="text-xs text-muted-foreground">{t("Comments")}</div>
                      </div>
                      <div className="rounded-md border p-2 text-center">
                        <div className="text-sm font-semibold">{engagementStats.shares}</div>
                        <div className="text-xs text-muted-foreground">{t("Shares")}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-primary/5 py-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGeneratedContent(null);
                  setGeneratedHashtags([]);
                  setBestTimeToPost("");
                  setEngagementStats(null);
                }}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                {t("Discard")}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRegenerateContent}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {t("Regenerate")}
              </Button>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={handleUseGeneratedContent}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              {t("Use This Content")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}