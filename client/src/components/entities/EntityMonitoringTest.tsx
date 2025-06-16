import { useEffect, useState } from "react";
import { useGovEntities, useGovEntityPosts } from "@/hooks/use-gov-entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { GovEntity, SocialPost } from "@shared/schema";

// A simple test component to verify API endpoints directly
export default function EntityMonitoringTest() {
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);

  // Fetch all government entities
  const { 
    data: entities, 
    isLoading: entitiesLoading, 
    error: entitiesError 
  } = useGovEntities();

  // Fetch posts for the selected entity
  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError
  } = useGovEntityPosts(selectedEntityId || 0);

  // For debugging purposes
  useEffect(() => {
    console.log("Entities:", entities);
    console.log("Selected Entity ID:", selectedEntityId);
    console.log("Posts:", posts);
  }, [entities, selectedEntityId, posts]);

  // Handle entity selection
  const handleEntityClick = (entityId: number) => {
    setSelectedEntityId(entityId);
  };

  // Handle errors in loading entities
  if (entitiesError) {
    return (
      <div className="p-6">
        <Card className="bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{entitiesError.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (entitiesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading entities...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Entity Monitoring API Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This is a test component to verify the API endpoints for UAE Government Entity Monitoring.
          </p>
          <p className="mb-4">
            {entities?.length || 0} entities loaded successfully.
          </p>
        </CardContent>
      </Card>

      {/* Display all entities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {entities?.map((entity: GovEntity) => (
          <Card 
            key={entity.id} 
            className={`cursor-pointer ${selectedEntityId === entity.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => handleEntityClick(entity.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                {entity.iconUrl && (
                  <img 
                    src={entity.iconUrl} 
                    alt={entity.name} 
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h3 className="font-medium">{entity.name}</h3>
                  {entity.arabicName && (
                    <p className="text-sm text-gray-500 mt-1">{entity.arabicName}</p>
                  )}
                  <div className="mt-2 flex items-center">
                    <span className={`text-xs px-2 py-1 rounded ${entity.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {entity.entityType}
                    </span>
                    {entity.region && (
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 ml-2">
                        {entity.region}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Display posts for selected entity */}
      {selectedEntityId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Posts for {entities?.find(e => e.id === selectedEntityId)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Loading posts...</span>
              </div>
            ) : postsError ? (
              <p className="text-red-600">Error loading posts: {postsError.message}</p>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post: SocialPost) => (
                  <div key={post.id} className="border rounded p-4">
                    <div className="flex justify-between">
                      <span className="font-medium">{post.authorName || "Anonymous"}</span>
                      <span className="text-sm text-gray-500">{post.platform}</span>
                    </div>
                    <p className="mt-2">{post.content}</p>
                    <div className="mt-2 flex justify-between">
                      <span className={`text-sm ${post.sentiment > 0.1 ? 'text-green-600' : post.sentiment < -0.1 ? 'text-red-600' : 'text-gray-600'}`}>
                        Sentiment: {post.sentiment.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(post.postedAt || post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No posts found for this entity.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Debug information */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Selected Entity ID:</strong> {selectedEntityId || 'None'}</p>
            <p><strong>Posts Count:</strong> {posts?.length || 0}</p>
            <p><strong>Entities Count:</strong> {entities?.length || 0}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}