import { useState } from "react";
import { useGovEntities } from "@/hooks/use-gov-entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Building2, Globe, Building, Search, PlusCircle } from "lucide-react";
import { GovEntity } from "@shared/schema";
import { Input } from "@/components/ui/input";
import GovEntityDialog from "./GovEntityDialog";
import EntityCard from "./EntityCard";
import EntityRow from "./EntityRow";

export default function GovEntityList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [entityType, setEntityType] = useState<string>("all");
  const [region, setRegion] = useState<string>("all");
  const [showActive, setShowActive] = useState<boolean>(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Fetch government entities
  const { data: entities, isLoading, error } = useGovEntities({
    entityType: entityType === "all" ? undefined : entityType,
    region: region === "all" ? undefined : region,
    isActive: showActive
  });
  
  // Filter entities by search query
  const filteredEntities = entities?.filter(entity => {
    const query = searchQuery.toLowerCase();
    return (
      entity.name.toLowerCase().includes(query) ||
      (entity.arabicName && entity.arabicName.toLowerCase().includes(query))
    );
  });
  
  const regions = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah", "UAE"];
  const entityTypes = ["federal", "local", "ministry", "authority", "council"];
  
  // Handle UI for loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Handle UI for error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-destructive">Error loading government entities: {error.message}</p>
      </div>
    );
  }
  
  // Render the entity list with filters
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">UAE Government Entities</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Entity
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine the government entities displayed below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="entity-type">Entity Type</Label>
              <Select
                value={entityType}
                onValueChange={setEntityType}
              >
                <SelectTrigger id="entity-type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {entityTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select
                value={region}
                onValueChange={setRegion}
              >
                <SelectTrigger id="region">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex items-end pb-1">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-active"
                  checked={showActive}
                  onCheckedChange={setShowActive}
                />
                <Label htmlFor="show-active">Active entities only</Label>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredEntities?.length || 0} entities
          </div>
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")}>
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardFooter>
      </Card>
      
      {/* Entity listing */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredEntities?.map(entity => (
            <EntityCard key={entity.id} entity={entity} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredEntities?.map(entity => (
            <EntityRow key={entity.id} entity={entity} />
          ))}
        </div>
      )}
      
      {/* Create entity dialog */}
      <GovEntityDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}

