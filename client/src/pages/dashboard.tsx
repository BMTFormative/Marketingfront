import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import MetricCard from "@/components/ui/metric-card";
import InsightCard from "@/components/ui/insight-card";
import { getQueryFn } from "@/lib/queryClient";
import { User } from "@shared/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  RefreshCcw, 
  Edit, 
  Trash2, 
  CheckCircle, 
  PauseCircle,
  AlertCircle
} from "lucide-react";
import CsvUpload from "@/components/ui/csv-upload";

// Sample data for charts
const campaignData = [
  { name: 'Week 1', conversions: 400, clicks: 240, impressions: 2400 },
  { name: 'Week 2', conversions: 300, clicks: 198, impressions: 2210 },
  { name: 'Week 3', conversions: 200, clicks: 980, impressions: 2290 },
  { name: 'Week 4', conversions: 278, clicks: 390, impressions: 2000 },
  { name: 'Week 5', conversions: 189, clicks: 480, impressions: 2181 },
];

const channelData = [
  { name: 'Social Media', value: 400 },
  { name: 'Search', value: 300 },
  { name: 'Email', value: 200 },
  { name: 'Direct', value: 100 },
];

const COLORS = ['#1976d2', '#9c27b0', '#2e7d32', '#ed6c02'];

export default function Dashboard() {
  // Get the current user using React Query
  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/user/"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });

  // Fetch metrics
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery<any>({
    queryKey: ['/api/metrics/'],
    enabled: !!user,
  });

  // Fetch insights
  const { data: insights, isLoading: isLoadingInsights } = useQuery<any[]>({
    queryKey: ['/api/insights/'],
    enabled: !!user,
  });

  // Fetch campaigns
  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery<any[]>({
    queryKey: ['/api/campaigns/'],
    enabled: !!user,
  });

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.firstName || 'User'}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your marketing campaigns today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Conversion Rate"
          value="3.45%"
          trend={12.5}
          trendLabel="vs last month"
          trendDirection="up"
          icon={<TrendingUp />}
          color="success"
          isLoading={isLoadingMetrics}
        />
        
        <MetricCard
          title="Click-Through Rate"
          value="2.7%"
          trend={-3.2}
          trendLabel="vs last month"
          trendDirection="down"
          icon={<TrendingDown />}
          color="error"
          isLoading={isLoadingMetrics}
        />
        
        <MetricCard
          title="ROI"
          value="245%"
          trend={18.3}
          trendLabel="vs last month"
          trendDirection="up"
          icon={<TrendingUp />}
          color="success"
          isLoading={isLoadingMetrics}
        />
        
        <MetricCard
          title="Avg. CPC"
          value="$1.42"
          trend={5.1}
          trendLabel="vs last month"
          trendDirection="up"
          icon={<TrendingUp />}
          color="success"
          isLoading={isLoadingMetrics}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Campaign Performance</h3>
              <Tabs defaultValue="weekly">
                <TabsList>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={campaignData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="conversions" fill="#1976d2" />
                  <Bar dataKey="clicks" fill="#9c27b0" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Channel Distribution</h3>
              <Button variant="ghost" size="icon">
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights and CSV Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg">AI Generated Insights</h3>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 mr-2">
                    Updated 5m ago
                  </span>
                  <Button variant="ghost" size="icon">
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {isLoadingInsights ? (
                  <div className="space-y-4">
                    <div className="h-24 rounded-md bg-gray-100 animate-pulse" />
                    <div className="h-24 rounded-md bg-gray-100 animate-pulse" />
                    <div className="h-24 rounded-md bg-gray-100 animate-pulse" />
                  </div>
                ) : insights && insights.length > 0 ? (
                  insights.slice(0, 3).map((insight, index) => (
                    <InsightCard 
                      key={index}
                      title={insight.title} 
                      content={insight.content} 
                      category={insight.category} 
                    />
                  ))
                ) : (
                  <>
                    <InsightCard 
                      title="Conversion Rate Improvements" 
                      content="Your overall conversion rate has improved by 12.5% compared to last month. This can be attributed to the optimized landing pages and improved call-to-action buttons implemented in the latest campaign."
                      category="conversion" 
                    />
                    <InsightCard 
                      title="Audience Targeting Recommendation" 
                      content="Consider narrowing your target audience for the 'Summer Sale' campaign. Data shows that 25-34 age group is performing 45% better than other demographics. Allocating more budget to this segment could yield better ROI."
                      category="audience" 
                    />
                    <InsightCard 
                      title="Channel Performance Analysis" 
                      content="Social media channels are outperforming search engine marketing with a 23% higher conversion rate. Instagram specifically has shown the best performance with CTR of 4.2% compared to the average 2.7%."
                      category="channel" 
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-4">Upload New Data</h3>
              <CsvUpload />
              
              <div className="mt-4">
                <h4 className="font-medium text-sm mb-2">Recent Uploads</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <span className="mr-2"><AlertCircle className="h-4 w-4 text-gray-500" /></span>
                      <span className="text-sm">Q2_Campaign_Results.csv</span>
                    </div>
                    <span className="text-xs text-gray-500">2 days ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <span className="mr-2"><AlertCircle className="h-4 w-4 text-gray-500" /></span>
                      <span className="text-sm">Social_Media_Metrics.csv</span>
                    </div>
                    <span className="text-xs text-gray-500">1 week ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Campaigns Table */}
      {user?.role === 'admin' && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Recent Campaigns</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Conversions</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>ROI</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary bg-opacity-20 text-primary flex items-center justify-center mr-3">
                          <span>📣</span>
                        </div>
                        <div>
                          <div className="font-medium">Summer Promotion</div>
                          <div className="text-sm text-muted-foreground">Social Media</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        Active
                      </span>
                    </TableCell>
                    <TableCell>1,423</TableCell>
                    <TableCell>$5,200</TableCell>
                    <TableCell>
                      <span className="text-success-800 font-medium flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        245%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-info-100 text-info-800 flex items-center justify-center mr-3">
                          <span>🔍</span>
                        </div>
                        <div>
                          <div className="font-medium">Search Retargeting</div>
                          <div className="text-sm text-muted-foreground">Google Ads</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                        Paused
                      </span>
                    </TableCell>
                    <TableCell>892</TableCell>
                    <TableCell>$3,400</TableCell>
                    <TableCell>
                      <span className="text-error-800 font-medium flex items-center">
                        <TrendingDown className="h-4 w-4 mr-1" />
                        12%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-secondary bg-opacity-20 text-secondary flex items-center justify-center mr-3">
                          <span>✉️</span>
                        </div>
                        <div>
                          <div className="font-medium">Email Newsletter</div>
                          <div className="text-sm text-muted-foreground">Direct Marketing</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Completed
                      </span>
                    </TableCell>
                    <TableCell>2,154</TableCell>
                    <TableCell>$1,800</TableCell>
                    <TableCell>
                      <span className="text-success-800 font-medium flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        187%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-muted-foreground">
                Showing 1-3 of 12 campaigns
              </div>
              <div className="flex space-x-1">
                <Button variant="outline" size="icon" disabled>
                  <span>←</span>
                </Button>
                <Button variant="default" size="icon">
                  1
                </Button>
                <Button variant="outline" size="icon">
                  2
                </Button>
                <Button variant="outline" size="icon">
                  3
                </Button>
                <Button variant="outline" size="icon">
                  <span>→</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Management section for admin */}
      {user?.role === 'admin' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">User Management</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-medium mr-3">
                          JD
                        </div>
                        <div>
                          <div className="font-medium">John Doe</div>
                          <div className="text-sm text-muted-foreground">john@example.com</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                        Admin
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        Active
                      </span>
                    </TableCell>
                    <TableCell>Just now</TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-info-700 flex items-center justify-center text-white font-medium mr-3">
                          JS
                        </div>
                        <div>
                          <div className="font-medium">Jane Smith</div>
                          <div className="text-sm text-muted-foreground">jane@example.com</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-info-100 text-info-800">
                        Client
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        Active
                      </span>
                    </TableCell>
                    <TableCell>Yesterday</TableCell>
                    <TableCell>Dec 31, 2023</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-warning-600 flex items-center justify-center text-white font-medium mr-3">
                          RJ
                        </div>
                        <div>
                          <div className="font-medium">Robert Johnson</div>
                          <div className="text-sm text-muted-foreground">robert@example.com</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-info-100 text-info-800">
                        Client
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                        Pending
                      </span>
                    </TableCell>
                    <TableCell>Never</TableCell>
                    <TableCell>Jan 15, 2024</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
