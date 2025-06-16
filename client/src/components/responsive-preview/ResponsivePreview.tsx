import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Smartphone, Tablet, Monitor, X, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger, 
  SheetFooter, 
  SheetDescription,
  SheetClose 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Device presets with dimensions
const devicePresets = {
  mobile: [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone XR/11', width: 414, height: 896 },
    { name: 'iPhone 12/13', width: 390, height: 844 },
    { name: 'Pixel 5', width: 393, height: 851 },
    { name: 'Samsung Galaxy S20', width: 360, height: 800 },
  ],
  tablet: [
    { name: 'iPad Mini', width: 768, height: 1024 },
    { name: 'iPad Air', width: 820, height: 1180 },
    { name: 'iPad Pro 11"', width: 834, height: 1194 },
    { name: 'iPad Pro 12.9"', width: 1024, height: 1366 },
    { name: 'Surface Pro', width: 912, height: 1368 },
  ],
  desktop: [
    { name: 'Small Laptop', width: 1280, height: 800 },
    { name: 'Standard Laptop', width: 1440, height: 900 },
    { name: 'Large Desktop', width: 1920, height: 1080 },
    { name: 'QHD Display', width: 2560, height: 1440 },
    { name: '4K Display', width: 3840, height: 2160 },
  ],
  custom: [
    { name: 'Custom', width: 800, height: 600 },
  ]
};

interface ResponsivePreviewProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function ResponsivePreview({ children, defaultOpen = false }: ResponsivePreviewProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [deviceCategory, setDeviceCategory] = useState<'mobile' | 'tablet' | 'desktop' | 'custom'>('desktop');
  const [selectedDevice, setSelectedDevice] = useState(devicePresets.desktop[1].name); // Standard Laptop by default
  const [customWidth, setCustomWidth] = useState(800);
  const [customHeight, setCustomHeight] = useState(600);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [showDevTools, setShowDevTools] = useState(false);
  const [isFixedRatio, setIsFixedRatio] = useState(true);
  
  // Get the width and height based on selected device or custom dimensions
  const getFrameDimensions = () => {
    if (deviceCategory === 'custom') {
      return {
        width: customWidth,
        height: customHeight
      };
    }
    
    const device = devicePresets[deviceCategory].find(d => d.name === selectedDevice);
    if (!device) return { width: 1440, height: 900 }; // Fallback
    
    return orientation === 'landscape' && deviceCategory !== 'desktop'
      ? { width: device.height, height: device.width }
      : { width: device.width, height: device.height };
  };
  
  const frameDimensions = getFrameDimensions();
  
  // Calculate the scale ratio to fit the preview frame
  const calculateScale = () => {
    const containerWidth = window.innerWidth * 0.9;
    const containerHeight = window.innerHeight * 0.8;
    
    const widthRatio = containerWidth / frameDimensions.width;
    const heightRatio = containerHeight / frameDimensions.height;
    
    return Math.min(widthRatio, heightRatio, 1);
  };
  
  const [scale, setScale] = useState(1);
  
  // Update scale when window or frame dimensions change
  useEffect(() => {
    const updateScale = () => {
      setScale(calculateScale());
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [frameDimensions.width, frameDimensions.height]);
  
  // Handle device selection
  const handleDeviceChange = (deviceName: string) => {
    const allDevices = [
      ...devicePresets.mobile,
      ...devicePresets.tablet,
      ...devicePresets.desktop,
    ];
    
    const device = allDevices.find(d => d.name === deviceName);
    if (!device) return;
    
    // Determine which category this device belongs to
    let category: 'mobile' | 'tablet' | 'desktop' | 'custom' = 'custom';
    
    if (devicePresets.mobile.some(d => d.name === deviceName)) {
      category = 'mobile';
    } else if (devicePresets.tablet.some(d => d.name === deviceName)) {
      category = 'tablet';
    } else if (devicePresets.desktop.some(d => d.name === deviceName)) {
      category = 'desktop';
    }
    
    setDeviceCategory(category);
    setSelectedDevice(deviceName);
  };
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 shadow-md bg-background"
        onClick={() => setIsOpen(true)}
      >
        <Smartphone className="h-4 w-4 mr-2" />
        {t('preview.responsivePreview')}
      </Button>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[90vh] p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <SheetTitle className="text-xl">{t('preview.responsivePreview')}</SheetTitle>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {deviceCategory !== 'desktop' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
                      title={t('preview.toggleOrientation')}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant={deviceCategory === 'mobile' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setDeviceCategory('mobile');
                      setSelectedDevice(devicePresets.mobile[0].name);
                    }}
                    title={t('preview.mobileView')}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant={deviceCategory === 'tablet' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setDeviceCategory('tablet');
                      setSelectedDevice(devicePresets.tablet[0].name);
                    }}
                    title={t('preview.tabletView')}
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant={deviceCategory === 'desktop' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setDeviceCategory('desktop');
                      setSelectedDevice(devicePresets.desktop[1].name);
                    }}
                    title={t('preview.desktopView')}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                </div>
                
                <Select value={selectedDevice} onValueChange={handleDeviceChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={t('preview.selectDevice')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{t('preview.mobileDevices')}</SelectLabel>
                      {devicePresets.mobile.map(device => (
                        <SelectItem key={device.name} value={device.name}>
                          {device.name} ({device.width}×{device.height})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>{t('preview.tabletDevices')}</SelectLabel>
                      {devicePresets.tablet.map(device => (
                        <SelectItem key={device.name} value={device.name}>
                          {device.name} ({device.width}×{device.height})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>{t('preview.desktopDevices')}</SelectLabel>
                      {devicePresets.desktop.map(device => (
                        <SelectItem key={device.name} value={device.name}>
                          {device.name} ({device.width}×{device.height})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                
                <SheetClose asChild>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>
            </div>
            <SheetDescription>
              {t('preview.viewCurrentPage')} - {frameDimensions.width} × {frameDimensions.height} px
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900 overflow-auto">
            <div 
              className="bg-white dark:bg-gray-800 shadow-lg transition-all"
              style={{
                width: `${frameDimensions.width * scale}px`,
                height: `${frameDimensions.height * scale}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'center',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: deviceCategory === 'mobile' ? '16px' : deviceCategory === 'tablet' ? '12px' : '4px',
                overflow: 'hidden',
              }}
            >
              {/* Iframe to display the current page */}
              <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                <div style={{ 
                  width: frameDimensions.width, 
                  height: frameDimensions.height, 
                  transform: `scale(${scale})`,
                  transformOrigin: '0 0',
                  overflow: 'auto',
                }}>
                  {children}
                </div>
              </div>
            </div>
          </div>
          
          <SheetFooter className="px-6 py-3 border-t">
            <div className="w-full flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="fixed-ratio">{t('preview.maintainAspectRatio')}</Label>
                  <Switch 
                    id="fixed-ratio"
                    checked={isFixedRatio}
                    onCheckedChange={setIsFixedRatio}
                  />
                </div>
                
                {deviceCategory === 'custom' && (
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="custom-width">{t('preview.width')}</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          id="custom-width"
                          type="number"
                          value={customWidth}
                          onChange={(e) => {
                            const newWidth = parseInt(e.target.value);
                            setCustomWidth(newWidth);
                            if (isFixedRatio) {
                              // Maintain aspect ratio when width changes
                              const ratio = customHeight / customWidth;
                              setCustomHeight(Math.round(newWidth * ratio));
                            }
                          }}
                          className="w-20 p-1 border rounded"
                          min={320}
                          max={3840}
                        />
                        <span>px</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="custom-height">{t('preview.height')}</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          id="custom-height"
                          type="number"
                          value={customHeight}
                          onChange={(e) => {
                            const newHeight = parseInt(e.target.value);
                            setCustomHeight(newHeight);
                            if (isFixedRatio) {
                              // Maintain aspect ratio when height changes
                              const ratio = customWidth / customHeight;
                              setCustomWidth(Math.round(newHeight * ratio));
                            }
                          }}
                          className="w-20 p-1 border rounded"
                          min={320}
                          max={2160}
                        />
                        <span>px</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (deviceCategory === 'custom') {
                      setCustomWidth(800);
                      setCustomHeight(600);
                    } else {
                      setDeviceCategory('desktop');
                      setSelectedDevice(devicePresets.desktop[1].name); // Reset to standard laptop
                      setOrientation('landscape');
                    }
                  }}
                >
                  {t('preview.reset')}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setDeviceCategory('custom');
                    setCustomWidth(frameDimensions.width);
                    setCustomHeight(frameDimensions.height);
                  }}
                >
                  {t('preview.customSize')}
                </Button>
              </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}