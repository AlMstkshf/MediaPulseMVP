import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription, 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Check, Edit, Globe, Plus, Trash, Upload } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { 
  supportedLanguages, 
  Language, 
  addLanguage, 
  updateLanguage, 
  toggleLanguageActive, 
  setDefaultLanguage 
} from '@/lib/i18n/language-registry';
import i18n from '@/lib/i18n/index';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

// Form schema for adding/editing a language
const languageFormSchema = z.object({
  code: z.string().min(2).max(5),
  nameEnglish: z.string().min(2).max(50),
  nameNative: z.string().min(2).max(50),
  isRTL: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type LanguageFormValues = z.infer<typeof languageFormSchema>;

export function LanguageManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [languages, setLanguages] = useState<Language[]>([...supportedLanguages]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // React Hook Form setup
  const form = useForm<LanguageFormValues>({
    resolver: zodResolver(languageFormSchema),
    defaultValues: {
      code: '',
      nameEnglish: '',
      nameNative: '',
      isRTL: false,
      isActive: true,
    },
  });
  
  // Handle file upload and parse JSON
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError(null);
    
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        // TODO: In a real application, we would validate the structure of the translation file
        // and integrate it with the i18n system
        
        toast({
          title: t('settings.translationUploaded', 'Translation file uploaded'),
          description: t('settings.translationUploadSuccess', 'The translation file was successfully uploaded and will be processed.'),
        });
      } catch (error) {
        setUploadError(t('settings.invalidJson', 'Invalid JSON file. Please upload a valid JSON file.'));
        toast({
          title: t('settings.uploadFailed', 'Upload failed'),
          description: t('settings.invalidJson', 'Invalid JSON file. Please upload a valid JSON file.'),
          variant: 'destructive',
        });
      }
    };
    
    reader.readAsText(file);
  };
  
  // Open edit dialog with language data
  const handleEditLanguage = (language: Language) => {
    setEditingLanguage(language);
    form.reset({
      code: language.code,
      nameEnglish: language.name.english,
      nameNative: language.name.native,
      isRTL: language.isRTL,
      isActive: language.isActive,
    });
    setIsAddDialogOpen(true);
  };
  
  // Handle form submission
  const onSubmit = (values: LanguageFormValues) => {
    try {
      if (editingLanguage) {
        // Update existing language
        const updatedLanguages = updateLanguage(editingLanguage.code, {
          name: {
            english: values.nameEnglish,
            native: values.nameNative,
          },
          isRTL: values.isRTL,
          isActive: values.isActive,
        });
        setLanguages(updatedLanguages);
        toast({
          title: t('settings.languageUpdated', 'Language updated'),
          description: t('settings.languageUpdateSuccess', 'The language was successfully updated.'),
        });
      } else {
        // Add new language
        const newLanguage: Language = {
          code: values.code,
          name: {
            english: values.nameEnglish,
            native: values.nameNative,
          },
          isRTL: values.isRTL,
          isActive: values.isActive,
          completeness: 0, // New languages start with 0% completeness
        };
        
        const updatedLanguages = addLanguage(newLanguage);
        setLanguages(updatedLanguages);
        
        toast({
          title: t('settings.languageAdded', 'Language added'),
          description: t('settings.languageAddSuccess', 'The new language was successfully added. Please upload translation files to complete the setup.'),
        });
      }
      
      // Close dialog and reset form
      setIsAddDialogOpen(false);
      setEditingLanguage(null);
      form.reset();
    } catch (error: any) {
      toast({
        title: t('settings.error', 'Error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Toggle language active state
  const handleToggleActive = (code: string) => {
    try {
      const updatedLanguages = toggleLanguageActive(code);
      setLanguages(updatedLanguages);
      
      toast({
        title: t('settings.languageStatusChanged', 'Language status changed'),
        description: t('settings.languageStatusChangeSuccess', 'The language active status was updated successfully.'),
      });
    } catch (error: any) {
      toast({
        title: t('settings.error', 'Error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Make a language the default
  const handleMakeDefault = (code: string) => {
    try {
      const updatedLanguages = setDefaultLanguage(code);
      setLanguages(updatedLanguages);
      
      // Change the application language to the new default
      i18n.changeLanguage(code);
      
      toast({
        title: t('settings.defaultLanguageChanged', 'Default language changed'),
        description: t('settings.defaultLanguageChangeSuccess', 'The default language was updated successfully.'),
      });
    } catch (error: any) {
      toast({
        title: t('settings.error', 'Error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Reset the form when opening the add dialog
  const handleOpenAddDialog = () => {
    setEditingLanguage(null);
    form.reset({
      code: '',
      nameEnglish: '',
      nameNative: '',
      isRTL: false,
      isActive: true,
    });
    setIsAddDialogOpen(true);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.langManagement', 'Language Management')}</CardTitle>
        <CardDescription>
          {t('settings.langManagementDescription', 'Add, edit or remove language options for the platform')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            {t('settings.availableLanguages', 'Available Languages')}
          </h3>
          <div className="space-x-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenAddDialog} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('settings.addLanguage', 'Add New Language')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingLanguage 
                      ? t('settings.editLang', 'Edit Language') 
                      : t('settings.addLangTitle', 'Add New Language')}
                  </DialogTitle>
                  <DialogDescription>
                    {editingLanguage
                      ? t('settings.editLangDescription', 'Edit the language information below.')
                      : t('settings.addLangDescription', 'Fill in the language information below to add it to the platform.')}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('settings.languageCode', 'Language Code')}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={t('settings.langCodeExample', 'en')} 
                              {...field} 
                              disabled={!!editingLanguage} // Disable code field when editing
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nameEnglish"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('settings.langNameEnglish', 'Language Name (English)')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('settings.langNameEnglishExample', 'English')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nameNative"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('settings.langNameNative', 'Language Name (Native)')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('settings.langNameNativeExample', 'English')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isRTL"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>{t('settings.textDirection', 'Text Direction')}</FormLabel>
                            <FormDescription>
                              {field.value ? t('settings.rtl', 'Right to Left (RTL)') : t('settings.ltr', 'Left to Right (LTR)')}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>{t('settings.activeStatus', 'Active Status')}</FormLabel>
                            <FormDescription>
                              {field.value 
                                ? t('settings.languageIsActive', 'This language will be available for users') 
                                : t('settings.languageIsInactive', 'This language will be hidden from users')}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        {t('settings.cancel', 'Cancel')}
                      </Button>
                      <Button type="submit">
                        {editingLanguage 
                          ? t('settings.update', 'Update') 
                          : t('settings.create', 'Create')}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  {t('settings.importLangFile', 'Import Language File')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('settings.uploadLangFile', 'Upload Translation File')}</DialogTitle>
                  <DialogDescription>
                    {t('settings.langFileFormat', 'JSON format required')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="language-select">{t('settings.selectLanguage', 'Select Language')}</Label>
                    <select 
                      id="language-select"
                      name="language-select"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      aria-label={t('settings.selectLanguage', 'Select Language')}
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name.english} ({lang.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="language-file">{t('settings.selectFile', 'Select File')}</Label>
                    <Input 
                      id="language-file" 
                      type="file" 
                      accept=".json"
                      onChange={handleFileUpload}
                      aria-describedby="file-upload-description"
                      aria-required="true"
                      aria-invalid={!!uploadError}
                    />
                    <p id="file-upload-description" className="text-xs text-muted-foreground mt-1">
                      {t('settings.fileUploadDescription', 'Upload a JSON translation file. Maximum size: 2MB.')}
                    </p>
                    {uploadError && (
                      <p className="text-sm text-destructive" role="alert">{uploadError}</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button">
                    {t('settings.upload', 'Upload')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Table aria-label={t('settings.languageTableAriaLabel', 'Available languages')}>
          <caption className="sr-only">{t('settings.languageTableCaption', 'Table of available languages showing name, code, completeness, direction and action buttons')}</caption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">{t('settings.languageSelector', 'Language')}</TableHead>
              <TableHead scope="col">{t('settings.languageCode', 'Code')}</TableHead>
              <TableHead scope="col">{t('settings.completeness', 'Completeness')}</TableHead>
              <TableHead scope="col">{t('settings.textDirection', 'Direction')}</TableHead>
              <TableHead scope="col">{t('settings.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {languages.map((language) => (
              <TableRow key={language.code}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    {language.isDefault && (
                      <span className="bg-primary/10 text-primary text-xs rounded px-1.5 py-0.5 mr-2">
                        {t('settings.defaultLang', 'Default')}
                      </span>
                    )}
                    {language.name.english} / {language.name.native}
                  </div>
                </TableCell>
                <TableCell>{language.code}</TableCell>
                <TableCell>
                  <div className="w-full flex items-center gap-2">
                    <Progress 
                      value={language.completeness || 0} 
                      className="h-2 w-20" 
                      aria-label={t('settings.completenessValue', 'Translation completeness: {{value}}%', { value: language.completeness || 0 })}
                      aria-valuenow={language.completeness || 0}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                    <span className="text-xs text-muted-foreground">
                      {language.completeness || 0}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {language.isRTL ? t('settings.rtl', 'RTL') : t('settings.ltr', 'LTR')}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleToggleActive(language.code)}
                    >
                      {language.isActive 
                        ? t('entity.active', 'Active') 
                        : t('entity.inactive', 'Inactive')}
                    </Button>
                    
                    {!language.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleMakeDefault(language.code)}
                        aria-label={t('settings.makeDefaultAriaLabel', 'Make {{language}} the default language', { language: language.name.english })}
                      >
                        <Check className="h-4 w-4 mr-2" aria-hidden="true" />
                        {t('settings.makeDefault', 'Make Default')}
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditLanguage(language)}
                      aria-label={t('settings.editLanguageAriaLabel', 'Edit language: {{language}}', { language: language.name.english })}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">{t('settings.edit', 'Edit')}</span>
                    </Button>
                    
                    {!language.isDefault && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive"
                            aria-label={t('settings.deleteLanguageAriaLabel', 'Delete language: {{language}}', { language: language.name.english })}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">{t('settings.delete', 'Delete')}</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('settings.deleteLanguage', 'Delete Language')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('settings.deleteLanguageConfirmation', 'Are you sure you want to delete this language? This action cannot be undone.')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t('settings.cancel', 'Cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground">
                              {t('settings.delete', 'Delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          <Globe className="h-4 w-4 inline mr-1" />
          {t('settings.languageNote', 'Adding a new language requires uploading translation files for complete functionality.')}
        </p>
      </CardFooter>
    </Card>
  );
}

export default LanguageManagement;