import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useTranslation } from "react-i18next";
import { AuthProvider } from "@/hooks/use-auth";

// This is a simplified version of the App.tsx without WebSocketProvider
// and with minimal dependencies to help debug core functionality

function SimpleAlt() {
  const { i18n } = useTranslation();
  
  // Set document direction based on current language
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Toaster />
            <main>
              <Switch>
                <Route path="/">
                  {() => (
                    <div className="container mx-auto p-8 max-w-4xl">
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h1 className="text-2xl font-bold mb-4">Media Intelligence Platform</h1>
                        
                        <div className="mb-6">
                          <h2 className="text-xl font-semibold mb-2">Language Test</h2>
                          <div className="flex space-x-4">
                            <button 
                              onClick={() => i18n.changeLanguage('en')}
                              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              English
                            </button>
                            <button 
                              onClick={() => i18n.changeLanguage('ar')}
                              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              العربية
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                          <div className="border rounded-lg p-4 bg-gray-50">
                            <h2 className="text-xl font-semibold mb-2">Translation Test</h2>
                            <ul className="space-y-2">
                              <li><strong>Current Language:</strong> {i18n.language}</li>
                              <li><strong>Direction:</strong> {i18n.language === 'ar' ? 'RTL' : 'LTR'}</li>
                              <li><strong>Translated Title:</strong> {i18n.t('app.title')}</li>
                              <li><strong>Dashboard:</strong> {i18n.t('nav.dashboard')}</li>
                              <li><strong>Settings:</strong> {i18n.t('nav.settings')}</li>
                              <li><strong>Users:</strong> {i18n.t('users.title')}</li>
                            </ul>
                            
                            <div className="mt-4">
                              <h3 className="font-medium mb-2">User Management Translations</h3>
                              <ul className="space-y-1 text-sm">
                                <li><strong>Add User:</strong> {i18n.t('users.addUser')}</li>
                                <li><strong>Edit User:</strong> {i18n.t('users.editUser')}</li>
                                <li><strong>Delete User:</strong> {i18n.t('users.deleteUser')}</li>
                                <li><strong>Full Name:</strong> {i18n.t('users.fullName')}</li>
                                <li><strong>Username:</strong> {i18n.t('users.username')}</li>
                                <li><strong>Email:</strong> {i18n.t('users.email')}</li>
                                <li><strong>Role:</strong> {i18n.t('users.role')}</li>
                              </ul>
                            </div>
                          </div>
                          
                          <div className="border rounded-lg p-4 bg-gray-50">
                            <h2 className="text-xl font-semibold mb-2">Application Status</h2>
                            <ul className="space-y-2">
                              <li className="flex items-center">
                                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                                <span>i18n: Working</span>
                              </li>
                              <li className="flex items-center">
                                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                                <span>Auth Context: Available</span>
                              </li>
                              <li className="flex items-center">
                                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                                <span>Query Client: Initialized</span>
                              </li>
                              <li className="flex items-center">
                                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                                <span>Routing: Working</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Route>
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default SimpleAlt;