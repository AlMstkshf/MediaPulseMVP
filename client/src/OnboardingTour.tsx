import React, { useState, useEffect } from 'react';

interface TourStep {
  id: number;
  target: string; // CSS selector for the element to highlight
  title: string;
  content: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  
  // Define the tour steps
  const tourSteps: TourStep[] = [
    {
      id: 1,
      target: '[data-tour="header"]',
      title: 'Welcome to Media Intelligence Platform',
      content: 'This powerful platform helps you monitor social media and analyze content. Let\'s take a quick tour!',
      position: 'bottom'
    },
    {
      id: 2,
      target: '[data-tour="api-test"]',
      title: 'API Connection',
      content: 'You can test your connection to our backend services using this button.',
      position: 'right'
    },
    {
      id: 3,
      target: '[data-tour="quick-questions"]',
      title: 'Quick Questions',
      content: 'Click these buttons to quickly get information about common topics.',
      position: 'top'
    }
  ];
  
  // Find target element and calculate tooltip position
  useEffect(() => {
    if (isOpen && tourSteps[currentStep]) {
      const target = document.querySelector(tourSteps[currentStep].target) as HTMLElement;
      if (target) {
        setTargetElement(target);
        
        const rect = target.getBoundingClientRect();
        const position = tourSteps[currentStep].position;
        
        let top = 0;
        let left = 0;
        
        switch (position) {
          case 'top':
            top = rect.top - 10 - 120; // Height of tooltip
            left = rect.left + rect.width / 2 - 150; // Half the width of tooltip
            break;
          case 'right':
            top = rect.top + rect.height / 2 - 60;
            left = rect.right + 10;
            break;
          case 'bottom':
            top = rect.bottom + 10;
            left = rect.left + rect.width / 2 - 150;
            break;
          case 'left':
            top = rect.top + rect.height / 2 - 60;
            left = rect.left - 10 - 300; // Width of tooltip
            break;
        }
        
        // Adjust if tooltip would go off screen
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        if (left < 10) left = 10;
        if (left + 300 > windowWidth - 10) left = windowWidth - 310;
        if (top < 10) top = 10;
        if (top + 120 > windowHeight - 10) top = windowHeight - 130;
        
        setTooltipPosition({ top, left });
        
        // Highlight the target element
        target.style.position = 'relative';
        target.style.zIndex = '1000';
        target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)';
        target.style.borderRadius = '5px';
        
        // Add semi-transparent overlay to the rest of the page
        const overlay = document.createElement('div');
        overlay.id = 'tour-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '999';
        document.body.appendChild(overlay);
        
        // Create a "hole" in the overlay for the target element
        const holeLeft = rect.left - 8;
        const holeTop = rect.top - 8;
        const holeWidth = rect.width + 16;
        const holeHeight = rect.height + 16;
        overlay.style.boxShadow = `0 0 0 9999px rgba(0, 0, 0, 0.5), inset ${holeLeft}px ${holeTop}px 0 0 rgba(0, 0, 0, 0.5), inset ${-windowWidth + holeLeft + holeWidth}px ${holeTop}px 0 0 rgba(0, 0, 0, 0.5), inset ${holeLeft}px ${-windowHeight + holeTop + holeHeight}px 0 0 rgba(0, 0, 0, 0.5), inset ${holeLeft}px ${-holeTop - holeHeight}px 0 0 rgba(0, 0, 0, 0.5)`;
        
        return () => {
          // Clean up
          if (target) {
            target.style.boxShadow = '';
            target.style.zIndex = '';
          }
          const existingOverlay = document.getElementById('tour-overlay');
          if (existingOverlay) {
            document.body.removeChild(existingOverlay);
          }
        };
      }
    }
  }, [isOpen, currentStep, tourSteps]);
  
  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleComplete = () => {
    onComplete();
    onClose();
    // Save to localStorage that the tour has been completed
    localStorage.setItem('onboardingTourCompleted', 'true');
  };
  
  const handleSkip = () => {
    onClose();
    // Still mark as completed even if skipped
    localStorage.setItem('onboardingTourCompleted', 'true');
  };
  
  if (!isOpen || !tourSteps[currentStep]) {
    return null;
  }
  
  const { title, content } = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;
  
  return (
    <div 
      style={{
        position: 'absolute',
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        width: '300px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '16px',
        zIndex: 1001,
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>Step {currentStep + 1} of {tourSteps.length}</span>
        <button 
          onClick={handleSkip} 
          style={{ 
            backgroundColor: 'transparent', 
            border: 'none', 
            cursor: 'pointer',
            fontSize: '18px',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%'
          }}
        >
          ×
        </button>
      </div>
      
      <h3 style={{ 
        margin: '0 0 8px 0', 
        fontSize: '18px', 
        fontWeight: 'bold',
        color: '#1e40af'
      }}>
        {title}
      </h3>
      
      <p style={{ 
        margin: '0 0 16px 0', 
        fontSize: '14px',
        lineHeight: 1.5,
        color: '#374151'
      }}>
        {content}
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          {!isFirstStep && (
            <button 
              onClick={handlePrev}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '14px',
                cursor: 'pointer',
                color: '#4b5563'
              }}
            >
              Previous
            </button>
          )}
        </div>
        
        <div>
          <button 
            onClick={handleNext}
            style={{
              backgroundColor: '#2563eb',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '14px',
              cursor: 'pointer',
              color: 'white',
              marginLeft: '8px'
            }}
          >
            {isLastStep ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;