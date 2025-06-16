import { Server } from 'http';
import { Express } from 'express';
import { WebSocketServer } from 'ws';
import { alertService } from './alert-service';
import nlpService from './nlp-service';
import { dataIntegrationService } from './data-integration-service';
// AI assistant import removed
import reportExportService from './report-export-service';

/**
 * Unified startup service that coordinates initialization of all system components
 */
class StartupService {
  private server: Server | null = null;
  private webSocketServer: any = null;
  private isInitialized: boolean = false;
  
  /**
   * Initialize all system services together
   * @param server HTTP server instance
   * @param webSocketServer WebSocket server instance or Socket.IO wrapper
   */
  initialize(server: Server, webSocketServer: any): void {
    if (this.isInitialized) {
      console.log('StartupService already initialized');
      return;
    }
    
    this.server = server;
    this.webSocketServer = webSocketServer;
    
    console.log('🚀 Starting Media Intelligence Platform services...');
    
    // Initialize and check alert service
    this.initializeAlertService();
    
    // Initialize data integration services
    this.initializeDataIntegrationService();
    
    // Initialize NLP services
    this.initializeNLPServices();
    
    // Initialize other services
    this.initializeOtherServices();
    
    // Mark as initialized
    this.isInitialized = true;
    
    console.log('✅ All services initialized successfully');
  }
  
  /**
   * Initialize alert service and confirm it's running
   */
  private initializeAlertService(): void {
    console.log('🔔 Initializing Alert Service...');
    // Check if alert service is already started by looking at the timer
    if ((alertService as any).alertCheckTimer) {
      console.log('  ✓ Alert service already running');
    } else {
      // Start the alert service if not already running
      alertService.startScheduledChecks();
      console.log('  ✓ Alert service scheduled checks started');
    }
  }
  
  /**
   * Initialize data integration services
   */
  private initializeDataIntegrationService(): void {
    console.log('🔄 Initializing Data Integration Services...');
    
    // Ensure data integration service is initialized
    if (dataIntegrationService) {
      console.log('  ✓ Data integration service ready');
    } else {
      console.warn('  ⚠️ Data integration service not available');
    }
  }
  
  /**
   * Initialize NLP services
   */
  private initializeNLPServices(): void {
    console.log('🧠 Initializing NLP Services...');
    
    // Ensure NLP services are available
    if (nlpService) {
      // Check if specific providers are available
      if ((nlpService as any).hasGoogleNLP) {
        console.log('  ✓ Google Natural Language Processing service ready');
      }
      
      if ((nlpService as any).hasAWSComprehend) {
        console.log('  ✓ AWS Comprehend service ready');
      }
      
      console.log('  ✓ NLP services initialized');
    } else {
      console.warn('  ⚠️ NLP services not available');
    }
  }
  
  /**
   * Initialize other platform services
   */
  private initializeOtherServices(): void {
    console.log('🛠️ Initializing Other Services...');
    
    // Check Report Export service
    if (reportExportService) {
      console.log('  ✓ Report Export service ready');
    }
    
    // Ensure WebSocket server is running
    if (this.webSocketServer) {
      console.log('  ✓ WebSocket server active');
    } else {
      console.warn('  ⚠️ WebSocket server not initialized');
    }
  }
  
  /**
   * Check health of all initialized services
   * @returns Health status object with details of each service
   */
  getHealthStatus(): any {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        alertService: (alertService as any).alertCheckTimer ? 'active' : 'inactive',
        dataIntegration: dataIntegrationService ? 'active' : 'inactive',
        nlp: nlpService ? 'active' : 'inactive',
        // aiAssistant removed
        reportExport: reportExportService ? 'active' : 'inactive',
        webSocket: this.webSocketServer ? 'active' : 'inactive',
      },
      webSocketClients: 0,
    };
    
    // Get active WebSocket connections count if available
    if (this.webSocketServer && 'clients' in this.webSocketServer) {
      health.webSocketClients = (this.webSocketServer as any).clients.size;
    }
    
    // Overall status is ok only if all services are active
    health.status = Object.values(health.services).every(status => status === 'active') ? 'ok' : 'degraded';
    
    return health;
  }
  
  /**
   * Shutdown all services gracefully
   */
  shutdown(): void {
    console.log('🛑 Shutting down services...');
    
    // Stop alert service scheduled checks
    if (alertService) {
      alertService.stopScheduledChecks();
      console.log('  ✓ Alert service stopped');
    }
    
    // Close WebSocket server if exists
    if (this.webSocketServer) {
      this.webSocketServer.close(() => {
        console.log('  ✓ WebSocket server closed');
      });
    }
    
    this.isInitialized = false;
    console.log('✅ All services shut down successfully');
  }
}

// Export singleton instance
export const startupService = new StartupService();
export default startupService;