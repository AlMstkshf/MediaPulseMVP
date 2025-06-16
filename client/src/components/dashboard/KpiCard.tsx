import { ArrowUp, ArrowDown } from "lucide-react";

export interface KpiCardProps {
  title: string;
  value: string;
  change: number;
  info?: string;
  progressValue?: number;
  progressColor?: string;
  borderColor: string;
  rtl?: boolean;
}

const KpiCard = ({
  title,
  value,
  change,
  info,
  progressValue,
  progressColor,
  borderColor,
  rtl = false
}: KpiCardProps) => {
  const isPositive = change >= 0;
  
  const borderClass = rtl ? `border-l-4` : `border-r-4`;
  const marginClass = rtl ? "ml-1" : "mr-1";
  const textAlignClass = rtl ? "text-right" : "text-left";

  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 ${borderClass} ${borderColor}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className={`text-gray-500 text-sm ${textAlignClass}`}>{title}</h3>
        <span className={`text-sm flex items-center ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? (
            <ArrowUp className={`${marginClass} h-4 w-4`} />
          ) : (
            <ArrowDown className={`${marginClass} h-4 w-4`} />
          )}
          {Math.abs(change)}%
        </span>
      </div>
      <p className={`text-2xl font-bold ${textAlignClass}`}>{value}</p>
      
      {progressValue !== undefined && (
        <div className="h-2 bg-gray-200 rounded-full mt-2">
          <div 
            className={`h-full rounded-full ${progressColor}`} 
            style={{ width: `${progressValue}%` }}
          ></div>
        </div>
      )}
      
      <div className={`text-xs text-gray-500 mt-2 ${textAlignClass}`}>{info}</div>
    </div>
  );
};

export default KpiCard;
