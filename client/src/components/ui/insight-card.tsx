import { BarChart2, BriefcaseBusiness, Users } from "lucide-react";

interface InsightCardProps {
  title: string;
  content: string;
  category: string;
}

export default function InsightCard({ title, content, category }: InsightCardProps) {
  // Set border color and icon based on category
  const getCategoryStyles = () => {
    switch (category) {
      case 'conversion':
        return {
          border: 'border-primary',
          bg: 'bg-primary-50 dark:bg-primary-900/10',
          icon: <BarChart2 className="h-5 w-5 text-primary" />
        };
      case 'audience':
        return {
          border: 'border-warning-500',
          bg: 'bg-warning-50 dark:bg-warning-900/10',
          icon: <Users className="h-5 w-5 text-warning-500" />
        };
      case 'channel':
        return {
          border: 'border-info-500',
          bg: 'bg-info-50 dark:bg-info-900/10',
          icon: <BriefcaseBusiness className="h-5 w-5 text-info-500" />
        };
      default:
        return {
          border: 'border-gray-300',
          bg: 'bg-gray-50 dark:bg-gray-800',
          icon: <BarChart2 className="h-5 w-5 text-gray-500" />
        };
    }
  };

  const styles = getCategoryStyles();

  return (
    <div className={`p-4 border-l-4 ${styles.border} ${styles.bg} rounded-r-lg`}>
      <div className="flex items-center mb-2">
        <div className="mr-2">{styles.icon}</div>
        <h4 className="font-medium">{title}</h4>
      </div>
      <p className="text-muted-foreground text-sm">{content}</p>
    </div>
  );
}
