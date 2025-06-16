import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckIcon, XIcon, InfoIcon } from "lucide-react";

export default function CookieTest() {
  const { t } = useTranslation();
  const [cookieName, setCookieName] = useState('test-auth-cookie');
  const [cookieValue, setCookieValue] = useState('some-secure-value');
  const [cookies, setCookies] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{success: boolean; message: string} | null>(null);
  const [requestInfo, setRequestInfo] = useState<any>(null);

  useEffect(() => {
    // Load cookies on component mount
    fetchCookies();
  }, []);

  const fetchCookies = async () => {
    try {
      const response = await fetch('/api/auth/test-get-cookies', {
        credentials: 'include',
      });
      const data = await response.json();
      setCookies(data.cookies || {});
      setRequestInfo(data);
    } catch (error) {
      console.error('Error fetching cookies:', error);
      setStatus({
        success: false, 
        message: `Error fetching cookies: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };

  const setCookie = async () => {
    try {
      const response = await fetch('/api/auth/test-set-cookie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: cookieName, value: cookieValue }),
      });
      
      const data = await response.json();
      setStatus({
        success: data.success, 
        message: data.message
      });
      
      // Refresh cookies
      fetchCookies();
    } catch (error) {
      console.error('Error setting cookie:', error);
      setStatus({
        success: false, 
        message: `Error setting cookie: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };

  const clearCookie = async () => {
    try {
      const response = await fetch('/api/auth/test-clear-cookie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: cookieName }),
      });
      
      const data = await response.json();
      setStatus({
        success: data.success, 
        message: data.message
      });
      
      // Refresh cookies
      fetchCookies();
    } catch (error) {
      console.error('Error clearing cookie:', error);
      setStatus({
        success: false, 
        message: `Error clearing cookie: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };

  const performDebugRequest = async () => {
    try {
      const response = await fetch('/debug', {
        credentials: 'include',
      });
      const data = await response.json();
      setRequestInfo(data);
    } catch (error) {
      console.error('Error fetching debug info:', error);
      setStatus({
        success: false, 
        message: `Error fetching debug info: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">{t('cookieTest.title')}</h1>
      
      <Tabs defaultValue="cookies">
        <TabsList className="mb-6">
          <TabsTrigger value="cookies">{t('cookieTest.tabs.manageCookies')}</TabsTrigger>
          <TabsTrigger value="debug">{t('cookieTest.tabs.debugInfo')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cookies">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('cookieTest.setCookie.title')}</CardTitle>
                <CardDescription>{t('cookieTest.setCookie.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cookieName">{t('cookieTest.setCookie.cookieName')}</Label>
                    <Input
                      id="cookieName"
                      value={cookieName}
                      onChange={(e) => setCookieName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cookieValue">{t('cookieTest.setCookie.cookieValue')}</Label>
                    <Input
                      id="cookieValue"
                      value={cookieValue}
                      onChange={(e) => setCookieValue(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button onClick={setCookie}>{t('cookieTest.setCookie.setButton')}</Button>
                <Button onClick={clearCookie} variant="outline">{t('cookieTest.setCookie.clearButton')}</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('cookieTest.currentCookies.title')}</CardTitle>
                <CardDescription>{t('cookieTest.currentCookies.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(cookies).length > 0 ? (
                  <ul className="divide-y">
                    {Object.entries(cookies).map(([name, value]) => (
                      <li key={name} className="py-2">
                        <span className="font-medium">{name}:</span> {value}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">{t('cookieTest.currentCookies.noCookies')}</p>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={fetchCookies} variant="outline" className="w-full">
                  {t('cookieTest.currentCookies.refreshButton')}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="debug">
          <Card>
            <CardHeader>
              <CardTitle>{t('cookieTest.debug.title')}</CardTitle>
              <CardDescription>{t('cookieTest.debug.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button onClick={performDebugRequest} variant="outline">
                  {t('cookieTest.debug.loadButton')}
                </Button>
              </div>
              
              {requestInfo && (
                <div className="border rounded-md p-4 bg-slate-50 overflow-auto max-h-[400px]">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(requestInfo, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {status && (
        <Alert className="mt-6" variant={status.success ? "default" : "destructive"}>
          {status.success ? <CheckIcon className="h-4 w-4" /> : <XIcon className="h-4 w-4" />}
          <AlertTitle>
            {status.success ? t('cookieTest.status.success') : t('cookieTest.status.error')}
          </AlertTitle>
          <AlertDescription>
            {status.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}