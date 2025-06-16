import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { KnowledgeBaseArticle } from "@shared/schema";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Loader2,
  BookOpen,
  Filter,
  Tag,
  CalendarDays,
  ThumbsUp,
  Clock
} from "lucide-react";

export default function KnowledgeBase() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  
  // Fetch knowledge base articles
  const { data: articles, isLoading, error } = useQuery<KnowledgeBaseArticle[]>({
    queryKey: ["/api/knowledge-base"],
    queryFn: async () => {
      const res = await fetch("/api/knowledge-base?published=true");
      if (!res.ok) throw new Error("Failed to fetch knowledge base articles");
      return res.json();
    }
  });

  // Extract unique categories and tags from knowledge base articles
  const { categories, tags } = useMemo(() => {
    const categorySet = new Set<string>();
    const tagSet = new Set<string>();
    
    if (articles) {
      articles.forEach(article => {
        if (article.category) categorySet.add(article.category);
        if (article.tags && Array.isArray(article.tags)) {
          article.tags.forEach(tag => tagSet.add(tag));
        }
      });
    }
    
    return {
      categories: Array.from(categorySet),
      tags: Array.from(tagSet)
    };
  }, [articles]);

  // Filter articles based on search query, selected category, and selected tag
  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    
    return articles.filter(article => {
      const matchesSearch = searchQuery 
        ? article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
          article.content.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
        
      const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
      
      const matchesTag = selectedTag === "all" || 
        (article.tags && Array.isArray(article.tags) && article.tags.includes(selectedTag));
      
      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [articles, searchQuery, selectedCategory, selectedTag]);

  // Format date to localized string
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
                  {t('knowledgeBase.backToSupport')}
                </Button>
              </Link>
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
              <span className="text-muted-foreground">{t('knowledgeBase.title')}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-2">{t('knowledgeBase.title')}</h1>
            <p className="text-muted-foreground">{t('knowledgeBase.subtitle')}</p>
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
                  placeholder={t('knowledgeBase.searchPlaceholder')}
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-[180px]">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder={t('knowledgeBase.categoryFilterPlaceholder')} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('knowledgeBase.allCategories')}</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-[180px]">
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <SelectValue placeholder={t('knowledgeBase.tagFilterPlaceholder')} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('knowledgeBase.allTags')}</SelectItem>
                    {tags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Articles */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {searchQuery || selectedCategory !== "all" || selectedTag !== "all" 
              ? t('knowledgeBase.filteredResults', { count: filteredArticles.length }) 
              : t('knowledgeBase.allArticles')}
          </h2>

          {isLoading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-destructive mb-2">{t('knowledgeBase.errorLoading')}</p>
                <Button onClick={() => window.location.reload()}>{t('knowledgeBase.tryAgain')}</Button>
              </CardContent>
            </Card>
          ) : filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground mb-2">{t('knowledgeBase.noResultsFound')}</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedTag("all");
                  }}
                >
                  {t('knowledgeBase.clearFilters')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="flex flex-col h-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <Badge variant="outline">{article.category}</Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5 mr-1" />
                        {formatDate(article.publishedAt)}
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">
                      <Link href={`/support/knowledge-base/${article.id}`}>
                        <a className="hover:text-primary hover:underline transition-colors">
                          {article.title}
                        </a>
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {article.content.substring(0, 150)}...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {article.tags && article.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 border-t flex justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                      {article.helpfulCount || 0}
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/support/knowledge-base/${article.id}`}>
                        {t('knowledgeBase.readMore')}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Category Sections */}
        {!searchQuery && selectedCategory === "all" && selectedTag === "all" && (
          <div className="space-y-6">
            <Separator />
            
            {categories.map((category) => {
              const categoryArticles = articles?.filter(a => a.category === category) || [];
              if (categoryArticles.length === 0) return null;
              
              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      {category}
                    </h2>
                    <Button 
                      asChild 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1"
                    >
                      <Link href={`/support/knowledge-base?category=${category}`}>
                        {t('knowledgeBase.viewAllInCategory')}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryArticles.slice(0, 3).map((article) => (
                      <Card key={article.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            <Link href={`/support/knowledge-base/${article.id}`}>
                              <a className="hover:text-primary hover:underline transition-colors">
                                {article.title}
                              </a>
                            </Link>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {article.content.substring(0, 120)}...
                          </p>
                        </CardContent>
                        <CardFooter className="pt-0 flex justify-between">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(article.publishedAt)}
                          </div>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/support/knowledge-base/${article.id}`}>
                              {t('knowledgeBase.readMore')}
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <Card>
          <CardHeader>
            <CardTitle>{t('knowledgeBase.cantFindAnswer.title')}</CardTitle>
            <CardDescription>{t('knowledgeBase.cantFindAnswer.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="default">
                <Link href="/support/tickets/new">{t('knowledgeBase.cantFindAnswer.createTicket')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/support/faq">{t('knowledgeBase.cantFindAnswer.browseFaq')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}