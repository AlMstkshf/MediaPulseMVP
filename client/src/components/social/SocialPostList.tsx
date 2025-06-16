import { SocialPost } from "@shared/schema";
import SocialPostCard from "./SocialPostCard";
import { Loader2 } from "lucide-react";

interface SocialPostListProps {
  posts: SocialPost[];
  isLoading: boolean;
  showActions?: boolean;
  emptyMessage?: string;
}

const SocialPostList = ({ 
  posts, 
  isLoading, 
  showActions = true, 
  emptyMessage = "No posts found" 
}: SocialPostListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <SocialPostCard key={post.id} post={post} showActions={showActions} />
      ))}
    </div>
  );
};

export default SocialPostList;