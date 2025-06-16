import React from 'react';
import { useDialog } from '@/hooks/useDialog';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Settings, Info, X, CheckCircle, User, Mail, Phone } from 'lucide-react';

const DialogDemo: React.FC = () => {
  const { t } = useTranslation();
  
  // Basic dialog state
  const basicDialog = useDialog();
  
  // Form dialog state
  const formDialog = useDialog();
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    notifications: false,
  });
  
  // Custom dialog state
  const customDialog = useDialog();
  
  // Success dialog state
  const successDialog = useDialog();
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show success toast
    toast({
      title: t('dialog.demo.form.submitted'),
      description: `${t('dialog.demo.form.name')}: ${formData.name}, ${t('dialog.demo.form.email')}: ${formData.email}, ${t('dialog.demo.form.notifications')}: ${formData.notifications ? 'On' : 'Off'}`,
    });
    
    // Close form dialog
    formDialog.setOpen(false);
    
    // Open success dialog
    successDialog.setOpen(true);
  };
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">{t('dialog.demo.title')}</h1>
        <p className="text-muted-foreground mb-6">
          {t('dialog.demo.subtitle')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Basic Dialog */}
          <div className="border rounded-lg p-6 flex flex-col">
            <h2 className="text-xl font-medium mb-4">{t('dialog.demo.basic.title')}</h2>
            <p className="text-muted-foreground mb-6 flex-grow">
              {t('dialog.demo.basic.description')}
            </p>
            
            <Dialog open={basicDialog.open} onOpenChange={basicDialog.onOpenChange}>
              <DialogTrigger asChild>
                <Button className="w-full">{t('dialog.demo.basic.buttonText')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('dialog.demo.basic.dialogTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('dialog.demo.basic.dialogDescription')}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p>
                    {t('dialog.demo.basic.content')}
                  </p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">{t('dialog.demo.basic.cancel')}</Button>
                  </DialogClose>
                  <Button>{t('dialog.demo.basic.save')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Form Dialog */}
          <div className="border rounded-lg p-6 flex flex-col">
            <h2 className="text-xl font-medium mb-4">{t('dialog.demo.form.title')}</h2>
            <p className="text-muted-foreground mb-6 flex-grow">
              {t('dialog.demo.form.description')}
            </p>
            
            <Dialog open={formDialog.open} onOpenChange={formDialog.onOpenChange}>
              <DialogTrigger asChild>
                <Button className="w-full">{t('dialog.demo.form.buttonText')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('dialog.demo.form.dialogTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('dialog.demo.form.dialogDescription')}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">{t('dialog.demo.form.name')}</Label>
                      <div className="relative">
                        <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder={t('dialog.demo.form.namePlaceholder')}
                          className="pl-8"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">{t('dialog.demo.form.email')}</Label>
                      <div className="relative">
                        <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder={t('dialog.demo.form.emailPlaceholder')}
                          className="pl-8"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notifications"
                        checked={formData.notifications}
                        onCheckedChange={(checked) => setFormData({ ...formData, notifications: checked })}
                      />
                      <Label htmlFor="notifications">{t('dialog.demo.form.notifications')}</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">{t('dialog.demo.form.cancel')}</Button>
                    </DialogClose>
                    <Button type="submit">{t('dialog.demo.form.save')}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Custom Styled Dialog */}
          <div className="border rounded-lg p-6 flex flex-col">
            <h2 className="text-xl font-medium mb-4">{t('dialog.demo.custom.title')}</h2>
            <p className="text-muted-foreground mb-6 flex-grow">
              {t('dialog.demo.custom.description')}
            </p>
            
            <Dialog open={customDialog.open} onOpenChange={customDialog.onOpenChange}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">{t('dialog.demo.custom.buttonText')}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader className="bg-primary/10 -m-6 mb-2 p-6 rounded-t-lg">
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary/50">
                      {t('dialog.demo.custom.badge')}
                    </Badge>
                    <DialogClose className="h-6 w-6 rounded-full hover:bg-primary/20 p-1">
                      <X className="h-4 w-4" />
                    </DialogClose>
                  </div>
                  <DialogTitle className="text-center text-xl text-primary">
                    {t('dialog.demo.custom.dialogTitle')}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="py-4">
                  <p>{t('dialog.demo.custom.content')}</p>
                  <div className="my-4 p-4 bg-muted rounded-md text-sm">
                    <strong>{t('dialog.demo.custom.note')}</strong> {t('dialog.demo.custom.noteContent')}
                  </div>
                </div>
                
                <DialogFooter className="bg-muted/50 -m-6 mt-2 p-6 pt-4 rounded-b-lg border-t">
                  <Button variant="outline">{t('dialog.demo.custom.cancel')}</Button>
                  <Button className="bg-gradient-to-r from-primary to-primary-foreground hover:from-primary-foreground hover:to-primary">
                    {t('dialog.demo.custom.apply')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Success Dialog */}
          <div className="border rounded-lg p-6 flex flex-col">
            <h2 className="text-xl font-medium mb-4">{t('dialog.demo.success.title')}</h2>
            <p className="text-muted-foreground mb-6 flex-grow">
              {t('dialog.demo.success.description')}
            </p>
            
            <Dialog open={successDialog.open} onOpenChange={successDialog.onOpenChange}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="default">{t('dialog.demo.success.buttonText')}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-xs">
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="rounded-full bg-green-100 p-3 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <DialogTitle className="text-xl mb-2">{t('dialog.demo.success.dialogTitle')}</DialogTitle>
                  <DialogDescription className="text-center">
                    {t('dialog.demo.success.dialogContent')}
                  </DialogDescription>
                  <Button className="mt-6 w-full" onClick={() => successDialog.setOpen(false)}>
                    {t('dialog.demo.success.continue')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-xl font-medium mb-3 flex items-center">
          <Info className="mr-2 h-5 w-5" />
          {t('dialog.demo.implementation.title')}
        </h2>
        <p className="mb-4">
          {t('dialog.demo.implementation.description')}
        </p>
        <pre className="bg-background p-4 rounded-md text-sm overflow-x-auto">
{`// Dialog state management
const dialog = useDialog();

// Use in component
<Dialog open={dialog.open} onOpenChange={dialog.onOpenChange}>
  <DialogTrigger>${t('dialog.demo.implementation.code.trigger')}</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>${t('dialog.demo.implementation.code.title')}</DialogTitle>
      <DialogDescription>${t('dialog.demo.implementation.code.description')}</DialogDescription>
    </DialogHeader>
    <div>${t('dialog.demo.implementation.code.content')}</div>
    <DialogFooter>
      <DialogClose>${t('dialog.demo.implementation.code.cancel')}</DialogClose>
      <Button>${t('dialog.demo.implementation.code.submit')}</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
        </pre>
      </div>
    </div>
  );
};

export default DialogDemo;