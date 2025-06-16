import React, { useState, useEffect, Suspense, lazy } from "react";
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
import { WebSocketProvider } from "@/components/websocket/WebSocketProvider";
import { GlobalDataProvider } from "@/lib/context/GlobalDataContext";
import { ResponsivePreviewProvider } from "@/components/responsive-preview";

import { HelmetProvider } from "react-helmet-async";
import ConnectionStatus from "@/components/dashboard/ConnectionStatus";
import GlobalSocialPoller from "@/components/shared/GlobalSocialPoller";
import { WebSocketConnectionStatus } from "@/components/websocket/WebSocketConnectionStatus";
import { RealtimeNotifications } from "@/components/websocket/RealtimeNotifications";
// Import RTL CSS for Arabic language support
import "./rtl.css";
// Import accessibility styles
import "./styles/accessibility.css";
// Import accessibility components
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { 
  SkipLink,
  AccessibilityButton,
  KeyboardNavigationHelper,
  useScreenReaderAnnouncement
} from "@/components/accessibility";

// Lazy load all page components to improve initial load time and isolate rendering issues
const Dashboard = lazy(() => import("@/pages/dashboard-vertical")); // Now using vertical layout
const DashboardClassic = lazy(() => import("@/pages/dashboard")); // Original dashboard
const PersonalizedDashboard = lazy(() => import("@/pages/personalized-dashboard"));
const MediaCenter = lazy(() => import("@/pages/media-center"));
const SocialMedia = lazy(() => import("@/pages/social-media"));
const SocialPublishing = lazy(() => import("@/pages/social-publishing"));
const Monitoring = lazy(() => import("@/pages/monitoring"));
const Reports = lazy(() => import("@/pages/reports"));
const ExcellenceIndicators = lazy(() => import("@/pages/excellence-indicators"));
const ReportingDashboard = lazy(() => import("@/pages/reporting"));
const TutorialsPage = lazy(() => import("@/pages/tutorials")); //Corrected import for Tutorials
const Settings = lazy(() => import("@/pages/settings"));
const Users = lazy(() => import("@/pages/users"));
const Login = lazy(() => import("@/pages/login"));
const EntityMonitoring = lazy(() => import("@/pages/entity-monitoring"));
const EntityTest = lazy(() => import("@/pages/entity-test"));
const TestEntityDialog = lazy(() => import("@/pages/test-entity-dialog"));
const PerformanceVisualization = lazy(() => import("@/pages/performance-visualization-page"));
const ContextHints = lazy(() => import("@/pages/context-hints"));

const TestPage = lazy(() => import("@/pages/test-page"));
const TestAIPage = lazy(() => import("@/pages/test-ai-page"));
const SentimentTestPage = lazy(() => import("@/pages/sentiment-test-page"));
const NlpTestPage = lazy(() => import("@/pages/nlp-test"));
const MentionsDemoPage = lazy(() => import("@/pages/MentionsDemoPage"));
const DialogDemoPage = lazy(() => import("@/pages/dialog-demo"));
const SupportCenter = lazy(() => import("@/pages/support-center"));
const FAQPage = lazy(() => import("@/pages/faq"));
const KnowledgeBase = lazy(() => import("@/pages/knowledge-base"));
const KnowledgeArticle = lazy(() => import("@/pages/knowledge-article"));
const SupportTickets = lazy(() => import("@/pages/support-tickets"));
const SupportTicketDetail = lazy(() => import("@/pages/support-ticket-detail"));
const ContactPage = lazy(() => import("@/pages/contact"));
const ChatAssistant = lazy(() => import("@/pages/chat-assistant"));
// Test pages
const CookieTestPage = lazy(() => import("@/pages/cookie-test"));
// Legal pages
const TermsOfService = lazy(() => import("@/pages/legal/terms"));
const PrivacyPolicy = lazy(() => import("@/pages/legal/privacy"));
const Disclaimer = lazy(() => import("@/pages/legal/disclaimer"));
const WebSocketTest = lazy(() => import("@/pages/websocket-test"));
const ServerHealth = lazy(() => import("@/pages/server-health"));

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

function App() {
  const { i18n } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { announce, Announcer } = useScreenReaderAnnouncement();

  // Set document direction based on current language with enhanced RTL support
  useEffect(() => {
    const isRTL = i18n.language === 'ar';
    // Set direction attributes on both documentElement and body
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.body.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
    
    // Add or remove RTL classes to allow specific CSS targeting
    if (isRTL) {
      document.documentElement.classList.add('rtl-lang');
      document.body.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl-lang');
      document.body.classList.remove('rtl');
    }
    
    // Announce language change to screen readers
    announce(`Language changed to ${isRTL ? 'Arabic' : 'English'}`, false);
    
    // Log language change for debugging
    console.log(`Language changed to ${i18n.language} (${isRTL ? 'RTL' : 'LTR'} direction)`);
  }, [i18n.language, announce]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WebSocketProvider>
            <GlobalDataProvider>
              <HelmetProvider>
                <ResponsivePreviewProvider>
                  <AccessibilityProvider>
                    <ThemeProvider defaultTheme="system" storageKey="media-pulse-theme">
                      {/* Screen reader announcer for important changes */}
                      <Announcer />
                      
                      {/* Keyboard navigation helper for improved keyboard accessibility */}
                      <KeyboardNavigationHelper />
                      
                      {/* Improved skip link for keyboard and screen reader users */}
                      <SkipLink />

                      <Toaster />
                      
                      {/* Initialize language and add translation fixes */}
                      <React.Suspense fallback={null}>
                        {(() => {
                          const LanguageInitializer = React.lazy(() => 
                            import('./components/i18n/LanguageInitializer')
                          );
                          const DirectTranslationFix = React.lazy(() => 
                            import('./components/i18n/DirectTranslationFix')
                          );
                          return (
                            <>
                              <LanguageInitializer />
                              <DirectTranslationFix />
                            </>
                          );
                        })()}
                      </React.Suspense>
                      
                      <ErrorBoundary>
                        <Suspense fallback={<LoadingSpinner />}>
                          <main id="main-content" tabIndex={-1} className="outline-none">
                            <Switch>
                              <Route path="/login" component={Login} />
                              <Route path="/" component={Dashboard} />
                              <Route path="/dashboard/classic" component={DashboardClassic} />
                              <Route path="/dashboard/personalized" component={PersonalizedDashboard} />
                              <Route path="/media-center" component={MediaCenter} />
                              <Route path="/social-media" component={SocialMedia} />
                              <Route path="/social-publishing" component={SocialPublishing} />
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
                              <Route path="/entity-test" component={EntityTest} />
                              <Route path="/test-entity-dialog" component={TestEntityDialog} />
                              <Route path="/context-hints" component={ContextHints} />

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
                              <Route path="/assistant" component={ChatAssistant} />
                              <Route path="/chat-assistant" component={ChatAssistant} />
                              
                              {/* Testing Routes */}
                              <Route path="/test" component={TestPage} />
                              <Route path="/test-ai" component={TestAIPage} />
                              <Route path="/test-sentiment" component={SentimentTestPage} />
                              <Route path="/test-nlp" component={NlpTestPage} />
                              <Route path="/mentions-demo" component={MentionsDemoPage} />
                              <Route path="/dialog-demo" component={DialogDemoPage} />
                              <Route path="/cookie-test" component={CookieTestPage} />
                              <Route path="/websocket-test" component={WebSocketTest} />
                              <Route path="/server-health" component={ServerHealth} />
                              
                              {/* Legal Pages */}
                              <Route path="/legal/terms" component={TermsOfService} />
                              <Route path="/legal/privacy" component={PrivacyPolicy} />
                              <Route path="/legal/disclaimer" component={Disclaimer} />
                              <Route path="/terms">
                                {() => <Redirect to="/legal/terms" />}
                              </Route>
                              <Route path="/privacy">
                                {() => <Redirect to="/legal/privacy" />}
                              </Route>
                              <Route component={NotFound} />
                            </Switch>
                          </main>
                        </Suspense>
                      </ErrorBoundary>

                      {/* Connection Status */}
                      <ConnectionStatus />
                      
                      {/* WebSocket Connection Status */}
                      <div className="fixed bottom-14 right-4 z-50">
                        <WebSocketConnectionStatus />
                      </div>
                      
                      {/* Global Social Media Polling */}
                      <GlobalSocialPoller />
                      
                      {/* Real-time WebSocket Notifications */}
                      <RealtimeNotifications />
                      
                      {/* Accessibility settings button */}
                      <div className="fixed bottom-4 left-4 z-50">
                        <AccessibilityButton />
                      </div>
                    </ThemeProvider>
                  </AccessibilityProvider>
                </ResponsivePreviewProvider>
              </HelmetProvider>
            </GlobalDataProvider>
          </WebSocketProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;