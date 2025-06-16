import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ScheduledPost } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Clock, Calendar, Send, Edit2, Trash2, AlertCircle, Sparkles, CheckCircle2, XCircle, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function ScheduledPostsList() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [filterPlatform, setFilterPlatform] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Fetch scheduled posts
  const scheduledPostsQuery = useQuery({
    queryKey: ["/api/social/scheduled-posts"],
    queryFn: async () => {
      const res = await fetch("/api/social/scheduled-posts");
      if (!res.ok) throw new Error("Failed to fetch scheduled posts");
      return res.json() as Promise<ScheduledPost[]>;
    }
  });
  
  // Publish now mutation
  const publishNowMutation = useMutation({
    mutationFn: async (post: ScheduledPost) => {
      const res = await apiRequest("POST", "/api/social/publish-now", {
        content: post.content,
        platform: post.platform,
        hashtags: post.hashtags,
        mediaUrls: post.mediaUrls,
        scheduledPostId: post.id
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/scheduled-posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/social-posts"] });
      toast({
        title: t("Post Published"),
        description: t("Your post has been published successfully"),
      });
    },
    onError: (error) => {
      console.error("Error publishing post:", error);
      toast({
        title: t("Publishing Failed"),
        description: t("Failed to publish post. Please try again."),
        variant: "destructive"
      });
    }
  });
  
  // Cancel post mutation
  const cancelPostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("PATCH", `/api/social/scheduled-posts/${postId}`, {
        status: "cancelled"
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/scheduled-posts"] });
      toast({
        title: t("Post Cancelled"),
        description: t("The scheduled post has been cancelled"),
      });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      console.error("Error cancelling post:", error);
      toast({
        title: t("Cancellation Failed"),
        description: t("Failed to cancel the post. Please try again."),
        variant: "destructive"
      });
    }
  });
  
  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("DELETE", `/api/social/scheduled-posts/${postId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/scheduled-posts"] });
      toast({
        title: t("Post Deleted"),
        description: t("The post has been permanently deleted"),
      });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      console.error("Error deleting post:", error);
      toast({
        title: t("Deletion Failed"),
        description: t("Failed to delete the post. Please try again."),
        variant: "destructive"
      });
    }
  });
  
  // Filter posts
  const filteredPosts = scheduledPostsQuery.data?.filter(post => {
    const matchesPlatform = !filterPlatform || post.platform.toLowerCase() === filterPlatform.toLowerCase();
    const matchesStatus = !filterStatus || post.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = !searchTerm || 
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.hashtags && post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    return matchesPlatform && matchesStatus && matchesSearch;
  });
  
  // Group posts by date
  const groupPostsByDate = (posts: ScheduledPost[] | undefined) => {
    if (!posts) return {};
    
    const grouped: Record<string, ScheduledPost[]> = {};
    
    posts.forEach(post => {
      const date = new Date(post.scheduledTime);
      const dateStr = format(date, "yyyy-MM-dd");
      
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      
      grouped[dateStr].push(post);
    });
    
    // Sort by date
    return Object.fromEntries(
      Object.entries(grouped).sort(([dateA], [dateB]) => 
        new Date(dateA).getTime() - new Date(dateB).getTime()
      )
    );
  };
  
  const groupedPosts = groupPostsByDate(filteredPosts);
  
  // Get platform badge color
  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "twitter":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "facebook":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200";
      case "instagram":
        return "bg-pink-100 text-pink-800 hover:bg-pink-200";
      case "linkedin":
        return "bg-sky-100 text-sky-800 hover:bg-sky-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "published":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "failed":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "published":
        return <CheckCircle2 className="h-4 w-4" />;
      case "failed":
        return <AlertCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t("Scheduled Posts")}</h2>
          <p className="text-muted-foreground">
            {t("Manage and monitor your scheduled social media posts")}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            placeholder={t("Search content or hashtags...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-auto"
          />
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("All Platforms")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("All Platforms")}</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("All Statuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("All Statuses")}</SelectItem>
              <SelectItem value="pending">{t("Pending")}</SelectItem>
              <SelectItem value="published">{t("Published")}</SelectItem>
              <SelectItem value="failed">{t("Failed")}</SelectItem>
              <SelectItem value="cancelled">{t("Cancelled")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Scheduled Posts List */}
      <div className="space-y-6">
        {scheduledPostsQuery.isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, postIdx) => (
                      <div key={postIdx} className="flex justify-between items-center p-4 border rounded-md">
                        <div className="flex flex-col gap-2 w-full">
                          <div className="flex justify-between">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-5 w-32" />
                          </div>
                          <Skeleton className="h-16 w-full" />
                          <div className="flex gap-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPosts && filteredPosts.length > 0 ? (
          Object.entries(groupedPosts).map(([dateStr, posts]) => (
            <Card key={dateStr}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {format(new Date(dateStr), "EEEE, MMMM d, yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="flex flex-col md:flex-row justify-between gap-4 p-4 border rounded-md hover:bg-muted/50 transition-colors">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getPlatformColor(post.platform)}>
                              {post.platform}
                            </Badge>
                            <Badge className={getStatusColor(post.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(post.status)}
                                {t(post.status.charAt(0).toUpperCase() + post.status.slice(1))}
                              </span>
                            </Badge>
                            {post.aiGenerated && (
                              <Badge variant="outline" className="border-primary/30 gap-1">
                                <Sparkles className="h-3 w-3 text-primary" />
                                {t("AI Generated")}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            {format(new Date(post.scheduledTime), "h:mm a")}
                          </div>
                        </div>
                        
                        <div className="text-sm">{post.content}</div>
                        
                        {post.hashtags && post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {post.hashtags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex md:flex-col justify-end gap-2 mt-2 md:mt-0">
                        {post.status === "pending" && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setSelectedPost(post);
                                publishNowMutation.mutate(post);
                              }}
                              disabled={publishNowMutation.isPending && selectedPost?.id === post.id}
                            >
                              {publishNowMutation.isPending && selectedPost?.id === post.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4 mr-1" />
                              )}
                              {t("Publish Now")}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setSelectedPost(post);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {t("Cancel")}
                            </Button>
                          </>
                        )}
                        
                        {post.status === "published" && (
                          <div className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            {post.publishedAt ? (
                              <>
                                {t("Published")} {format(new Date(post.publishedAt), "MMM d, h:mm a")}
                              </>
                            ) : (
                              t("Published")
                            )}
                          </div>
                        )}
                        
                        {post.status === "cancelled" && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <XCircle className="h-4 w-4" />
                            {t("Cancelled")}
                          </div>
                        )}
                        
                        {post.status === "failed" && (
                          <div className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {t("Failed to publish")}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <div className="space-y-2">
                <Calendar className="h-10 w-10 mx-auto text-muted-foreground" />
                <h3 className="text-lg font-medium">{t("No Scheduled Posts")}</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || filterPlatform || filterStatus 
                    ? t("No posts match your current filters. Try changing your search criteria.")
                    : t("You don't have any scheduled posts yet. Create one to get started.")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Delete/Cancel Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Cancel Scheduled Post")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("Are you sure you want to cancel this scheduled post? This action can be reversed by editing the post's status later.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Keep It")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (selectedPost) {
                  cancelPostMutation.mutate(selectedPost.id);
                }
              }}
              disabled={cancelPostMutation.isPending}
            >
              {cancelPostMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {t("Cancel Post")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}