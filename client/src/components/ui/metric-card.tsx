import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  trendDirection: 'up' | 'down';
  icon: React.ReactNode;
  color: 'success' | 'error' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function MetricCard({
  title,
  value,
  trend,
  trendLabel,
  trendDirection,
  icon,
  color,
  isLoading = false
}: MetricCardProps) {
  // Define color classes based on the color prop
  const colorClasses = {
    success: {
      bg: "bg-success-50 dark:bg-success-900/20",
      text: "text-success-600 dark:text-success-400",
      icon: "bg-success-100 text-success-600"
    },
    error: {
      bg: "bg-error-50 dark:bg-error-900/20",
      text: "text-error-600 dark:text-error-400",
      icon: "bg-error-100 text-error-600"
    },
    warning: {
      bg: "bg-warning-50 dark:bg-warning-900/20",
      text: "text-warning-600 dark:text-warning-400",
      icon: "bg-warning-100 text-warning-600"
    },
    info: {
      bg: "bg-info-50 dark:bg-info-900/20",
      text: "text-info-600 dark:text-info-400",
      icon: "bg-info-100 text-info-600"
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <h3 className="text-2xl font-bold">{value}</h3>
            )}
          </div>
          <div className={`rounded-full p-2 ${colorClasses[color].icon}`}>
            {icon}
          </div>
        </div>
        
        {isLoading ? (
          <Skeleton className="h-5 w-32" />
        ) : (
          <div className="flex items-center">
            <span className={`font-medium flex items-center ${colorClasses[color].text}`}>
              {trendDirection === 'up' ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {trend}%
            </span>
            <span className="text-muted-foreground text-sm ml-2">{trendLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
