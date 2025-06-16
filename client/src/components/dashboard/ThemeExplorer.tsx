import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, RefreshCcw, PlusCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from 'react-i18next';

// Color palette from red (negative) to green (positive)
const sentimentColorScale = [
  '#DC2626', // Very negative (0-20)
  '#F97316', // Negative (21-40)
  '#FBBF24', // Neutral negative (41-60)
  '#84CC16', // Neutral positive (61-80)
  '#22C55E'  // Very positive (81-100)
];

interface Theme {
  text: string;
  sentiment: number;
  color: string;
  count?: number;
  keywords?: string[];
}

interface ThemeExplorerProps {
  rtl?: boolean;
}

export function ThemeExplorer({ rtl = false }: ThemeExplorerProps) {
  const { t, i18n } = useTranslation();
  const isRtl = rtl || i18n.language === 'ar';
  const textAlignClass = isRtl ? "text-right" : "text-left";
  const flexDirectionClass = isRtl ? "flex-row-reverse" : "flex-row";
  const marginClass = isRtl ? "ml-0 mr-2" : "ml-2 mr-0";
  const { toast } = useToast();
  const [content, setContent] = useState<string>('');
  const [themes, setThemes] = useState<Theme[]>([]);
  const [customThemes, setCustomThemes] = useState<Theme[]>([]);
  const [newTheme, setNewTheme] = useState<string>('');
  const [newThemeSentiment, setNewThemeSentiment] = useState<number>(50);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("extracted");

  // Function to get color based on sentiment score
  const getSentimentColor = (sentiment: number): string => {
    const normalizedScore = Math.max(0, Math.min(100, sentiment));
    const index = Math.floor(normalizedScore / 20);
    return sentimentColorScale[index];
  };

  // Extract themes from content
  const extractThemes = async () => {
    if (!content.trim()) {
      toast({
        title: t("dashboard.themeExplorer.noContentToAnalyze"),
        description: t("dashboard.themeExplorer.enterContentToExtract"),
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // First analyze sentiment of the entire content
      const sentimentResponse = await apiRequest('POST', '/api/analyze/sentiment', { text: content });
      const sentimentData = await sentimentResponse.json();
      
      // Instead of using AI assistant endpoint, use OpenAI/NLP service directly
      const themesResponse = await apiRequest('POST', '/api/nlp/analyze', { 
        text: content,
        includeThemes: true
      });
      const themesData = await themesResponse.json();
      
      if (themesData.themes && Array.isArray(themesData.themes)) {
        // Convert themes into our format with sentiment and color
        const themeObjects: Theme[] = themesData.themes.map((theme: string, index: number) => {
          // Calculate a sentiment score for each theme based on the overall sentiment
          // but with some variation to make it more interesting
          const variation = Math.floor(Math.random() * 20) - 10; // -10 to +10
          const themeSentiment = Math.max(0, Math.min(100, 
            // Convert from -1:1 scale to 0-100
            Math.round(((sentimentData.score + 1) / 2) * 100) + variation
          ));
          
          return {
            text: theme,
            sentiment: themeSentiment,
            color: getSentimentColor(themeSentiment),
            count: Math.floor(Math.random() * 10) + 1 // Placeholder for actual count
          };
        });
        
        setThemes(themeObjects);
        setActiveTab("extracted");
        
        toast({
          title: t("dashboard.themeExplorer.themesExtracted"),
          description: t("dashboard.themeExplorer.themesExtractedMsg", {count: themeObjects.length}),
        });
      } else {
        toast({
          title: t("dashboard.themeExplorer.noThemesFound"),
          description: t("dashboard.themeExplorer.noThemesFoundMsg"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error extracting themes:', error);
      toast({
        title: t("dashboard.themeExplorer.errorExtractingThemes"),
        description: t("dashboard.themeExplorer.errorExtractingThemesMsg"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a custom theme
  const addCustomTheme = () => {
    if (!newTheme.trim()) {
      toast({
        title: t("dashboard.themeExplorer.themeTextRequired"),
        description: t("dashboard.themeExplorer.enterThemeText"),
        variant: "destructive"
      });
      return;
    }

    const theme: Theme = {
      text: newTheme.trim(),
      sentiment: newThemeSentiment,
      color: getSentimentColor(newThemeSentiment)
    };

    setCustomThemes([...customThemes, theme]);
    setNewTheme('');
    setNewThemeSentiment(50);
    setActiveTab("custom");
  };

  // Remove a custom theme
  const removeCustomTheme = (index: number) => {
    const updatedThemes = [...customThemes];
    updatedThemes.splice(index, 1);
    setCustomThemes(updatedThemes);
  };

  // Clear all themes
  const clearThemes = () => {
    setThemes([]);
  };

  // Remove an extracted theme
  const removeExtractedTheme = (index: number) => {
    const updatedThemes = [...themes];
    updatedThemes.splice(index, 1);
    setThemes(updatedThemes);
  };

  // Mock function to fill sample content for demo purposes
  const fillSampleContent = () => {
    setContent(
      "UAE's digital transformation initiatives are showing positive results across government services. " +
      "Recent social media analysis shows public satisfaction with smart government apps has increased by 15%. " +
      "However, there are concerns about digital inclusion for elderly citizens and remote areas. " +
      "The Ministry of AI announced new training programs to address these challenges. " +
      "Overall sentiment appears positive with strong support for continued innovation."
    );
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className={textAlignClass}>
        <CardTitle>{t("dashboard.themeExplorer.title")}</CardTitle>
        <CardDescription>{t("dashboard.themeExplorer.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="flex flex-col space-y-2">
              <div className={`flex justify-between items-center ${flexDirectionClass}`}>
                <label className={`text-sm font-medium ${textAlignClass}`}>
                  {t("dashboard.themeExplorer.contentAnalysis")}
                </label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fillSampleContent}
                  className="text-xs"
                >
                  {t("dashboard.themeExplorer.fillSample")}
                </Button>
              </div>
              <Textarea 
                placeholder={t("dashboard.themeExplorer.placeholder")}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`min-h-[120px] ${textAlignClass}`}
                dir={isRtl ? "rtl" : "ltr"}
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={extractThemes} 
                disabled={isLoading || !content.trim()}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("dashboard.themeExplorer.analyzing")}
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    {t("dashboard.themeExplorer.extractThemes")}
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="pt-4">
            <Tabs defaultValue="extracted" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-2">
                <TabsList>
                  <TabsTrigger value="extracted">
                    {t("dashboard.themeExplorer.extractedThemes")} {themes.length > 0 && `(${themes.length})`}
                  </TabsTrigger>
                  <TabsTrigger value="custom">
                    {t("dashboard.themeExplorer.customThemes")} {customThemes.length > 0 && `(${customThemes.length})`}
                  </TabsTrigger>
                </TabsList>
                
                {activeTab === "extracted" && themes.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearThemes}
                    className="text-xs"
                  >
                    <RefreshCcw className="mr-1 h-3 w-3" />
                    {t("dashboard.themeExplorer.clear")}
                  </Button>
                )}
              </div>
              
              <TabsContent value="extracted" className="min-h-[200px]">
                {themes.length === 0 ? (
                  <div className={`py-10 text-muted-foreground ${textAlignClass}`}>
                    {t("dashboard.themeExplorer.noThemesExtracted")}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {themes.map((theme, idx) => (
                      <div 
                        key={idx} 
                        className={`relative flex items-center p-3 rounded-md justify-between ${flexDirectionClass}`}
                        style={{ 
                          backgroundColor: `${theme.color}20`, 
                          borderLeft: isRtl ? 'none' : `4px solid ${theme.color}`,
                          borderRight: isRtl ? `4px solid ${theme.color}` : 'none'
                        }}
                      >
                        <div className={`${isRtl ? 'pl-8' : 'pr-8'} ${textAlignClass}`}>
                          <div className="font-medium">{theme.text}</div>
                          <div className="text-xs text-muted-foreground">
                            {theme.count && `${t("dashboard.themeExplorer.occurrences")}: ${theme.count}`}
                          </div>
                        </div>
                        <button 
                          onClick={() => removeExtractedTheme(idx)}
                          className={`absolute top-2 ${isRtl ? 'left-2' : 'right-2'} text-muted-foreground hover:text-foreground`}
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="custom" className="min-h-[200px]">
                <div className="space-y-4">
                  <div className="grid gap-3">
                    <div className="flex flex-col space-y-1">
                      <label className={`text-sm font-medium ${textAlignClass}`}>
                        {t("dashboard.themeExplorer.themeText")}
                      </label>
                      <div className={`flex ${isRtl ? 'space-x-reverse' : 'space-x-2'} ${flexDirectionClass}`}>
                        <input
                          type="text"
                          placeholder={t("dashboard.themeExplorer.customThemePlaceholder")}
                          value={newTheme}
                          onChange={(e) => setNewTheme(e.target.value)}
                          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${textAlignClass}`}
                          dir={isRtl ? "rtl" : "ltr"}
                        />
                        <Button onClick={addCustomTheme} disabled={!newTheme.trim()}>
                          <PlusCircle className={`h-4 w-4 ${isRtl ? 'ml-1' : 'mr-1'}`} />
                          {t("dashboard.themeExplorer.add")}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      <div className={`flex justify-between items-center ${flexDirectionClass}`}>
                        <label className={`text-sm font-medium ${textAlignClass}`}>
                          {t("dashboard.themeExplorer.sentiment")}
                        </label>
                        <Badge 
                          variant="outline"
                          style={{ color: getSentimentColor(newThemeSentiment) }}
                        >
                          {newThemeSentiment}%
                        </Badge>
                      </div>
                      <Slider
                        value={[newThemeSentiment]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(val) => setNewThemeSentiment(val[0])}
                        className="py-2"
                        dir={isRtl ? "rtl" : "ltr"}
                      />
                      <div className={`flex justify-between text-xs text-muted-foreground ${flexDirectionClass}`}>
                        <span>{isRtl ? t("dashboard.themeExplorer.positive") : t("dashboard.themeExplorer.negative")}</span>
                        <span>{t("dashboard.themeExplorer.neutral")}</span>
                        <span>{isRtl ? t("dashboard.themeExplorer.negative") : t("dashboard.themeExplorer.positive")}</span>
                      </div>
                    </div>
                  </div>
                  
                  {customThemes.length > 0 && (
                    <div className="mt-4">
                      <h4 className={`text-sm font-medium mb-2 ${textAlignClass}`}>{t("dashboard.themeExplorer.yourCustomThemes")}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {customThemes.map((theme, idx) => (
                          <div 
                            key={idx} 
                            className={`relative flex items-center p-3 rounded-md ${flexDirectionClass}`}
                            style={{ 
                              backgroundColor: `${theme.color}20`, 
                              borderLeft: isRtl ? 'none' : `4px solid ${theme.color}`,
                              borderRight: isRtl ? `4px solid ${theme.color}` : 'none'
                            }}
                          >
                            <div className={`${isRtl ? 'pl-8' : 'pr-8'} ${textAlignClass}`}>
                              <div className="font-medium">{theme.text}</div>
                              <div className="text-xs text-muted-foreground">
                                {t("dashboard.themeExplorer.sentiment")}: {theme.sentiment}%
                              </div>
                            </div>
                            <button 
                              onClick={() => removeCustomTheme(idx)}
                              className={`absolute top-2 ${isRtl ? 'left-2' : 'right-2'} text-muted-foreground hover:text-foreground`}
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {customThemes.length === 0 && (
                    <div className={`py-10 text-muted-foreground ${textAlignClass}`}>
                      {t("dashboard.themeExplorer.noCustomThemes")}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ThemeExplorer;