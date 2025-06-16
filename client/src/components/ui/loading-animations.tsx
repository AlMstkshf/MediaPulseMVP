import React from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  BarChart2,
  Activity,
  LineChart,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Loading spinner with optional text
 */
export function LoadingSpinner({
  className,
  text,
  size = "default",
}: {
  className?: string;
  text?: string;
  size?: "sm" | "default" | "lg";
}) {
  const sizeClass = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex items-center justify-center", className)}
    >
      <Loader2
        className={cn(
          "animate-spin text-primary mr-2",
          sizeClass[size]
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{text ?? "Loading..."}</span>
      {text && <span className="text-muted-foreground">{text}</span>}
    </div>
  );
}

/**
 * Pulse loader for charts and data visualizations
 */
export function PulseChartLoader({
  className,
  icon = "bar",
  height = "h-64",
}: {
  className?: string;
  icon?: "bar" | "line" | "pie" | "activity";
  height?: string;
}) {
  const Icon = {
    bar: BarChart2,
    line: LineChart,
    pie: PieChart,
    activity: Activity,
  }[icon];

  return (
    <div
      role="status"
      aria-label="Loading chart"
      className={cn(
        "w-full rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden",
        className
      )}
    >
      <div className={cn("flex flex-col items-center justify-center", height)}>
        <motion.div
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0.8 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 1.5,
          }}
          className="text-muted-foreground"
        >
          <Icon className="h-16 w-16" aria-hidden="true" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.2 }}
          animate={{ opacity: 0.6 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 1.8,
            delay: 0.3,
          }}
          className="mt-4 text-muted-foreground"
        >
          <span className="sr-only">Loading data...</span>
          جاري تحميل البيانات...
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for cards with chart and metadata
 */
export function DataCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "w-full rounded-lg border bg-card text-card-foreground shadow-sm p-6",
        className
      )}
    >
      <div className="space-y-2">
        <div className="h-5 w-1/3 bg-muted rounded animate-pulse"></div>
        <div className="h-4 w-1/2 bg-muted rounded animate-pulse opacity-70"></div>
      </div>

      <div className="mt-4 h-40 bg-muted rounded animate-pulse"></div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-1/4 bg-muted rounded animate-pulse"></div>
          <div className="h-4 w-1/4 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-1/5 bg-muted rounded animate-pulse"></div>
          <div className="h-4 w-1/5 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Bar chart loader with animated bars
 */
export function AnimatedBarChartLoader({
  className,
  height = "h-64",
  bars = 7,
}: {
  className?: string;
  height?: string;
  bars?: number;
}) {
  return (
    <div
      role="status"
      aria-label="Loading bar chart"
      className={cn("w-full flex items-end justify-around p-4", height, className)}
    >
      {Array.from({ length: bars }).map((_, index) => {
        const barHeight = 20 + Math.random() * 70; // Random between 20%–90%
        return (
          <motion.div
            key={index}
            initial={{ height: "0%", opacity: 0.3 }}
            animate={{ height: `${barHeight}%`, opacity: 0.8 }}
            transition={{
              duration: 1.2,
              delay: index * 0.1,
              repeat: Infinity,
              repeatType: "reverse",
              repeatDelay: 1,
            }}
            className="bg-primary/30 rounded-md w-[8%]"
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}

/**
 * Line chart loader with animated path
 */
export function AnimatedLineChartLoader({
  className,
  height = "h-64",
}: {
  className?: string;
  height?: string;
}) {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2, repeat: Infinity, repeatType: "loop", repeatDelay: 0.5 },
        opacity: { duration: 0.5 },
      },
    },
  };

  // Random points
  const points = Array.from({ length: 10 }).map((_, i) => [i * 10, 50 - Math.random() * 40]);
  const pathData = `M ${points.map((p) => p.join(" ")).join(" L ")}`;

  return (
    <div
      role="status"
      aria-label="Loading line chart"
      className={cn("w-full flex items-center justify-center", height, className)}
    >
      <svg width="90%" height="90%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.path
          d={pathData}
          variants={pathVariants}
          initial="hidden"
          animate="visible"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-primary"
          aria-hidden="true"
        />
      </svg>
    </div>
  );
}

/**
 * Donut chart loader with animated segments
 */
export function AnimatedDonutChartLoader({
  className,
  size = 180,
}: {
  className?: string;
  size?: number;
}) {
  const segments = [
    { color: "var(--primary)", delay: 0, percentage: 0.35 },
    { color: "var(--primary-light, #90caf9)", delay: 0.5, percentage: 0.25 },
    { color: "var(--chart-color-3, #a5d6a7)", delay: 1, percentage: 0.2 },
    { color: "var(--chart-color-4, #ffcc80)", delay: 1.5, percentage: 0.2 },
  ];
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Loading donut chart">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth="8"
            opacity="0.2"
            aria-hidden="true"
          />
          {segments.map((seg, i) => {
            const start = segments.slice(0, i).reduce((a, c) => a + c.percentage, 0);
            const dashArray = circumference;
            const dashOffset = circumference * (1 - seg.percentage);
            const rotate = 360 * start;
            return (
              <motion.circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="8"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                transform={`rotate(${rotate} 50 50)`}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.5, delay: seg.delay, ease: "easeInOut" }}
                aria-hidden="true"
              />
            );
          })}
          <motion.text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-2xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            <tspan className="text-xl font-medium fill-primary">100%</tspan>
          </motion.text>
        </svg>
      </div>
    </div>
  );
}

/**
 * Progress circle loader with animated progress
 */
export function CircularProgressLoader({
  className,
  size = 120,
  progress = 75,
  animate = true,
  strokeWidth = 8,
  color = "primary",
}: {
  className?: string;
  size?: number;
  progress?: number;
  animate?: boolean;
  strokeWidth?: number;
  color?: "primary" | "secondary" | "green" | "amber" | "red";
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (progress / 100) * circumference;

  const colorClass = {
    primary: "text-primary",
    secondary: "text-secondary",
    green: "text-green-500",
    amber: "text-amber-500",
    red: "text-red-500",
  }[color];

  return (
    <div role="img" aria-label={`${progress}% loaded`} className={cn("relative", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted opacity-20"
          aria-hidden="true"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          className={colorClass}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: targetOffset }}
          transition={{ duration: animate ? 2 : 0, ease: "easeInOut" }}
          aria-hidden="true"
        />
        {/* Center Text */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-medium"
          fill="currentColor"
        >
          {animate ? (
            <motion.tspan
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              fontSize={size / 6}
            >
              {progress}%
            </motion.tspan>
          ) : (
            <tspan fontSize={size / 6}>{progress}%</tspan>
          )}
        </text>
      </svg>
    </div>
  );
}

/**
 * Grid of skeleton cards for dashboard loading
 */
export function DashboardSkeleton({
  columns = 2,
  className,
}: {
  columns?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("grid gap-4", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: columns * 2 }).map((_, i) => (
        <DataCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Data table skeleton loader
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      role="region"
      aria-label="Loading table"
      className={cn("w-full border rounded-md overflow-hidden", className)}
    >
      {/* Header */}
      <div className="bg-muted/20 p-4">
        <div className="flex space-x-4 rtl:space-x-reverse">
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={`header-${i}`}
              className="h-6 bg-muted rounded w-24 animate-pulse"
            ></div>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="p-4">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={cn(
                    "h-5 bg-muted rounded animate-pulse",
                    colIndex === 0 ? "w-12" : "w-24"
                  )}
                  style={{
                    animationDelay: `${rowIndex * 0.1 + colIndex * 0.05}s`,
                    opacity: Math.max(0.4, 1 - rowIndex * 0.15),
                  }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
