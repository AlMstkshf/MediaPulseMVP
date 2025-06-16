import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GovEntity } from "@shared/schema";
import { Building2, ExternalLink } from "lucide-react";

interface EntityRowProps {
  entity: GovEntity;
}

export default function EntityRow({ entity }: EntityRowProps) {
  const [, setLocation] = useLocation();
  
  // Handle row click to navigate to entity details
  const handleClick = () => {
    setLocation(`/entity-monitoring/${entity.id}`);
  };
  
  // Get avatar content
  const getAvatarContent = () => {
    if (entity.iconUrl) {
      return <AvatarImage src={entity.iconUrl} alt={entity.name} />;
    }
    
    return (
      <AvatarFallback>
        <Building2 className="h-5 w-5" />
      </AvatarFallback>
    );
  };
  
  return (
    <Card 
      className="overflow-hidden transition-all hover:border-primary/50 cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            {getAvatarContent()}
          </Avatar>
          
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{entity.name}</p>
              {entity.isActive === false && (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  Inactive
                </Badge>
              )}
            </div>
            {entity.arabicName && (
              <p className="text-sm text-muted-foreground truncate">
                {entity.arabicName}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className="capitalize">
              {entity.entityType}
            </Badge>
            
            {entity.region && (
              <Badge variant="outline">
                {entity.region}
              </Badge>
            )}
            
            {entity.websiteUrl && (
              <a 
                href={entity.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}