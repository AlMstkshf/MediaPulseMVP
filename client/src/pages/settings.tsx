import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/layout/PageLayout";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/lib/theme-context";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageManagement } from "@/components/settings/LanguageManagement";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Languages, 
  Bell, 
  Shield, 
  Key, 
  HelpCircle,
  Save,
  Globe,
  Camera,
  Loader2,
  Check,
  Info,
  AlertCircle,
  ClipboardCopy,
  X,
  Trash,
  Copy,
  Book,
  BookOpen,
  LifeBuoy,
  MessageSquare,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogHeader,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Alert, 
  AlertTitle, 
  AlertDescription 
} from "@/components/ui/alert";

// Types for API Keys and Webhooks
interface ApiKey {
  id: number;
  userId: number;
  keyName: string;
  keyValue: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  allowedIps: string[] | null;
  rateLimitPerMinute: number | null;
}

interface Webhook {
  id: number;
  userId: number;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  createdAt: string;
  lastTriggeredAt: string | null;
  failureCount: number;
}

// This component is used for notifications settings
const NotificationSettings = () => {
  const { t } = useTranslation();
  const { user, updateNotificationPreferences } = useAuth();
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    sms: false,
    digest: true,
    keywords: true,
    sentimentChanges: true,
    newMentions: true,
    reportGeneration: true,
  });
  
  useEffect(() => {
    if (user?.notificationPrefs) {
      try {
        const prefs = user.notificationPrefs as any;
        setPreferences({
          email: prefs.email ?? true,
          push: prefs.push ?? true,
          sms: prefs.sms ?? false,
          digest: prefs.digest ?? true,
          keywords: prefs.keywords ?? true,
          sentimentChanges: prefs.sentimentChanges ?? true,
          newMentions: prefs.newMentions ?? true,
          reportGeneration: prefs.reportGeneration ?? true,
        });
      } catch (error) {
        console.error("Failed to parse notification preferences", error);
      }
    }
  }, [user]);
  
  const savePreferences = async () => {
    setSaving(true);
    try {
      await updateNotificationPreferences(preferences);
    } catch (error) {
      console.error("Failed to update notification preferences", error);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">{t('settings.channels')}</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">{t('settings.emailNotifications')}</Label>
              <p className="text-sm text-gray-500">{t('settings.emailNotificationsDesc')}</p>
            </div>
            <Switch 
              id="email-notifications"
              checked={preferences.email}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, email: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-notifications">{t('settings.pushNotifications')}</Label>
              <p className="text-sm text-gray-500">{t('settings.pushNotificationsDesc')}</p>
            </div>
            <Switch 
              id="push-notifications"
              checked={preferences.push}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, push: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-notifications">{t('settings.smsNotifications')}</Label>
              <p className="text-sm text-gray-500">{t('settings.smsNotificationsDesc')}</p>
            </div>
            <Switch 
              id="sms-notifications"
              checked={preferences.sms}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, sms: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="digest-notifications">{t('settings.digestNotifications')}</Label>
              <p className="text-sm text-gray-500">{t('settings.digestNotificationsDesc')}</p>
            </div>
            <Switch 
              id="digest-notifications"
              checked={preferences.digest}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, digest: checked }))}
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">{t('settings.events')}</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="keyword-alerts">{t('settings.keywordAlerts')}</Label>
              <p className="text-sm text-gray-500">{t('settings.keywordAlertsDesc')}</p>
            </div>
            <Switch 
              id="keyword-alerts"
              checked={preferences.keywords}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, keywords: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sentiment-changes">{t('settings.sentimentChanges')}</Label>
              <p className="text-sm text-gray-500">{t('settings.sentimentChangesDesc')}</p>
            </div>
            <Switch 
              id="sentiment-changes"
              checked={preferences.sentimentChanges}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, sentimentChanges: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="new-mentions">{t('settings.newMentions')}</Label>
              <p className="text-sm text-gray-500">{t('settings.newMentionsDesc')}</p>
            </div>
            <Switch 
              id="new-mentions"
              checked={preferences.newMentions}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, newMentions: checked }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="report-generation">{t('settings.reportGeneration')}</Label>
              <p className="text-sm text-gray-500">{t('settings.reportGenerationDesc')}</p>
            </div>
            <Switch 
              id="report-generation"
              checked={preferences.reportGeneration}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, reportGeneration: checked }))}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          type="button" 
          className="bg-[#cba344] hover:bg-[#b8943e]"
          onClick={savePreferences}
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              {t('settings.saving')}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {t('settings.saveChanges')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// This component shows a custom theme selector
const ThemeToggleSelector = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div 
        className={`border rounded-md p-4 cursor-pointer transition-colors ${theme === "light" ? "bg-[#f9f4e9] border-[#cba344]" : ""}`}
        onClick={() => setTheme("light")}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium">{t('settings.lightTheme')}</span>
          {theme === "light" && <Check className="h-4 w-4 text-[#cba344]" />}
        </div>
        <div className="h-20 bg-white border border-gray-200 rounded-md"></div>
      </div>
      
      <div 
        className={`border rounded-md p-4 cursor-pointer transition-colors ${theme === "dark" ? "bg-[#f9f4e9] border-[#cba344]" : ""}`}
        onClick={() => setTheme("dark")}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium">{t('settings.darkTheme')}</span>
          {theme === "dark" && <Check className="h-4 w-4 text-[#cba344]" />}
        </div>
        <div className="h-20 bg-gray-900 border border-gray-700 rounded-md"></div>
      </div>
      
      <div 
        className={`border rounded-md p-4 cursor-pointer transition-colors ${theme === "system" ? "bg-[#f9f4e9] border-[#cba344]" : ""}`}
        onClick={() => setTheme("system")}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium">{t('settings.systemTheme')}</span>
          {theme === "system" && <Check className="h-4 w-4 text-[#cba344]" />}
        </div>
        <div className="h-20 bg-gradient-to-r from-white to-gray-900 border border-gray-300 rounded-md"></div>
      </div>
    </div>
  );
};

// Two-factor authentication component
const TwoFactorAuthentication = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  
  useEffect(() => {
    setIsEnabled(user?.twoFactorEnabled || false);
  }, [user]);
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor="2fa-toggle">{t('settings.twoFactorAuth')}</Label>
        <p className="text-sm text-gray-500">{t('settings.twoFactorAuthDesc')}</p>
      </div>
      <Switch 
        id="2fa-toggle"
        checked={isEnabled}
        onCheckedChange={setIsEnabled}
      />
    </div>
  );
};

// Login History Dialog
const LoginHistoryDialog = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
  const { t } = useTranslation();
  const [loginHistory, setLoginHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      fetch('/api/users/login-history')
        .then(res => res.json())
        .then(data => {
          setLoginHistory(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch login history', err);
          setIsLoading(false);
        });
    }
  }, [open]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('settings.loginHistory')}</DialogTitle>
          <DialogDescription>
            {t('settings.loginHistoryDesc')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : loginHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('settings.noLoginHistory')}
            </div>
          ) : (
            <div className="space-y-4">
              {loginHistory.map((login: any) => (
                <div key={login.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium flex items-center">
                        <Badge className={login.status === 'success' ? 'bg-green-500' : 'bg-red-500'}>
                          {login.status === 'success' ? t('settings.successful') : t('settings.failed')}
                        </Badge>
                        <span className="ml-2">{new Date(login.loginTime).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {login.ipAddress && <span>{t('settings.ip')}: {login.ipAddress}</span>}
                        {login.location && <span> • {login.location}</span>}
                      </p>
                      <p className="text-sm text-gray-500">
                        {login.userAgent}
                      </p>
                      {login.failureReason && (
                        <p className="text-sm text-red-500 mt-1">
                          {login.failureReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('settings.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, updateProfile, updateNotificationPreferences } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showLoginHistory, setShowLoginHistory] = useState(false);
  const [showApiKeyId, setShowApiKeyId] = useState<number | null>(null);
  const [isNewApiKeyDialogOpen, setIsNewApiKeyDialogOpen] = useState(false);
  const [showNewApiKeyDialog, setShowNewApiKeyDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState<ApiKey | null>(null);
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [newApiKeyExpires, setNewApiKeyExpires] = useState(false);
  const [newApiKeyExpiryDate, setNewApiKeyExpiryDate] = useState(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
  const [isNewWebhookDialogOpen, setIsNewWebhookDialogOpen] = useState(false);
  const [showWebhookId, setShowWebhookId] = useState<number | null>(null);
  const [newWebhookName, setNewWebhookName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([]);
  
  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    document.documentElement.lang = value;
    document.documentElement.dir = value === 'ar' ? 'rtl' : 'ltr';
    
    // Update user language preference
    if (user) {
      updateProfile({ language: value });
    }
  };
  
  // Profile form schema with validation
  const profileFormSchema = z.object({
    fullName: z.string().min(2, t('validation.fullNameMin')),
    username: z.string().min(3, t('validation.usernameMin')),
    email: z.string().email(t('validation.invalidEmail')),
    bio: z.string().optional(),
    avatarUrl: z.string().optional().nullable(),
  });
  
  type ProfileFormValues = z.infer<typeof profileFormSchema>;
  
  // API Keys Query
  const apiKeysQuery = useQuery({
    queryKey: ['/api/api-keys'],
    queryFn: async () => {
      const res = await fetch('/api/api-keys');
      if (!res.ok) throw new Error(t('settings.errorLoadingApiKeys'));
      return res.json();
    },
    onError: (error: Error) => {
      toast({
        title: t('settings.errorTitle'),
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Webhooks Query
  const webhooksQuery = useQuery({
    queryKey: ['/api/webhooks'],
    queryFn: async () => {
      const res = await fetch('/api/webhooks');
      if (!res.ok) throw new Error(t('settings.errorLoadingWebhooks'));
      return res.json();
    },
    onError: (error: Error) => {
      toast({
        title: t('settings.errorTitle'),
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Create API Key Mutation
  const createApiKeyMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/api-keys", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
    },
    onError: (error: Error) => {
      toast({
        title: t('settings.errorTitle'),
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete API Key Mutation
  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/api-keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
      toast({
        title: t('settings.apiKeyDeleted'),
        description: t('settings.apiKeyDeletedDesc'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('settings.errorTitle'),
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Create Webhook Mutation
  const createWebhookMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/webhooks", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      setIsNewWebhookDialogOpen(false);
      setNewWebhookName("");
      setNewWebhookUrl("");
      setNewWebhookEvents([]);
      toast({
        title: t('settings.webhookCreated'),
        description: t('settings.webhookCreatedDesc'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('settings.errorTitle'),
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete Webhook Mutation
  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/webhooks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      toast({
        title: t('settings.webhookDeleted'),
        description: t('settings.webhookDeletedDesc'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('settings.errorTitle'),
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Setup profile form with defaults
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
      avatarUrl: user?.avatarUrl || null,
    }
  });
  
  // Update form values when user data changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        bio: user.bio || "",
        avatarUrl: user.avatarUrl,
      });
    }
  }, [user, profileForm.reset]);
  
  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      await updateProfile(data);
      toast({
        title: t('settings.profileUpdated'),
        description: t('settings.profileUpdatedDesc'),
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: t('settings.updateFailed'),
        description: t('settings.tryAgainLater'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('settings.title')}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 sticky top-6 h-fit">
          <CardHeader className="pb-3">
            <CardTitle>{t('settings.settingsMenu')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col space-y-1 h-full">
              <button 
                onClick={() => setActiveTab("profile")}
                className={`flex items-center text-left px-4 py-2 hover:bg-gray-50 rounded-md transition-colors ${activeTab === 'profile' ? 'bg-gray-100 text-[#cba344] font-medium border-l-4 border-[#cba344] pl-3' : ''}`}
              >
                <User className="h-4 w-4 mr-3" />
                <span>{t('settings.profileTab')}</span>
              </button>
              <button 
                onClick={() => setActiveTab("appearance")}
                className={`flex items-center text-left px-4 py-2 hover:bg-gray-50 rounded-md transition-colors ${activeTab === 'appearance' ? 'bg-gray-100 text-[#cba344] font-medium border-l-4 border-[#cba344] pl-3' : ''}`}
              >
                <Languages className="h-4 w-4 mr-3" />
                <span>{t('settings.appearanceTab')}</span>
              </button>
              <button 
                onClick={() => setActiveTab("notifications")}
                className={`flex items-center text-left px-4 py-2 hover:bg-gray-50 rounded-md transition-colors ${activeTab === 'notifications' ? 'bg-gray-100 text-[#cba344] font-medium border-l-4 border-[#cba344] pl-3' : ''}`}
              >
                <Bell className="h-4 w-4 mr-3" />
                <span>{t('settings.notificationsTab')}</span>
              </button>
              <button 
                onClick={() => setActiveTab("security")}
                className={`flex items-center text-left px-4 py-2 hover:bg-gray-50 rounded-md transition-colors ${activeTab === 'security' ? 'bg-gray-100 text-[#cba344] font-medium border-l-4 border-[#cba344] pl-3' : ''}`}
              >
                <Shield className="h-4 w-4 mr-3" />
                <span>{t('settings.securityTab')}</span>
              </button>
              <button 
                onClick={() => setActiveTab("api")}
                className={`flex items-center text-left px-4 py-2 hover:bg-gray-50 rounded-md transition-colors ${activeTab === 'api' ? 'bg-gray-100 text-[#cba344] font-medium border-l-4 border-[#cba344] pl-3' : ''}`}
              >
                <Key className="h-4 w-4 mr-3" />
                <span>{t('settings.apiTab')}</span>
              </button>
              <button 
                onClick={() => setActiveTab("help")}
                className={`flex items-center text-left px-4 py-2 hover:bg-gray-50 rounded-md transition-colors ${activeTab === 'help' ? 'bg-gray-100 text-[#cba344] font-medium border-l-4 border-[#cba344] pl-3' : ''}`}
              >
                <HelpCircle className="h-4 w-4 mr-3" />
                <span>{t('settings.helpTab')}</span>
              </button>
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-3">
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.profileSettings')}</CardTitle>
                <CardDescription>{t('settings.profileDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-32 flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-2 relative group">
                        {user?.avatarUrl ? (
                          <img 
                            src={user.avatarUrl} 
                            alt={user.fullName} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="h-8 w-8 text-white" />
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setIsUploading(true);
                              // Create a FormData instance
                              const formData = new FormData();
                              formData.append('avatar', e.target.files![0]);
                              
                              // Create a temporary preview URL for immediate feedback
                              const previewUrl = URL.createObjectURL(e.target.files![0]);
                              
                              // Upload the file to the server
                              // Use the API_BASE_URL to ensure the correct endpoint
                              const isReplit = window.location.hostname.includes('replit');
                              const API_BASE_URL = import.meta.env.VITE_API_URL || 
                                (isReplit ? window.location.origin : 'http://localhost:5000');
                                
                              fetch(`${API_BASE_URL}/api/users/avatar`, {
                                method: 'POST',
                                body: formData,
                                credentials: 'include'
                              })
                              .then(response => {
                                if (!response.ok) throw new Error('Upload failed');
                                return response.json();
                              })
                              .then(data => {
                                // Use the server-provided URL or fallback to the preview URL
                                const avatarUrl = data.avatarUrl || previewUrl;
                                profileForm.setValue('avatarUrl', avatarUrl);
                                
                                setIsUploading(false);
                                toast({
                                  title: t('settings.photoUploaded'),
                                  description: t('settings.photoUpdatedDesc')
                                });
                              })
                              .catch(error => {
                                console.error('Avatar upload error:', error);
                                // Still use the preview URL for the UI
                                profileForm.setValue('avatarUrl', previewUrl);
                                
                                setIsUploading(false);
                                toast({
                                  title: t('settings.photoUploadError'),
                                  description: t('settings.photoUploadErrorDesc'),
                                  variant: 'destructive'
                                });
                              });
                            }
                          }}
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        disabled={isUploading}
                        onClick={() => {
                          // Create a reference to store the input element
                          const inputRef = document.querySelector('input[type="file"]');
                          // Type check and safely call click()
                          if (inputRef && 'click' in inputRef) {
                            (inputRef as HTMLElement).click();
                          }
                        }}
                      >
                        {isUploading ? (
                          <span className="flex items-center">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t('settings.uploading')}
                          </span>
                        ) : (
                          t('settings.changePhoto')
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName">{t('settings.fullName')}</Label>
                          <Input 
                            id="fullName" 
                            {...profileForm.register("fullName")} 
                          />
                          {profileForm.formState.errors.fullName && (
                            <p className="text-sm text-red-500 mt-1">
                              {profileForm.formState.errors.fullName.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="username">{t('settings.username')}</Label>
                          <Input 
                            id="username" 
                            {...profileForm.register("username")} 
                          />
                          {profileForm.formState.errors.username && (
                            <p className="text-sm text-red-500 mt-1">
                              {profileForm.formState.errors.username.message}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="email">{t('settings.email')}</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          {...profileForm.register("email")} 
                        />
                        {profileForm.formState.errors.email && (
                          <p className="text-sm text-red-500 mt-1">
                            {profileForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="role">{t('settings.role')}</Label>
                        <div className="flex items-center mt-1">
                          <Badge className="bg-[#cba344]">
                            {user?.role ? t(`common.${user.role.toLowerCase()}`, user.role) : ""}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="bio">{t('settings.bio')}</Label>
                        <Textarea 
                          id="bio" 
                          placeholder={t('settings.bioPlaceholder')} 
                          className="h-24" 
                          {...profileForm.register("bio")} 
                        />
                        {profileForm.formState.errors.bio && (
                          <p className="text-sm text-red-500 mt-1">
                            {profileForm.formState.errors.bio.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button 
                      type="submit" 
                      className="bg-[#cba344] hover:bg-[#b8943e]"
                      disabled={isLoading || profileForm.formState.isSubmitting}
                    >
                      {(isLoading || profileForm.formState.isSubmitting) ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          {t('settings.saving')}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {t('settings.saveChanges')}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          
          {activeTab === "appearance" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.appearanceSettings')}</CardTitle>
                  <CardDescription>{t('settings.appearanceDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="language">{t('settings.language')}</Label>
                    <Select defaultValue={i18n.language} onValueChange={handleLanguageChange} name="language-select">
                      <SelectTrigger className="w-full md:w-80 mt-1" id="language-select">
                        <SelectValue placeholder={t('settings.selectLanguage')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">{t('common.arabic')}</SelectItem>
                        <SelectItem value="en">{t('common.english')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>{t('settings.theme')}</Label>
                    <div className="mt-2">
                      <ThemeToggleSelector />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="text-direction">{t('settings.textDirection')}</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer bg-[#f9f4e9]">
                        <input 
                          type="radio" 
                          id="direction-rtl" 
                          name="text-direction" 
                          value="rtl" 
                          className="hidden" 
                          defaultChecked 
                        />
                        <label htmlFor="direction-rtl" className="flex items-center space-x-2 w-full cursor-pointer">
                          <div className="w-4 h-4 rounded-full border-2 border-[#cba344] flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-[#cba344]"></div>
                          </div>
                          <span>{t('settings.rtl')}</span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer">
                        <input 
                          type="radio" 
                          id="direction-ltr" 
                          name="text-direction" 
                          value="ltr" 
                          className="hidden" 
                        />
                        <label htmlFor="direction-ltr" className="flex items-center space-x-2 w-full cursor-pointer">
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                          <span>{t('settings.ltr')}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button className="bg-[#cba344] hover:bg-[#b8943e]">
                    <Save className="h-4 w-4 mr-2" />
                    {t('settings.saveChanges')}
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Language Management Component */}
              <LanguageManagement />
            </>
          )}
          
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.notificationSettings')}</CardTitle>
                <CardDescription>{t('settings.notificationDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationSettings />
              </CardContent>
            </Card>
          )}
          
          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.securitySettings')}</CardTitle>
                <CardDescription>{t('settings.securityDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">{t('settings.changePassword')}</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">{t('settings.currentPassword')}</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="new-password">{t('settings.newPassword')}</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">{t('settings.confirmPassword')}</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">{t('settings.loginSecurity')}</h3>
                  <div className="space-y-3">
                    <TwoFactorAuthentication />
                    <div className="flex items-center justify-between">
                      <Label htmlFor="session-timeout">{t('settings.sessionTimeout')}</Label>
                      <Switch id="session-timeout" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-history">{t('settings.loginHistory')}</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowLoginHistory(true)}
                      >
                        {t('settings.view')}
                      </Button>
                    </div>
                  </div>
                  
                  <LoginHistoryDialog 
                    open={showLoginHistory} 
                    onOpenChange={setShowLoginHistory} 
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button className="bg-[#cba344] hover:bg-[#b8943e]">
                  <Save className="h-4 w-4 mr-2" />
                  {t('settings.saveChanges')}
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {activeTab === "api" && (
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.apiSettings')}</CardTitle>
                <CardDescription>{t('settings.apiDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">{t('settings.apiKeys')}</h3>
                  <div className="space-y-4">
                    {apiKeysQuery.isLoading ? (
                      <div className="p-4 border rounded-md flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : apiKeysQuery.isError ? (
                      <div className="p-4 border rounded-md text-center text-red-500">
                        {t('settings.errorLoadingApiKeys')}
                      </div>
                    ) : apiKeysQuery.data?.length === 0 ? (
                      <div className="p-4 border rounded-md text-center text-gray-500">
                        {t('settings.noApiKeys')}
                      </div>
                    ) : (
                      apiKeysQuery.data?.map((apiKey: ApiKey) => (
                        <div key={apiKey.id} className="p-4 border rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{apiKey.keyName}</h4>
                              <p className="text-sm text-gray-500">
                                {t('settings.created')}: {new Date(apiKey.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={apiKey.isActive ? "bg-green-500" : "bg-gray-500"}>
                              {apiKey.isActive ? t('settings.active') : t('settings.inactive')}
                            </Badge>
                          </div>
                          <div className="flex items-center mt-2">
                            <Input 
                              type={showApiKeyId === apiKey.id ? "text" : "password"} 
                              value={apiKey.keyValue} 
                              readOnly 
                              className="font-mono"
                            />
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="ml-2"
                              onClick={() => setShowApiKeyId(showApiKeyId === apiKey.id ? null : apiKey.id)}
                            >
                              {showApiKeyId === apiKey.id ? t('settings.hide') : t('settings.view')}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="ml-2"
                              onClick={() => {
                                if (window.confirm(t('settings.confirmDeleteApiKey'))) {
                                  deleteApiKeyMutation.mutate(apiKey.id);
                                }
                              }}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          {apiKey.expiresAt && (
                            <p className="text-sm text-gray-500 mt-2">
                              {t('settings.expires')}: {new Date(apiKey.expiresAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                    
                    <Dialog open={isNewApiKeyDialogOpen} onOpenChange={setIsNewApiKeyDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => setIsNewApiKeyDialogOpen(true)}>
                          {t('settings.generateNewKey')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('settings.newApiKey')}</DialogTitle>
                          <DialogDescription>
                            {t('settings.newApiKeyDescription')}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          if (newApiKeyName.trim() === '') return;
                          
                          createApiKeyMutation.mutate({
                            keyName: newApiKeyName,
                            expiresAt: newApiKeyExpires ? newApiKeyExpiryDate.toISOString() : undefined,
                            rateLimitPerMinute: 60,
                          }, {
                            onSuccess: (data: ApiKey) => {
                              setNewApiKey(data);
                              setNewApiKeyName('');
                              setNewApiKeyExpires(false);
                              setNewApiKeyExpiryDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
                              
                              // Keep dialog open to show the new key
                              setShowNewApiKeyDialog(true);
                            }
                          });
                        }}>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="api-key-name">{t('settings.keyName')}</Label>
                              <Input 
                                id="api-key-name" 
                                value={newApiKeyName}
                                onChange={(e) => setNewApiKeyName(e.target.value)}
                                placeholder={t('settings.keyNamePlaceholder')}
                              />
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="api-key-expires" 
                                checked={newApiKeyExpires}
                                onCheckedChange={(checked) => setNewApiKeyExpires(checked === true)}
                              />
                              <Label htmlFor="api-key-expires">{t('settings.keyExpires')}</Label>
                            </div>
                            
                            {newApiKeyExpires && (
                              <div className="space-y-2">
                                <Label htmlFor="api-key-expiry">{t('settings.expiryDate')}</Label>
                                <Input 
                                  id="api-key-expiry" 
                                  type="date"
                                  value={newApiKeyExpiryDate.toISOString().split('T')[0]}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      setNewApiKeyExpiryDate(new Date(e.target.value));
                                    }
                                  }}
                                  min={new Date().toISOString().split('T')[0]}
                                />
                              </div>
                            )}
                          </div>
                          
                          <DialogFooter>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setIsNewApiKeyDialogOpen(false);
                                setNewApiKeyName('');
                                setNewApiKeyExpires(false);
                              }}
                            >
                              {t('settings.cancel')}
                            </Button>
                            <Button 
                              type="submit" 
                              className="bg-[#cba344] hover:bg-[#b8943e]"
                              disabled={createApiKeyMutation.isPending || newApiKeyName.trim() === ''}
                            >
                              {createApiKeyMutation.isPending ? t('settings.generating') : t('settings.generateKey')}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog open={showNewApiKeyDialog} onOpenChange={setShowNewApiKeyDialog}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('settings.apiKeyGenerated')}</DialogTitle>
                          <DialogDescription>
                            {t('settings.apiKeyGeneratedDesc')}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {newApiKey && (
                          <div className="space-y-4 py-2">
                            <Alert className="bg-yellow-50">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>{t('settings.important')}</AlertTitle>
                              <AlertDescription>
                                {t('settings.apiKeyWarning')}
                              </AlertDescription>
                            </Alert>
                            
                            <div>
                              <Label>{t('settings.keyName')}</Label>
                              <p className="text-sm font-medium">{newApiKey.keyName}</p>
                            </div>
                            
                            <div>
                              <Label>{t('settings.apiKey')}</Label>
                              <div className="flex mt-1">
                                <Input 
                                  value={newApiKey.keyValue} 
                                  readOnly 
                                  className="font-mono"
                                />
                                <Button 
                                  variant="outline" 
                                  className="ml-2"
                                  onClick={() => {
                                    navigator.clipboard.writeText(newApiKey.keyValue);
                                    toast({
                                      description: t('settings.copiedToClipboard'),
                                    });
                                  }}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {newApiKey.expiresAt && (
                              <div>
                                <Label>{t('settings.expires')}</Label>
                                <p className="text-sm">{new Date(newApiKey.expiresAt).toLocaleDateString()}</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <DialogFooter>
                          <Button 
                            onClick={() => {
                              setShowNewApiKeyDialog(false);
                              setNewApiKey(null);
                            }}
                          >
                            {t('settings.close')}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">{t('settings.webhooks')}</h3>
                  <div className="space-y-4">
                    {webhooksQuery.isLoading ? (
                      <div className="p-4 border rounded-md flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : webhooksQuery.isError ? (
                      <div className="p-4 border rounded-md text-center text-red-500">
                        {t('settings.errorLoadingWebhooks')}
                      </div>
                    ) : webhooksQuery.data?.length === 0 ? (
                      <div className="p-4 border rounded-md text-center text-gray-500">
                        {t('settings.noWebhooks')}
                      </div>
                    ) : (
                      webhooksQuery.data?.map((webhook: Webhook) => (
                        <div key={webhook.id} className="p-4 border rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{webhook.name}</h4>
                              <p className="text-sm text-gray-500">
                                {t('settings.url')}: {webhook.url}
                              </p>
                            </div>
                            <Badge className={webhook.isActive ? "bg-green-500" : "bg-gray-500"}>
                              {webhook.isActive ? t('settings.active') : t('settings.inactive')}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-2 mb-2">
                              {webhook.events.map((event) => (
                                <Badge key={event} variant="outline">{event}</Badge>
                              ))}
                            </div>
                            <div className="flex items-center mt-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="ml-auto"
                                onClick={() => {
                                  if (window.confirm(t('settings.confirmDeleteWebhook'))) {
                                    deleteWebhookMutation.mutate(webhook.id);
                                  }
                                }}
                              >
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    
                    <Dialog open={isNewWebhookDialogOpen} onOpenChange={setIsNewWebhookDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => setIsNewWebhookDialogOpen(true)}>
                          {t('settings.addWebhook')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('settings.newWebhook')}</DialogTitle>
                          <DialogDescription>
                            {t('settings.newWebhookDescription')}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          if (newWebhookName.trim() === '' || newWebhookUrl.trim() === '' || newWebhookEvents.length === 0) 
                            return;
                            
                          createWebhookMutation.mutate({
                            name: newWebhookName,
                            url: newWebhookUrl,
                            events: newWebhookEvents,
                            isActive: true
                          });
                        }}>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="webhook-name">{t('settings.webhookName')}</Label>
                              <Input 
                                id="webhook-name" 
                                value={newWebhookName}
                                onChange={(e) => setNewWebhookName(e.target.value)}
                                placeholder={t('settings.webhookNamePlaceholder')}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="webhook-url">{t('settings.webhookUrl')}</Label>
                              <Input 
                                id="webhook-url" 
                                value={newWebhookUrl}
                                onChange={(e) => setNewWebhookUrl(e.target.value)}
                                placeholder={t('settings.webhookUrlPlaceholder')}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>{t('settings.webhookEvents')}</Label>
                              <div className="space-y-2">
                                {['keyword_alert', 'sentiment_change', 'new_mention', 'report_generated'].map((event) => (
                                  <div key={event} className="flex items-center space-x-2">
                                    <Checkbox 
                                      id={`event-${event}`} 
                                      checked={newWebhookEvents.includes(event)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setNewWebhookEvents([...newWebhookEvents, event]);
                                        } else {
                                          setNewWebhookEvents(newWebhookEvents.filter(e => e !== event));
                                        }
                                      }}
                                    />
                                    <Label htmlFor={`event-${event}`}>{t(`settings.event_${event}`)}</Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setIsNewWebhookDialogOpen(false);
                                setNewWebhookName('');
                                setNewWebhookUrl('');
                                setNewWebhookEvents([]);
                              }}
                            >
                              {t('settings.cancel')}
                            </Button>
                            <Button 
                              type="submit" 
                              className="bg-[#cba344] hover:bg-[#b8943e]"
                              disabled={
                                createWebhookMutation.isPending || 
                                newWebhookName.trim() === '' || 
                                newWebhookUrl.trim() === '' || 
                                newWebhookEvents.length === 0
                              }
                            >
                              {createWebhookMutation.isPending ? t('settings.creating') : t('settings.createWebhook')}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeTab === "help" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.helpSupport')}</CardTitle>
                  <CardDescription>{t('settings.helpDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">{t('settings.documentation')}</h3>
                    <p className="text-sm text-gray-500 mb-3">{t('settings.documentationDesc')}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Link href="/knowledge-base">
                        <Button variant="outline" className="w-full justify-start">
                          <Book className="h-4 w-4 mr-2" />
                          {t('settings.knowledgeBase')}
                        </Button>
                      </Link>
                      <Link href="/tutorials">
                        <Button variant="outline" className="w-full justify-start">
                          <BookOpen className="h-4 w-4 mr-2" />
                          {t('settings.tutorials')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">{t('settings.support')}</h3>
                    <p className="text-sm text-gray-500 mb-3">{t('settings.supportDesc')}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Link href="/support-center">
                        <Button variant="outline" className="w-full justify-start">
                          <LifeBuoy className="h-4 w-4 mr-2" />
                          {t('settings.supportCenter')}
                        </Button>
                      </Link>
                      <Link href="/contact">
                        <Button variant="outline" className="w-full justify-start">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {t('settings.contactSupport')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">{t('settings.faq')}</h3>
                    <p className="text-sm text-gray-500 mb-3">{t('settings.faqDesc')}</p>
                    <div className="space-y-2">
                      <Link href="/faq">
                        <Button variant="outline" className="w-full justify-start">
                          <HelpCircle className="h-4 w-4 mr-2" />
                          {t('settings.viewAllFaqs')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.ticketSystem')}</CardTitle>
                  <CardDescription>{t('settings.ticketDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">{t('settings.openTicket')}</h3>
                      <p className="text-sm text-gray-500 mb-3">{t('settings.openTicketDesc')}</p>
                      <Link href="/tickets/new">
                        <Button className="bg-[#cba344] hover:bg-[#b8943e]">
                          <Plus className="h-4 w-4 mr-2" />
                          {t('settings.createTicket')}
                        </Button>
                      </Link>
                    </div>
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">{t('settings.ticketStatus')}</h3>
                      <p className="text-sm text-gray-500 mb-3">{t('settings.ticketStatusDesc')}</p>
                      <Link href="/tickets">
                        <Button variant="outline">
                          <Check className="h-4 w-4 mr-2" />
                          {t('settings.viewTickets')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Settings;