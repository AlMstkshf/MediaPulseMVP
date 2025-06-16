import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { KnowledgeBaseArticle, User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  Calendar,
  User as UserIcon,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Printer,
  BookOpen
} from "lucide-react";

export default function KnowledgeArticle() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const articleId = parseInt(id);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // Fetch article details
  const { data: article, isLoading, error } = useQuery<KnowledgeBaseArticle>({
    queryKey: [`/api/knowledge-base/${articleId}`],
    queryFn: async () => {
      if (isNaN(articleId)) throw new Error("Invalid article ID");
      const res = await fetch(`/api/knowledge-base/${articleId}`);
      if (!res.ok) throw new Error("Failed to fetch article");
      return res.json();
    },
    enabled: !isNaN(articleId)
  });

  // Fetch author details
  const { data: author } = useQuery<User>({
    queryKey: [`/api/users/${article?.authorId}`],
    queryFn: async () => {
      if (!article?.authorId) throw new Error("Invalid author ID");
      const res = await fetch(`/api/users/${article.authorId}`);
      if (!res.ok) throw new Error("Failed to fetch author details");
      return res.json();
    },
    enabled: !!article?.authorId
  });

  // Submit feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async (isHelpful: boolean) => {
      const response = await apiRequest(
        "POST", 
        `/api/knowledge-base/${articleId}/feedback`,
        { isHelpful }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/knowledge-base/${articleId}`] });
      setFeedbackSubmitted(true);
      toast({
        title: t('knowledgeArticle.feedbackThankYou'),
        description: t('knowledgeArticle.feedbackReceived'),
      });
    },
    onError: (error) => {
      toast({
        title: t('knowledgeArticle.feedbackError'),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Format date to localized string
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Handle sharing the article
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title || t('knowledgeArticle.shareTitle'),
          text: article?.title || t('knowledgeArticle.shareTitle'),
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: t('knowledgeArticle.linkCopied'),
        description: t('knowledgeArticle.linkCopiedDescription')
      });
    }
  };

  // Handle printing the article
  const handlePrint = () => {
    window.print();
  };

  // Handle feedback submission
  const handleFeedback = (isHelpful: boolean) => {
    if (!user) {
      toast({
        title: t('knowledgeArticle.loginRequired'),
        description: t('knowledgeArticle.loginRequiredDescription'),
        variant: "destructive"
      });
      return;
    }
    
    feedbackMutation.mutate(isHelpful);
  };

  if (isNaN(articleId)) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-destructive">
            {t('knowledgeArticle.invalidId')}
          </h1>
          <p className="mb-4">{t('knowledgeArticle.invalidIdDescription')}</p>
          <Button asChild>
            <Link href="/support/knowledge-base">
              {t('knowledgeArticle.backToKnowledgeBase')}
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center">
          <Link href="/support">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              {t('knowledgeArticle.backToSupport')}
            </Button>
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
          <Link href="/support/knowledge-base">
            <Button variant="ghost" size="sm">
              {t('knowledgeArticle.knowledgeBase')}
            </Button>
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
          <span className="text-muted-foreground truncate max-w-[200px]">
            {isLoading ? t('knowledgeArticle.loading') : article?.title}
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : error || !article ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-destructive mb-4">{t('knowledgeArticle.errorLoading')}</p>
              <Button asChild>
                <Link href="/support/knowledge-base">
                  {t('knowledgeArticle.backToKnowledgeBase')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="print:shadow-none">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline">{article.category}</Badge>
                  {article.tags && article.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="text-3xl">{article.title}</CardTitle>
                
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{t('knowledgeArticle.publishedOn', { date: formatDate(article.publishedAt) })}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>{author?.fullName || t('knowledgeArticle.unknownAuthor')}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    <span>{article.helpfulCount || 0} {t('knowledgeArticle.helpfulVotes')}</span>
                  </div>
                </div>
              </CardHeader>

              <Separator className="print:hidden" />
              
              <CardContent className="pt-6">
                {/* Article content rendered as HTML */}
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none mb-8"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
                
                {/* Actions */}
                <div className="flex flex-wrap gap-4 justify-between items-center print:hidden">
                  <div className="flex gap-3">
                    <Button onClick={handleShare} variant="outline" size="sm" className="gap-1">
                      <Share2 className="h-4 w-4" />
                      {t('knowledgeArticle.share')}
                    </Button>
                    <Button onClick={handlePrint} variant="outline" size="sm" className="gap-1">
                      <Printer className="h-4 w-4" />
                      {t('knowledgeArticle.print')}
                    </Button>
                  </div>
                  
                  {feedbackSubmitted ? (
                    <div className="text-sm text-muted-foreground">
                      {t('knowledgeArticle.thankYouForFeedback')}
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-sm text-muted-foreground mb-1">
                        {t('knowledgeArticle.wasThisHelpful')}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleFeedback(true)}
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          disabled={feedbackMutation.isPending}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          {t('knowledgeArticle.yes')}
                        </Button>
                        <Button
                          onClick={() => handleFeedback(false)}
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          disabled={feedbackMutation.isPending}
                        >
                          <ThumbsDown className="h-4 w-4" />
                          {t('knowledgeArticle.no')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              {article?.tags?.length > 0 && (
                <CardFooter className="border-t pt-6 print:hidden">
                  <div className="w-full">
                    <h3 className="text-sm font-medium mb-2">{t('knowledgeArticle.relatedTopics')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, index) => (
                        <Link
                          key={index}
                          href={`/support/knowledge-base?tag=${encodeURIComponent(tag)}`}
                        >
                          <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                            {tag}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                </CardFooter>
              )}
            </Card>

            {/* More help section */}
            <Card className="print:hidden">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {t('knowledgeArticle.needMoreHelp.title')}
                </CardTitle>
                <CardDescription>
                  {t('knowledgeArticle.needMoreHelp.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild variant="default">
                    <Link href="/support/tickets/new">
                      {t('knowledgeArticle.needMoreHelp.createTicket')}
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/support/faq">
                      {t('knowledgeArticle.needMoreHelp.browseFaq')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}