import React, { useState } from 'react';
import { useGovEntities } from "@/hooks/use-gov-entities";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function EntityTestPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { data: entities, isLoading, error } = useGovEntities();
  const [entityId, setEntityId] = useState<string>("");
  
  const handleEntitySelect = (id: number) => {
    setLocation(`/entity-monitoring/${id}`);
  };
  
  const handleDirectAccess = () => {
    if (entityId && !isNaN(parseInt(entityId))) {
      setLocation(`/entity-monitoring/${entityId}`);
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (error) {
      return (
        <Card className="bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">{t('entity.errorLoadingEntities')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error.message}</p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <>
        <h1 className="text-2xl font-bold mb-6">{t('entity.testPage')}</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('entity.directAccessTest')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entityId">{t('entity.enterEntityId')}</Label>
                <Input 
                  id="entityId"
                  type="number" 
                  value={entityId} 
                  onChange={(e) => setEntityId(e.target.value)}
                  placeholder={t('entity.entityIdPlaceholder')}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleDirectAccess}>
                  {t('entity.goToEntityPage')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('entity.availableEntities')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entities?.map((entity) => (
                <Card key={entity.id} className="hover:bg-secondary/10 cursor-pointer transition-colors"
                  onClick={() => handleEntitySelect(entity.id)}>
                  <CardContent className="p-4">
                    <div className="font-medium">{entity.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {t(`entityType.${entity.entityType}`, entity.entityType)} 
                      {entity.region && <> • {entity.region}</>}
                    </div>
                    <div className="mt-2 text-xs">{t('common.id')}: {entity.id}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </>
    );
  };
  
  return (
    <PageLayout>
      <div className="container py-8">
        {renderContent()}
      </div>
    </PageLayout>
  );
}