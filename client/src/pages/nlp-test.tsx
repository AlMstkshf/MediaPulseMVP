import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Define types for API responses
interface SentimentResult {
  score: number;
  sentiment: string;
  confidence: number;
  source: string;
  language?: string;
  error?: string;
  serviceStatus?: 'available' | 'unavailable' | 'error';
}

interface EntityResult {
  entities: Array<{
    text: string;
    type: string;
    confidence: number;
  }>;
  keyPhrases: string[];
  source: string;
}

interface IntentResult {
  intent: string;
  confidence: number;
  source: string;
  error?: string;
  serviceStatus?: 'available' | 'unavailable' | 'error';
}

interface AnalysisResponse {
  text: string;
  results: {
    sentiment?: SentimentResult[];
    entities?: EntityResult[];
    intents?: IntentResult[];
  };
  serviceStatus?: {
    spaCy: boolean;
    rasa: boolean;
    openai: boolean;
  };
  timestamp: string;
}

export default function NlpTestPage() {
  const [text, setText] = useState('');
  const [tab, setTab] = useState('combined');
  const [language, setLanguage] = useState('en');

  // Mutation for different NLP analyses
  type NLPMutationResponse = {
    sentiment?: SentimentResult[];
    entities?: EntityResult[];
    intents?: IntentResult[];
    text: string;
    timestamp: string;
    serviceStatus?: {
      spaCy: boolean;
      rasa: boolean;
      openai: boolean;
    };
    results: {
      sentiment?: SentimentResult[];
      entities?: EntityResult[];
      intents?: IntentResult[];
    };
  };

  const analyzeMutation = useMutation<NLPMutationResponse>({
    mutationFn: async (): Promise<NLPMutationResponse> => {
      try {
        // Using fetch directly with proper content-type header
        const response = await fetch(`${window.location.origin}/api/nlp/${tab}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error during API request:', error);
        throw error;
      }
    }
  });

  const handleAnalyze = () => {
    if (!text.trim()) return;
    analyzeMutation.mutate();
  };

  const examples = {
    en: [
      "I'm absolutely thrilled with the new services offered by the government. The speed and efficiency is amazing!",
      "The education initiatives announced this year are a significant step forward for our community.",
      "I'm very disappointed with the recent changes to the transportation system. It's causing many problems."
    ],
    ar: [
      "أنا مسرور جدا بالخدمات الجديدة التي تقدمها الحكومة. السرعة والكفاءة رائعة!",
      "مبادرات التعليم المعلنة هذا العام هي خطوة كبيرة إلى الأمام لمجتمعنا.",
      "أنا مستاء جدا من التغييرات الأخيرة في نظام النقل. إنها تسبب العديد من المشاكل."
    ]
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">NLP Testing Interface</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test NLP Capabilities</CardTitle>
          <CardDescription>
            Enter text to analyze with our multi-provider NLP system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-36 mr-2">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex-grow">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="analyze">Combined</TabsTrigger>
                  <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                  <TabsTrigger value="entities">Entities</TabsTrigger>
                  <TabsTrigger value="intent">Intent</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to analyze..."
            className="min-h-[150px] mb-4"
          />
          
          <div className="flex flex-wrap gap-2 mb-4">
            {examples[language as 'en' | 'ar'].map((example, index) => (
              <Button 
                key={index} 
                variant="outline" 
                onClick={() => setText(example)}
                size="sm"
              >
                Example {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleAnalyze} 
            disabled={!text.trim() || analyzeMutation.isPending}
            className="w-full"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Text'
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Results Section */}
      {analyzeMutation.isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {analyzeMutation.error instanceof Error 
              ? analyzeMutation.error.message 
              : 'Failed to analyze text. Please try again.'}
          </AlertDescription>
        </Alert>
      )}
      
      {analyzeMutation.isSuccess && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Results from multiple NLP providers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {tab === 'analyze' && analyzeMutation.data.results.sentiment && (
                <AccordionItem value="sentiment">
                  <AccordionTrigger>Sentiment Analysis</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {analyzeMutation.data.results.sentiment?.map((result, index) => (
                        <Card key={index} className="p-4">
                          <div className="font-medium">Source: {result.source}</div>
                          <div>Score: {result.score}/5</div>
                          <div>Sentiment: {result.sentiment}</div>
                          <div>Confidence: {(result.confidence * 100).toFixed(2)}%</div>
                          {result.language && <div>Detected Language: {result.language}</div>}
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {(tab === 'analyze' || tab === 'entities') && analyzeMutation.data.results.entities && (
                <AccordionItem value="entities">
                  <AccordionTrigger>Entity Extraction</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {analyzeMutation.data.results.entities?.map((result, index) => (
                        <Card key={index} className="p-4">
                          <div className="font-medium">Source: {result.source}</div>
                          <div className="mt-2">
                            <div className="font-medium">Entities:</div>
                            <ul className="list-disc ml-6">
                              {result.entities.map((entity, eIdx) => (
                                <li key={eIdx}>
                                  <span className="font-medium">{entity.text}</span>
                                  {' '}
                                  <span className="text-sm text-muted-foreground">
                                    ({entity.type}, Confidence: {(entity.confidence * 100).toFixed(1)}%)
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {result.keyPhrases && result.keyPhrases.length > 0 && (
                            <div className="mt-2">
                              <div className="font-medium">Key Phrases:</div>
                              <ul className="list-disc ml-6">
                                {result.keyPhrases.map((phrase, pIdx) => (
                                  <li key={pIdx}>{phrase}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {(tab === 'analyze' || tab === 'intent') && analyzeMutation.data.results.intents && (
                <AccordionItem value="intents">
                  <AccordionTrigger>Intent Analysis</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {analyzeMutation.data.results.intents?.map((result, index) => (
                        <Card key={index} className="p-4">
                          <div className="font-medium">Source: {result.source}</div>
                          <div>Intent: {result.intent}</div>
                          <div>Confidence: {(result.confidence * 100).toFixed(2)}%</div>
                          {result.error && <div className="text-red-500">Error: {result.error}</div>}
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              
              {/* Display raw data for debugging */}
              <AccordionItem value="raw">
                <AccordionTrigger>Raw Response Data</AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto text-xs">
                    {JSON.stringify(analyzeMutation.data, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}