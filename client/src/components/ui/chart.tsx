"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [series: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

interface ChartContextProps {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

// ChartContainer: wraps ResponsiveContainer and provides theme-based CSS variables
export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${(id || uniqueId).replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        role="region"
        aria-roledescription="chart"
        className={cn(
          "flex aspect-video justify-center text-xs",
          "[&_ .recharts-cartesian-axis-tick_text]:fill-muted-foreground",
          "[&_ .recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50",
          "[&_ .recharts-curve.recharts-tooltip-cursor]:stroke-border",
          "[&_ .recharts-dot[stroke='#fff']]:stroke-transparent",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

// Inject CSS variables for colors per theme or static
const ChartStyle: React.FC<{ id: string; config: ChartConfig }> = ({
  id,
  config,
}) => {
  const entries = Object.entries(config).filter(
    ([, cfg]) => cfg.color || cfg.theme
  );
  if (!entries.length) return null;

  const styleContent = Object.entries(THEMES)
    .map(([theme, prefix]) => {
      const vars = entries
        .map(([key, cfg]) => {
          const val =
            cfg.theme?.[theme as keyof typeof cfg.theme] ?? cfg.color;
          return val ? `  --color-${key}: ${val};` : null;
        })
        .filter(Boolean)
        .join("\n");
      return `${prefix} [data-chart=${id}] {\n${vars}\n}`;
    })
    .join("\n");

  return <style dangerouslySetInnerHTML={{ __html: styleContent }} />;
};
ChartStyle.displayName = "ChartStyle";

// Tooltip alias and content renderer
export const ChartTooltip = RechartsPrimitive.Tooltip;

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    labelKey?: string;
    nameKey?: string;
  }
>(
  (
    {
      active,
      payload,
      formatter,
      label,
      labelFormatter,
      labelClassName,
      hideLabel = false,
      hideIndicator = false,
      indicator = "dot",
      labelKey,
      nameKey,
      className,
      ...rest
    },
    ref
  ) => {
    const { config } = useChart();
    if (!active || !payload || !payload.length) return null;

    // Build label
    const tooltipLabel = !hideLabel && (
      <div className={cn("font-medium", labelClassName)}>
        {labelFormatter
          ? labelFormatter(label as any, payload)
          : config[label as keyof typeof config]?.label || label}
      </div>
    );

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] gap-1.5 rounded-lg border border-border/50",
          "bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
        {...rest}
      >
        {tooltipLabel}
        <div className="grid gap-1.5">
          {payload.map((item, idx) => {
            const key = `${nameKey ?? item.name ?? item.dataKey}`;
            const cfg = config[key as keyof typeof config];
            const color = (item.payload as any).fill ?? item.color;
            const showIcon = !hideIndicator;
            return (
              <div key={idx} className="flex items-center gap-2">
                {cfg?.icon ? (
                  <cfg.icon />
                ) : (
                  showIcon && (
                    <div
                      className={cn(
                        {
                          "h-2.5 w-2.5": indicator === "dot",
                          "w-1": indicator === "line",
                          "border-dashed border-[1.5px] w-0":
                            indicator === "dashed",
                        },
                        "shrink-0 rounded-[2px]",
                        "bg-[--color] border-[--color]"
                      )}
                      style={{ '--color': color } as React.CSSProperties}
                    />
                  )
                )}
                <div className="flex flex-1 justify-between">
                  <span className="text-muted-foreground">
                    {cfg?.label ?? item.name}
                  </span>
                  <span className="font-mono font-medium text-foreground">
                    {item.value?.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltipContent";

// Legend alias and content
export const ChartLegend = RechartsPrimitive.Legend;

export const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  { payload?: RechartsPrimitive.LegendPayload[]; verticalAlign?: string } &
    React.HTMLAttributes<HTMLDivElement> & {
      hideIcon?: boolean;
      nameKey?: string;
    }
>(
  (
    {
      payload,
      verticalAlign = 'bottom',
      hideIcon = false,
      nameKey,
      className,
      ...rest
    },
    ref
  ) => {
    const { config } = useChart();
    if (!payload || !payload.length) return null;
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-4",
          verticalAlign === 'top' ? 'pb-3' : 'pt-3',
          className
        )}
        {...rest}
      >
        {payload.map((item, idx) => {
          const key = `${nameKey ?? item.dataKey ?? item.value}`;
          const cfg = config[key as keyof typeof config];
          return (
            <div key={idx} className="flex items-center gap-1.5">
              {cfg?.icon && !hideIcon ? (
                <cfg.icon />
              ) : (
                <div
                  className="h-2 w-2 rounded-[2px]"
                  style={{ backgroundColor: item.color }}
                />
              )}
              <span>{cfg?.label ?? item.value}</span>
            </div>
          );
        })}
      </div>
    );
  }
);
ChartLegendContent.displayName = "ChartLegendContent";

// Helper: extract config per series
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: any,
  key: string
) {
  if (!payload) return undefined;
  const nameKey = key in payload ? String(payload[key]) : key;
  return config[nameKey] || config[key];
}

export {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
};
