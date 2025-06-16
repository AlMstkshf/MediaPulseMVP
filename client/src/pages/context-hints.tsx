import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/dashboard/PageHeader';
import PageLayout from '@/components/layout/PageLayout';
import ContextHintInput from '@/components/context-hints/ContextHintInput';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Lightbulb, Languages } from 'lucide-react';

export default function ContextHintsPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  interface ExampleText {
    title: string;
    content: string;
  }
  
  const exampleTexts: ExampleText[] = [
    {
      title: t('context_hints.example_press_release_title'),
      content: t('context_hints.example_press_release')
    },
    {
      title: t('context_hints.example_social_post_title'),
      content: t('context_hints.example_social_post')
    },
    {
      title: t('context_hints.example_email_title'),
      content: t('context_hints.example_email')
    }
  ];

  return (
    <PageLayout>
      <Helmet>
        <title>{t('context_hints')} | {t('media_intelligence_platform')}</title>
      </Helmet>
      
      <PageHeader
        title={t('language_context_hints')}
        showDateFilter={false}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ContextHintInput />
        </div>
        
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('about_context_hints')}</CardTitle>
                <CardDescription>{t('how_context_hints_work')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{t('context_hints_description')}</p>
                
                <div className="flex items-start space-x-2">
                  <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium">{t('supported_hint_types')}</h4>
                    <ul className="list-disc list-inside space-y-1 mt-1 text-sm text-muted-foreground">
                      <li>{t('grammar')}: {t('grammar_description')}</li>
                      <li>{t('clarity')}: {t('clarity_description')}</li>
                      <li>{t('tone')}: {t('tone_description')}</li>
                      <li>{t('cultural')}: {t('cultural_description')}</li>
                      <li>{t('formality')}: {t('formality_description')}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('example_texts')}</CardTitle>
                <CardDescription>{t('try_with_these_examples')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="0">
                  <TabsList className="w-full">
                    {exampleTexts.map((example, index) => (
                      <TabsTrigger 
                        key={index} 
                        value={index.toString()}
                        className="flex-1"
                      >
                        {example.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {exampleTexts.map((example, index) => (
                    <TabsContent 
                      key={index} 
                      value={index.toString()}
                      className="p-3 border rounded-md mt-3 text-sm whitespace-pre-wrap"
                      dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
                    >
                      {example.content}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
    </PageLayout>
  );
}