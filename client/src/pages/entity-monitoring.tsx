import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import PageLayout from "@/components/layout/PageLayout";
import GovEntityList from "@/components/entities/GovEntityList";
import EntityMentions from "@/components/entities/EntityMentions";
import EntityErrorDebug from "@/components/entities/EntityErrorDebug";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bug } from "lucide-react";

export default function EntityMonitoringPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [matchEntity, paramsEntity] = useRoute("/entity-monitoring/:id");
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);
  const [debugMode, setDebugMode] = useState<boolean>(false); // Debug mode disabled by default
  const { user } = useAuth(); // Get current user to check role
  
  // Get entity ID from URL params if available
  const entityIdFromUrl = paramsEntity?.id ? parseInt(paramsEntity.id) : null;
  
  // Use the entity ID from the URL or from state
  const entityId = entityIdFromUrl || selectedEntityId;
  
  // Handle returning to the entity list
  const handleBackClick = () => {
    setSelectedEntityId(null);
    setLocation("/entity-monitoring");
  };
  
  // Toggle debug mode
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };
  
  // Check if user has admin or developer role to show debug button
  const canAccessDebugMode = user?.role === 'admin' || user?.role === 'developer';
  
  return (
    <PageLayout>
      <div className="container py-6 space-y-6">
        {entityId ? (
          <>
            {debugMode && canAccessDebugMode ? (
              <Tabs defaultValue="normal">
                <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="sm" onClick={handleBackClick} className="gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    {t('common.backToList')}
                  </Button>
                  <TabsList>
                    <TabsTrigger value="normal">{t('entity.normalView')}</TabsTrigger>
                    <TabsTrigger value="debug">{t('entity.debugView')}</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="normal">
                  <EntityMentions entityId={entityId} onBackClick={handleBackClick} />
                </TabsContent>
                <TabsContent value="debug">
                  <EntityErrorDebug />
                </TabsContent>
              </Tabs>
            ) : (
              <EntityMentions entityId={entityId} onBackClick={handleBackClick} />
            )}
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">{t('entity.monitoring')}</h1>
              {canAccessDebugMode && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={toggleDebugMode}
                  className="gap-1"
                >
                  <Bug className="h-4 w-4" />
                  {debugMode 
                    ? t('entity.disableDebugMode') 
                    : t('entity.enableDebugMode')
                  }
                </Button>
              )}
            </div>
            <GovEntityList />
          </>
        )}
      </div>
    </PageLayout>
  );
}