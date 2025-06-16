import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "@/components/ui/clock";
import { CalendarWidget } from "@/components/ui/calendar-widget";
import { cn } from "@/lib/utils";
import { useRtlDirection } from "@/lib/rtl-helper";

interface TimeWidgetProps {
  className?: string;
  showClock?: boolean;
  showCalendar?: boolean;
  variant?: "default" | "compact";
}

export function TimeWidget({
  className,
  showClock = true,
  showCalendar = true,
  variant = "default"
}: TimeWidgetProps) {
  const { t } = useTranslation();
  const { isRtl } = useRtlDirection();

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className={cn("pb-2", isRtl && "text-right")}>
        <CardTitle className="text-base">
          {t("dashboard.timeAndCalendar")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "flex gap-4", 
          variant === "compact" ? "flex-col" : "flex-row",
          isRtl && "flex-row-reverse"
        )}>
          {showClock && (
            <div className={cn(
              "flex flex-col items-center justify-center",
              variant === "default" ? "w-1/3" : "w-full"
            )}>
              <Clock 
                variant="card" 
                showSeconds={variant !== "compact"} 
              />
            </div>
          )}
          
          {showCalendar && (
            <div className={cn(
              "flex flex-col",
              variant === "default" ? "w-2/3" : "w-full"
            )}>
              <CalendarWidget 
                variant="inline" 
                showCurrentMonth={true} 
                showEvents={true}
                events={[
                  {
                    id: 1,
                    title: t("calendar.eventTypes.important"),
                    date: new Date(),
                    type: "important"
                  }
                ]}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}