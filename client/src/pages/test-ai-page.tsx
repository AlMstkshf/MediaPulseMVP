import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/layouts/dashboard-layout';

/**
 * Test page for AI features demonstration
 * This is a simple UI to test various AI capabilities of the platform
 */
const TestAIPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRTL = i18n.language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      // Make API call to test AI endpoint
      const response = await fetch('/api/ai/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      setResult(data.result || JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('AI Test error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResult('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <h1 className="text-3xl font-bold mb-6">{t('aiTest.title', 'AI Test Page')}</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('aiTest.testConsole', 'AI Test Console')}</CardTitle>
            <CardDescription>
              {t('aiTest.description', 'Use this page to test AI features integrated with Media Pulse')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium mb-1">
                  {t('aiTest.promptLabel', 'Enter your prompt')}
                </label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t('aiTest.promptPlaceholder', 'Type your AI query here...')}
                  className="w-full"
                  rows={3}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={loading || !prompt.trim()}
                className="w-full md:w-auto"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('aiTest.submitButton', 'Test AI')}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md w-full">
                {error}
              </div>
            )}
          </CardFooter>
        </Card>
        
        {(result || loading) && (
          <Card>
            <CardHeader>
              <CardTitle>{t('aiTest.resultsTitle', 'AI Response')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div 
                  className="p-4 bg-gray-50 rounded min-h-[100px] whitespace-pre-wrap"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  {result}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TestAIPage;