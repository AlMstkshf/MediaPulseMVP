import { useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GovEntity } from "@shared/schema";
import { Building2, Globe, MapPin } from "lucide-react";

interface EntityCardProps {
  entity: GovEntity;
}

export default function EntityCard({ entity }: EntityCardProps) {
  const [, setLocation] = useLocation();
  
  // Handle card click to navigate to entity details
  const handleClick = () => {
    setLocation(`/entity-monitoring/${entity.id}`);
  };
  
  return (
    <Card 
      className="overflow-hidden transition-all hover:border-primary/50 cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold truncate">{entity.name}</CardTitle>
          {entity.isActive === false && (
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              Inactive
            </Badge>
          )}
        </div>
        {entity.arabicName && (
          <p className="text-sm text-right text-muted-foreground mt-1">
            {entity.arabicName}
          </p>
        )}
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 mr-2" />
            <span className="capitalize">{entity.entityType}</span>
          </div>
          
          {entity.region && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{entity.region}</span>
            </div>
          )}
          
          {entity.websiteUrl && (
            <div className="flex items-center text-sm text-muted-foreground overflow-hidden">
              <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{entity.websiteUrl}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full pt-2 border-t flex justify-end">
          <div className="flex items-center gap-2">
            {entity.priority !== null && entity.priority !== undefined && entity.priority > 0 && (
              <Badge variant="secondary" className="text-xs">
                Priority: {entity.priority}
              </Badge>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}