import React, { useState, useEffect, Suspense } from 'react';
import ReactGridLayout, { Layout, Responsive, WidthProvider } from 'react-grid-layout';
import { WidgetConfig, DashboardLayout, GridPosition } from './types';
import DashboardWidget from './DashboardWidget';
import { Loader2 } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface WidgetGridProps {
  widgets: WidgetConfig[];
  layout: DashboardLayout;
  isEditing: boolean;
  onLayoutChange: (layout: DashboardLayout) => void;
  onRemoveWidget: (id: string) => void;
  onWidgetSettingsChange: (id: string, settings: any) => void;
}

const WidgetGrid: React.FC<WidgetGridProps> = ({
  widgets,
  layout,
  isEditing,
  onLayoutChange,
  onRemoveWidget,
  onWidgetSettingsChange
}) => {
  const [currentLayout, setCurrentLayout] = useState<Layout[]>([]);
  
  // Convert layout object to array format for react-grid-layout
  useEffect(() => {
    const layoutArray = Object.entries(layout).map(([id, pos]) => ({
      ...pos,
      i: id,
      isDraggable: isEditing,
      isResizable: isEditing
    }));
    
    // Add any new widgets not in layout
    widgets.forEach(widget => {
      if (!layout[widget.id]) {
        layoutArray.push(createDefaultGridItem(widget.id, widget.minW, widget.minH));
      }
    });
    
    // Filter out any layout items for widgets that no longer exist
    const filteredLayout = layoutArray.filter(item => 
      widgets.some(w => w.id === item.i)
    );
    
    setCurrentLayout(filteredLayout);
  }, [widgets, layout, isEditing]);

  const createDefaultGridItem = (id: string, minW = 3, minH = 2): GridPosition => {
    // Find the first available position
    const taken = currentLayout.map(pos => ({ x: pos.x, y: pos.y, w: pos.w, h: pos.h }));
    
    // Start at the top, find first free row
    let y = 0;
    let placed = false;
    let x = 0;
    const cols = 12; // Total grid columns
    
    while (!placed) {
      let rowTaken = false;
      
      for (let i = 0; i < taken.length; i++) {
        if (taken[i].y === y) {
          rowTaken = true;
          x = Math.max(x, taken[i].x + taken[i].w);
        }
      }
      
      if (!rowTaken || x + minW <= cols) {
        placed = true;
      } else {
        y++;
        x = 0;
      }
    }
    
    return {
      i: id,
      x,
      y,
      w: minW,
      h: minH,
      minW,
      minH,
      isDraggable: Boolean(isEditing),
      isResizable: Boolean(isEditing)
    };
  };

  const handleLayoutChange = (newLayout: Layout[]) => {
    // Convert array back to object format
    const layoutObject: DashboardLayout = {};
    newLayout.forEach(item => {
      layoutObject[item.i] = {
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minW: item.minW,
        minH: item.minH,
        isDraggable: Boolean(isEditing),
        isResizable: Boolean(isEditing)
      };
    });
    
    onLayoutChange(layoutObject);
  };

  return (
    <div className="widget-grid-container">
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: currentLayout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={(layout) => handleLayoutChange(layout)}
        isDraggable={isEditing}
        isResizable={isEditing}
        compactType="vertical"
        margin={[16, 16]}
      >
        {widgets.map(widget => (
          <div key={widget.id} className="widget-container">
            <DashboardWidget
              id={widget.id}
              type={widget.type}
              title={widget.title}
              data={widget.data}
              settings={widget.settings}
              isEditing={isEditing}
              onRemove={onRemoveWidget}
              onSettingsChange={onWidgetSettingsChange}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default WidgetGrid;