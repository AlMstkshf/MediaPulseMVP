import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

interface SentimentResult {
  score: number;
  confidence: number;
  themes: string[];
  entities: string[];
}

interface ApiStatus {
  operational: boolean;
  error: string | null;
}

export default function TestSentiment() {
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check API status
  const checkApiStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/status');
      if (!response.ok) {
        throw new Error('Failed to fetch API status');
      }
      const data = await response.json();
      setApiStatus(data);
    } catch (err) {
      setError('Error checking API status: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Analyze sentiment
  const analyzeSentiment = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/analyze/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to analyze sentiment');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Error analyzing sentiment: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate sentiment color based on score
  const getSentimentColor = (score: number) => {
    if (score >= 4) return 'text-green-500';
    if (score <= 2) return 'text-red-500';
    return 'text-amber-500';
  };

  // Get sentiment label
  const getSentimentLabel = (score: number) => {
    if (score >= 4) return 'Positive';
    if (score <= 2) return 'Negative';
    return 'Neutral';
  };

  return (
    <div className="container py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sentiment Analysis Test</CardTitle>
          <CardDescription>
            Test the OpenAI-powered sentiment analysis on social media content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">OpenAI API Status:</span>
            <div className="flex items-center">
              {apiStatus ? (
                <div className="flex items-center">
                  {apiStatus.operational ? (
                    <span className="flex items-center text-green-500">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Operational
                    </span>
                  ) : (
                    <span className="flex items-center text-red-500">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Not Operational: {apiStatus.error}
                    </span>
                  )}
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={checkApiStatus} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Check Status
                </Button>
              )}
            </div>
          </div>

          {/* Text Input */}
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Enter text to analyze
            </label>
            <Textarea
              id="content"
              placeholder="Enter social media post or any text to analyze sentiment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Sentiment Score:</span>
                    <div className={`text-2xl font-bold ${getSentimentColor(result.score)}`}>
                      {result.score}/5 - {getSentimentLabel(result.score)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Confidence:</span>
                    <div className="text-2xl font-bold">
                      {(result.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium">Detected Themes:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {result.themes && result.themes.length > 0 ? (
                      result.themes.map((theme, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs"
                        >
                          {theme}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No themes detected</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium">Detected Entities:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {result.entities && result.entities.length > 0 ? (
                      result.entities.map((entity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs"
                        >
                          {entity}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No entities detected</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={analyzeSentiment} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Analyze Sentiment
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}