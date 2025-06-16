import React, { useEffect } from 'react';
import { useGovEntities, useGovEntity, useGovEntityPosts } from "@/hooks/use-gov-entities";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EntityErrorDebug() {
  const [entityId, setEntityId] = React.useState(1); // Use a known entity ID for testing
  
  // Allow changing entity ID for testing
  const handleEntityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEntityId(Number(e.target.value));
  };
  
  // Fetch entity details
  const { 
    data: entity, 
    isLoading: isLoadingEntity, 
    error: entityError 
  } = useGovEntity(entityId);
  
  // Fetch entity posts
  const { 
    data: posts, 
    isLoading: isLoadingPosts, 
    error: postsError 
  } = useGovEntityPosts(entityId);
  
  // Log all data and errors for debugging
  useEffect(() => {
    console.log("Entity Data:", entity);
    console.log("Entity Loading:", isLoadingEntity);
    console.log("Entity Error:", entityError);
    
    console.log("Posts Data:", posts);
    console.log("Posts Loading:", isLoadingPosts);
    console.log("Posts Error:", postsError);
  }, [entity, isLoadingEntity, entityError, posts, isLoadingPosts, postsError]);
  
  // Handle loading state
  if (isLoadingEntity || isLoadingPosts) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading data...</span>
      </div>
    );
  }
  
  // Display errors
  if (entityError || postsError) {
    return (
      <Card className="bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Error Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          {entityError && (
            <div className="mb-4">
              <h3 className="font-bold">Entity Error:</h3>
              <pre className="text-sm bg-red-100 p-2 rounded mt-1 overflow-auto">
                {entityError.message}
                {entityError.stack && (
                  <div className="mt-2 text-xs">{entityError.stack}</div>
                )}
              </pre>
            </div>
          )}
          
          {postsError && (
            <div>
              <h3 className="font-bold">Posts Error:</h3>
              <pre className="text-sm bg-red-100 p-2 rounded mt-1 overflow-auto">
                {postsError.message}
                {postsError.stack && (
                  <div className="mt-2 text-xs">{postsError.stack}</div>
                )}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Fetch all entities for dropdown selector
  const { data: entities } = useGovEntities();
  
  // Display data summary
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Entity and Posts Data Loaded Successfully</span>
          <select 
            value={entityId} 
            onChange={handleEntityChange}
            className="px-2 py-1 border rounded text-sm"
          >
            {entities?.map(entity => (
              <option key={entity.id} value={entity.id}>
                {entity.name}
              </option>
            ))}
          </select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-bold">Entity:</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(entity, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-bold">Posts ({Array.isArray(posts) ? posts.length : 0}):</h3>
            {Array.isArray(posts) && posts.length > 0 ? (
              <pre className="text-sm bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-80">
                {JSON.stringify(posts, null, 2)}
              </pre>
            ) : (
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <p className="text-yellow-700">No posts found for this entity.</p>
                <p className="text-sm text-yellow-600 mt-1">
                  API endpoint <code>/api/gov-entities/{entityId}/posts</code> returned an empty array.
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <h3 className="font-bold text-blue-700">Troubleshooting:</h3>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-blue-700">
              <li>Check that the API is returning posts for this entity ID</li>
              <li>Verify that entity-post associations exist in the database</li>
              <li>Make sure the useGovEntityPosts hook is configured correctly</li>
              <li>Try manually adding a post association in the database</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}