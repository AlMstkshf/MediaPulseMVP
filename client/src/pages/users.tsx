
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUsers } from "@/hooks/use-users";
import { insertUserSchema } from "@shared/schema";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Key, Languages, Mail, UserCircle, Search, Trash2, PencilLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Extend the insert schema to add validation
const userFormSchema = insertUserSchema.extend({
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function UsersPage() {
  const { t } = useTranslation();
  const { data: users, isLoading, createUser, deleteUser } = useUsers();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
      role: "user",
      language: "ar",
    },
  });
  
  const onSubmit = async (data: UserFormValues) => {
    try {
      const { confirmPassword, ...userData } = data;
      await createUser.mutateAsync(userData);
      toast({
        title: t('users.createSuccess'),
        description: t('users.userCreated', { name: data.fullName }),
      });
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        title: t('users.createError'),
        description: t('users.createErrorMessage'),
        variant: "destructive",
      });
    }
  };
  
  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      editor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      analyst: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      user: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    };
    
    return (
      <Badge className={roleColors[role.toLowerCase()] || roleColors.user}>
        {role}
      </Badge>
    );
  };

  return (
    <PageLayout>
      <section aria-labelledby="users-management-heading">
        <div className="flex justify-between items-center mb-6">
          <h1 id="users-management-heading" className="text-2xl font-bold">{t('users.title')}</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <label htmlFor="user-search" className="sr-only">{t('users.search')}</label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" aria-hidden="true" />
              <Input 
                id="user-search"
                className="pl-10 w-64" 
                placeholder={t('users.search')} 
                aria-label={t('users.search')}
              />
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button aria-label={t('users.addUser')}>
                  <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                  {t('users.addUser')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>{t('users.addNewUser')}</DialogTitle>
                  <DialogDescription>
                    {t('users.fillDetails')}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('users.fullName')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('users.fullNamePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('users.username')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('users.usernamePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('users.email')}</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="user@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('users.role')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('users.selectRole')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="admin">{t('users.roles.admin')}</SelectItem>
                                <SelectItem value="editor">{t('users.roles.editor')}</SelectItem>
                                <SelectItem value="analyst">{t('users.roles.analyst')}</SelectItem>
                                <SelectItem value="user">{t('users.roles.user')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('users.language')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('users.selectLanguage')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ar">{t('users.languages.arabic')}</SelectItem>
                                <SelectItem value="en">{t('users.languages.english')}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('users.password')}</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('users.confirmPassword')}</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createUser.isPending}
                      >
                        {createUser.isPending ? t('common.creating') : t('common.create')}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle id="users-directory-title">{t('users.usersDirectory')}</CardTitle>
            <CardDescription id="users-directory-description">{t('users.manageAccounts')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-10" aria-live="polite" aria-busy="true">
                <div className="w-12 h-12 border-4 border-[#cba344] border-solid rounded-full border-t-transparent animate-spin" role="status">
                  <span className="sr-only">{t('common.loading')}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table aria-labelledby="users-directory-title" aria-describedby="users-directory-description">
                  <caption className="sr-only">{t('users.usersDirectory')}</caption>
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">{t('users.user')}</TableHead>
                      <TableHead scope="col">{t('users.email')}</TableHead>
                      <TableHead scope="col">{t('users.role')}</TableHead>
                      <TableHead scope="col">{t('users.language')}</TableHead>
                      <TableHead scope="col" className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users && users.length > 0 ? (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium" data-label={t('users.user')}>
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3" aria-hidden="true">
                                {user.avatarUrl ? (
                                  <img 
                                    src={user.avatarUrl} 
                                    alt="" 
                                    className="h-10 w-10 rounded-full object-cover" 
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <UserCircle className="h-6 w-6 text-gray-500" aria-hidden="true" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{user.fullName}</div>
                                <div className="text-sm text-gray-500">
                                  <span className="sr-only">{t('users.username')}:</span>
                                  @{user.username}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell data-label={t('users.email')}>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2 text-gray-500" aria-hidden="true" />
                              <span>{user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell data-label={t('users.role')}>
                            {getRoleBadge(user.role)}
                          </TableCell>
                          <TableCell data-label={t('users.language')}>
                            <div className="flex items-center">
                              <Languages className="h-4 w-4 mr-2 text-gray-500" aria-hidden="true" />
                              <span>{user.language === 'ar' ? t('users.languages.arabic') : t('users.languages.english')}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right" data-label={t('common.actions')}>
                            <div className="flex justify-end gap-2" role="group" aria-label={t('users.userActions', { name: user.fullName })}>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                aria-label={t('users.editUserAction', { name: user.fullName })}
                              >
                                <PencilLine className="h-4 w-4" aria-hidden="true" />
                                <span className="sr-only">{t('common.edit')}</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                aria-label={t('users.resetPasswordAction', { name: user.fullName })}
                              >
                                <Key className="h-4 w-4" aria-hidden="true" />
                                <span className="sr-only">{t('users.resetPassword')}</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => setUserToDelete(user.id)}
                                aria-label={t('users.deleteUserAction', { name: user.fullName })}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                <span className="sr-only">{t('common.delete')}</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                          {t('users.noUsersFound')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Delete User Confirmation Dialog */}
        <AlertDialog
          open={userToDelete !== null}
          onOpenChange={(open) => {
            if (!open) setUserToDelete(null);
          }}
        >
          <AlertDialogContent aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-description">
            <AlertDialogHeader>
              <AlertDialogTitle id="delete-dialog-title">{t('users.confirmDelete')}</AlertDialogTitle>
              <AlertDialogDescription id="delete-dialog-description">
                {t('users.confirmDeleteDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel aria-label={t('common.cancelAction')}>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (userToDelete === null) return;
                  
                  try {
                    await deleteUser.mutateAsync(userToDelete);
                    toast({
                      title: t('users.deleteSuccess'),
                      description: t('users.userDeleted'),
                    });
                  } catch (error) {
                    console.error(error);
                    toast({
                      title: t('users.deleteError'),
                      description: t('users.deleteErrorMessage'),
                      variant: "destructive",
                    });
                  }
                }}
                disabled={deleteUser.isPending}
                className="bg-destructive hover:bg-destructive/90"
                aria-label={deleteUser.isPending ? t('common.deletingAction') : t('common.deleteAction')}
              >
                {deleteUser.isPending ? (
                  <>
                    <span className="sr-only">{t('common.processingRequest')}</span>
                    {t('common.deleting')}
                  </>
                ) : (
                  t('common.delete')
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </PageLayout>
  );
}
