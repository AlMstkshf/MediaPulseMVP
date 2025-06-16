import { useState, useEffect, Suspense, lazy } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import { useTranslation } from "react-i18next";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/lib/theme-context";

// Lazy load all page components to improve initial load time and isolate rendering issues
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Login = lazy(() => import("@/pages/login"));
const Users = lazy(() => import("@/pages/users"));

// This is a safer version of App.tsx without WebSocketProvider to avoid connection issues
// We'll gradually add complexity back in once the base functionality is working

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="h-8 w-8 animate-spin mr-2" />
    <span>Loading application...</span>
  </div>
);

// Error boundary component
const ErrorFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-red-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <p className="mb-4">There was an error loading this component.</p>
      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={() => window.location.reload()}
      >
        Try Again
      </button>
    </div>
  </div>
);

function EnhancedApp() {
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
          <ThemeProvider defaultTheme="system" storageKey="media-intelligence-theme">
            {/* Skip link for keyboard and screen reader users */}
            <a 
              href="#main-content" 
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:border-2 focus:border-blue-600 focus:rounded-md focus:outline-none"
              aria-label="Skip to main content"
            >
              Skip to main content
            </a>
            <Toaster />
            <Suspense fallback={<LoadingSpinner />}>
              <main id="main-content" tabIndex={-1} className="outline-none">
                <Switch>
                  <Route path="/login" component={Login} />
                  <Route path="/" component={Dashboard} />
                  <Route path="/users" component={Users} />
                  <Route component={NotFound} />
                </Switch>
              </main>
            </Suspense>
          </ThemeProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default EnhancedApp;