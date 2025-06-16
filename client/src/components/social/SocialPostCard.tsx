import { SocialPost } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Twitter, Facebook, Instagram, Newspaper, MessageSquare, Share2, Heart, Award, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const getSentimentColor = (sentiment: number | null) => {
  if (sentiment === null) return "bg-gray-100 text-gray-500";
  if (sentiment <= 25) return "bg-red-100 text-red-600";
  if (sentiment <= 50) return "bg-orange-100 text-orange-600";
  if (sentiment <= 75) return "bg-blue-100 text-blue-600";
  return "bg-green-100 text-green-600";
};

const getSentimentLabel = (sentiment: number | null) => {
  if (sentiment === null) return "Unknown";
  if (sentiment <= 25) return "Negative";
  if (sentiment <= 50) return "Mixed";
  if (sentiment <= 75) return "Neutral";
  return "Positive";
};

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "twitter":
      return <Twitter className="h-5 w-5 text-primary" />;
    case "facebook":
      return <Facebook className="h-5 w-5 text-primary" />;
    case "instagram":
      return <Instagram className="h-5 w-5 text-primary" />;
    case "news":
      return <Newspaper className="h-5 w-5 text-primary" />;
    default:
      return <MessageSquare className="h-5 w-5 text-primary" />;
  }
};

const getAuthorInitials = (name: string | null) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

interface SocialPostCardProps {
  post: SocialPost;
  showActions?: boolean;
}

const SocialPostCard = ({ post, showActions = true }: SocialPostCardProps) => {
  const formattedDate = post.postedAt 
    ? formatDistanceToNow(new Date(post.postedAt), { addSuffix: true }) 
    : formatDistanceToNow(new Date(post.createdAt || new Date()), { addSuffix: true });

  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          {/* Post Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={post.authorAvatarUrl || undefined} alt={post.authorName || "User"} />
                <AvatarFallback>{getAuthorInitials(post.authorName)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{post.authorName || "Anonymous"}</div>
                <div className="text-sm text-gray-500 flex items-center">
                  {getPlatformIcon(post.platform)}
                  <span className="ml-1">
                    {post.authorUsername ? `@${post.authorUsername.replace(/^@/, '')}` : post.platform}
                  </span>
                  <span className="mx-1">•</span>
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className={getSentimentColor(post.sentiment)}>
                    {getSentimentLabel(post.sentiment)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sentiment Analysis Score</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Post Content */}
          <div className="mb-3 whitespace-pre-wrap">{post.content}</div>

          {/* Keywords */}
          {post.keywords && post.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.keywords.map((keyword, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}

          {/* Engagement Info */}
          {showActions && (
            <div className="flex items-center justify-between pt-3 border-t text-gray-500 text-sm">
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                <span className="mr-3">{typeof post.engagement === 'object' && post.engagement ? (post.engagement as any).likes || 0 : 0}</span>
                <MessageSquare className="h-4 w-4 mr-1" />
                <span className="mr-3">{typeof post.engagement === 'object' && post.engagement ? (post.engagement as any).comments || 0 : 0}</span>
                <Share2 className="h-4 w-4 mr-1" />
                <span>{typeof post.engagement === 'object' && post.engagement ? (post.engagement as any).shares || 0 : 0}</span>
              </div>
              {post.postUrl && (
                <a 
                  href={post.postUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center"
                >
                  <Award className="h-4 w-4 mr-1" />
                  View Original
                </a>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialPostCard;