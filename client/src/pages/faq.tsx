import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaqItem } from "@shared/schema";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Loader2,
  FileQuestion,
  Filter
} from "lucide-react";

export default function FAQPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  
  // Fetch FAQ items
  const { data: faqItems, isLoading, error } = useQuery<FaqItem[]>({
    queryKey: ["/api/faqs"],
    queryFn: async () => {
      const res = await fetch("/api/faqs?activeOnly=true");
      if (!res.ok) throw new Error("Failed to fetch FAQs");
      return res.json();
    }
  });

  // Extract unique categories from FAQ items
  const categories = useMemo(() => {
    if (!faqItems) return [];
    const categorySet = new Set<string>();
    faqItems.forEach(item => {
      if (item.category) categorySet.add(item.category);
    });
    return Array.from(categorySet);
  }, [faqItems]);

  // Filter FAQ items based on search query and selected category
  const filteredFaqItems = useMemo(() => {
    if (!faqItems) return [];
    
    return faqItems.filter(item => {
      const matchesSearch = searchQuery 
        ? item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
        
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [faqItems, searchQuery, selectedCategory]);

  // Handle accordion toggle
  const handleAccordionChange = (value: string) => {
    setExpandedItem(expandedItem === value ? null : value);
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center">
              <Link href="/support">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  {t('faq.backToSupport')}
                </Button>
              </Link>
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
              <span className="text-muted-foreground">{t('faq.title')}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-2">{t('faq.title')}</h1>
            <p className="text-muted-foreground">{t('faq.subtitle')}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('faq.searchPlaceholder')}
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-[200px]">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder={t('faq.categoryFilterPlaceholder')} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('faq.allCategories')}</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-primary" />
              {searchQuery || selectedCategory !== "all" 
                ? t('faq.filteredResults', { count: filteredFaqItems.length }) 
                : t('faq.frequentlyAskedQuestions')}
            </CardTitle>
            <CardDescription>
              {searchQuery || selectedCategory !== "all" 
                ? t('faq.filteredDescription') 
                : t('faq.frequentlyAskedQuestionsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center p-6 text-destructive">
                <p>{t('faq.errorLoading')}</p>
              </div>
            ) : filteredFaqItems.length === 0 ? (
              <div className="text-center p-6">
                <p className="text-muted-foreground">{t('faq.noResultsFound')}</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  {t('faq.clearFilters')}
                </Button>
              </div>
            ) : (
              <Accordion 
                type="single" 
                collapsible 
                value={expandedItem || undefined}
                onValueChange={handleAccordionChange}
                className="space-y-4"
              >
                {filteredFaqItems.map((faq) => (
                  <AccordionItem 
                    key={faq.id} 
                    value={faq.id.toString()} 
                    className="border rounded-md px-4"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="text-left">
                        <h3 className="font-medium">{faq.question}</h3>
                        <p className="text-xs text-muted-foreground">{faq.category}</p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      <div 
                        className="prose prose-sm dark:prose-invert max-w-none" 
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <Card>
          <CardHeader>
            <CardTitle>{t('faq.needMoreHelp.title')}</CardTitle>
            <CardDescription>{t('faq.needMoreHelp.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="default">
                <Link href="/support/tickets/new">{t('faq.needMoreHelp.createTicket')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/support/knowledge-base">{t('faq.needMoreHelp.browseKnowledgeBase')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}