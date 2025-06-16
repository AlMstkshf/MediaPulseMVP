import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// A minimal test page to verify basic connectivity
export default function TestPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    console.log("Test page mounted");
    
    // Test basic fetch API
    const testApi = async () => {
      try {
        setLoading(true);
        console.log("Fetching API data...");
        const response = await fetch('/api/health');
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API response:", data);
        setApiData(data);
        setMessage(t('testPages.connectionTest.connectionSuccess'));
      } catch (err) {
        console.error("API fetch error:", err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setMessage('Failed to connect to API.');
      } finally {
        setLoading(false);
      }
    };
    
    testApi();
  }, []);

  return (
    <div className="p-8">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>{t('testPages.connectionTest.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>{t('testPages.connectionTest.description')}</p>
            
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>{t('testPages.connectionTest.testing')}</span>
              </div>
            ) : error ? (
              <div className="text-red-600 p-4 border border-red-200 rounded bg-red-50">
                <p className="font-semibold">{t('testPages.connectionTest.error')}</p>
                <p>{error}</p>
              </div>
            ) : (
              <div className="text-green-600 p-4 border border-green-200 rounded bg-green-50">
                <p>{message}</p>
                {apiData && (
                  <pre className="mt-2 text-xs overflow-auto p-2 bg-green-100 rounded">
                    {JSON.stringify(apiData, null, 2)}
                  </pre>
                )}
              </div>
            )}
            
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              {t('testPages.connectionTest.refreshTest')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}