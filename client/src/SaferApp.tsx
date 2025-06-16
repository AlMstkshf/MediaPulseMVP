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
import GlobalSocialPoller from "@/components/shared/GlobalSocialPoller";
import { ThemeProvider } from "@/lib/theme-context";

import { HelmetProvider } from "react-helmet-async";

// Lazy load all page components to improve initial load time and isolate rendering issues
const Dashboard = lazy(() => import("@/pages/dashboard"));
const PersonalizedDashboard = lazy(() => import("@/pages/personalized-dashboard"));
const MediaCenter = lazy(() => import("@/pages/media-center"));
const SocialMedia = lazy(() => import("@/pages/social-media"));
const Monitoring = lazy(() => import("@/pages/monitoring"));
const Reports = lazy(() => import("@/pages/reports"));
const ExcellenceIndicators = lazy(() => import("@/pages/excellence-indicators"));
const ReportingDashboard = lazy(() => import("@/pages/reporting"));
const TutorialsPage = lazy(() => import("@/pages/tutorials"));
const Settings = lazy(() => import("@/pages/settings"));
const Users = lazy(() => import("@/pages/users"));
const Login = lazy(() => import("@/pages/login"));
const EntityMonitoring = lazy(() => import("@/pages/entity-monitoring"));
const EntityTest = lazy(() => import("@/pages/entity-test"));
const PerformanceVisualization = lazy(() => import("@/pages/performance-visualization-page"));
const TestPage = lazy(() => import("@/pages/test-page"));
const SentimentTestPage = lazy(() => import("@/pages/sentiment-test-page"));
const SupportCenter = lazy(() => import("@/pages/support-center"));
const FAQPage = lazy(() => import("@/pages/faq"));
const KnowledgeBase = lazy(() => import("@/pages/knowledge-base"));
const KnowledgeArticle = lazy(() => import("@/pages/knowledge-article"));
const SupportTickets = lazy(() => import("@/pages/support-tickets"));
const SupportTicketDetail = lazy(() => import("@/pages/support-ticket-detail"));
const ContactPage = lazy(() => import("@/pages/contact"));

// Enhanced error handling component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Error caught by error boundary:", event.error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-red-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="mb-4">There was an error loading this component.</p>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setHasError(false)}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="h-8 w-8 animate-spin mr-2" />
    <span>Loading application...</span>
  </div>
);

function SaferApp() {
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
          <HelmetProvider>
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
              {/* Global Social Media updates poller - invisible component */}
              <GlobalSocialPoller />
              
              <ErrorBoundary>
                <Suspense fallback={<LoadingSpinner />}>
                  <main id="main-content" tabIndex={-1} className="outline-none">
                  <Switch>
                    <Route path="/login" component={Login} />
                    <Route path="/" component={Dashboard} />
                    <Route path="/dashboard/personalized" component={PersonalizedDashboard} />
                    <Route path="/media-center" component={MediaCenter} />
                    <Route path="/social-media" component={SocialMedia} />
                    <Route path="/monitoring" component={Monitoring} />
                    <Route path="/reports" component={Reports} />
                    <Route path="/excellence-indicators" component={ExcellenceIndicators} />
                    <Route path="/reporting" component={ReportingDashboard} />
                    <Route path="/reports/performance-visualization" component={PerformanceVisualization} />
                    <Route path="/tutorials" component={TutorialsPage} />
                    <Route path="/settings" component={Settings} />
                    <Route path="/users" component={Users} />
                    <Route path="/entity-monitoring" component={EntityMonitoring} />
                    <Route path="/entity-monitoring/:id" component={EntityMonitoring} />
                    {/* Help & Support System Routes */}
                    <Route path="/support" component={SupportCenter} />
                    <Route path="/help">
                      {() => <Redirect to="/support" />}
                    </Route>
                    <Route path="/support/faq" component={FAQPage} />
                    <Route path="/faq" component={FAQPage} />
                    <Route path="/support/knowledge-base" component={KnowledgeBase} />
                    <Route path="/knowledge-base" component={KnowledgeBase} />
                    <Route path="/support/knowledge-base/:id" component={KnowledgeArticle} />
                    <Route path="/knowledge-base/:id" component={KnowledgeArticle} />
                    <Route path="/support/tickets" component={SupportTickets} />
                    <Route path="/support/tickets/new" component={lazy(() => import("@/pages/tickets/new"))} />
                    <Route path="/support/tickets/:id" component={SupportTicketDetail} />
                    <Route path="/support/contact" component={ContactPage} />
                    <Route path="/contact" component={ContactPage} />
                    {/* Test Routes */}
                    <Route path="/test" component={TestPage} />
                    <Route path="/test-sentiment" component={SentimentTestPage} />
                    <Route path="/entity-test" component={EntityTest} />
                    <Route component={NotFound} />
                  </Switch>
                </main>
              </Suspense>
            </ErrorBoundary>


          </ThemeProvider>
          </HelmetProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default SaferApp;