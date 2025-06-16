import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Keyboard, Zap, Type, PanelLeftClose } from 'lucide-react';

interface AccessibilityPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  open,
  onOpenChange,
}) => {
  const { preferences, setPreference, resetPreferences } = useAccessibility();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('visual');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" aria-hidden="true" />
            {t('accessibility.settings', 'Accessibility Settings')}
          </DialogTitle>
          <DialogDescription>
            {t('accessibility.settingsDescription', 'Customize your experience to improve accessibility.')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="visual" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="visual" className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" aria-hidden="true" />
              <span>{t('accessibility.visual', 'Visual')}</span>
            </TabsTrigger>
            <TabsTrigger value="motion" className="flex items-center gap-1.5">
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
              <span>{t('accessibility.motion', 'Motion')}</span>
            </TabsTrigger>
            <TabsTrigger value="input" className="flex items-center gap-1.5">
              <Keyboard className="h-4 w-4" aria-hidden="true" />
              <span>{t('accessibility.input', 'Input')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="high-contrast" className="text-base">
                  {t('accessibility.highContrast', 'High Contrast Mode')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.highContrastDescription', 'Increases contrast for better readability')}
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={preferences.highContrast}
                onCheckedChange={(checked) => setPreference('highContrast', checked)}
                aria-label={t('accessibility.highContrast', 'High Contrast Mode')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="large-text" className="text-base">
                  {t('accessibility.largeText', 'Large Text')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.largeTextDescription', 'Increases text size throughout the application')}
                </p>
              </div>
              <Switch
                id="large-text"
                checked={preferences.largeText}
                onCheckedChange={(checked) => setPreference('largeText', checked)}
                aria-label={t('accessibility.largeText', 'Large Text')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="screen-reader" className="text-base">
                  {t('accessibility.screenReader', 'Screen Reader Optimizations')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.screenReaderDescription', 'Enhances content for screen readers')}
                </p>
              </div>
              <Switch
                id="screen-reader"
                checked={preferences.screenReaderMode}
                onCheckedChange={(checked) => setPreference('screenReaderMode', checked)}
                aria-label={t('accessibility.screenReader', 'Screen Reader Optimizations')}
              />
            </div>
          </TabsContent>

          <TabsContent value="motion" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reduce-motion" className="text-base">
                  {t('accessibility.reduceMotion', 'Reduce Motion')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.reduceMotionDescription', 'Minimizes animations and transitions')}
                </p>
              </div>
              <Switch
                id="reduce-motion"
                checked={preferences.reduceMotion}
                onCheckedChange={(checked) => setPreference('reduceMotion', checked)}
                aria-label={t('accessibility.reduceMotion', 'Reduce Motion')}
              />
            </div>
          </TabsContent>

          <TabsContent value="input" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="keyboard-mode" className="text-base">
                  {t('accessibility.keyboardMode', 'Enhanced Keyboard Navigation')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.keyboardModeDescription', 'Improves navigation and interaction using keyboard')}
                </p>
              </div>
              <Switch
                id="keyboard-mode"
                checked={preferences.keyboardMode}
                onCheckedChange={(checked) => setPreference('keyboardMode', checked)}
                aria-label={t('accessibility.keyboardMode', 'Enhanced Keyboard Navigation')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="focus-indicators" className="text-base">
                  {t('accessibility.focusIndicators', 'Focus Indicators')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('accessibility.focusIndicatorsDescription', 'Shows enhanced visual focus indicators')}
                </p>
              </div>
              <Switch
                id="focus-indicators"
                checked={preferences.focusIndicators}
                onCheckedChange={(checked) => setPreference('focusIndicators', checked)}
                aria-label={t('accessibility.focusIndicators', 'Focus Indicators')}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={resetPreferences}
            className="interactive-element"
            aria-label={t('accessibility.resetDefaults', 'Reset to defaults')}
          >
            {t('accessibility.resetDefaults', 'Reset to defaults')}
          </Button>
          <Button 
            onClick={() => onOpenChange(false)} 
            className="interactive-element"
            aria-label={t('common.done', 'Done')}
          >
            {t('common.done', 'Done')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AccessibilityPanel;