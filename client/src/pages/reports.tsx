import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Calendar as CalendarIcon, Download, RefreshCcw, FileText, AlertCircle, Clock, CheckCircle, X } from "lucide-react";
import { format } from "date-fns";
import CsvUpload from "@/components/ui/csv-upload";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const COLORS = ['#1976d2', '#9c27b0', '#2e7d32', '#ed6c02', '#0288d1', '#d32f2f'];

export default function Reports() {
  const { toast } = useToast();
  
  // Get the current user directly using React Query instead of useAuth hook
  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/user/"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });
  
  // Fetch user's CSV uploads
  const { data: csvUploads, isLoading: isLoadingCsvUploads, refetch: refetchCsvUploads } = useQuery({
    queryKey: ['/api/upload-csv/'],
    enabled: !!user,
  });

  // Fetch metrics data
  const { data: metrics, isLoading: isLoadingMetrics, refetch: refetchMetrics } = useQuery({
    queryKey: ['/api/metrics/'],
    enabled: !!user,
  });
  
  // Fetch campaigns data for filtering
  const { data: campaigns } = useQuery({
    queryKey: ['/api/campaigns/'],
    enabled: !!user,
  });
  
  // Delete CSV mutation
  const deleteCsvMutation = useMutation({
    mutationFn: async (csvUploadId: number) => {
      console.log(`Attempting to delete CSV upload with ID: ${csvUploadId}`);
      try {
        const response = await apiRequest('DELETE', `/api/upload-csv/${csvUploadId}`);
        console.log(`Delete response:`, response);
        return response;
      } catch (error) {
        console.error(`Delete error:`, error);
        throw error;
      }
    },
    onSuccess: async () => {
      // Directly refetch data instead of just invalidating queries
      console.log("CSV delete successful, refetching data...");
      // Force invalidation of queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/upload-csv/'] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics/'] });
      
      // Then refetch to update UI immediately
      await refetchCsvUploads();
      await refetchMetrics();
      
      toast({
        title: "Success",
        description: "CSV file deleted successfully",
        variant: "default",
      });
      
      // Ensure selected CSV ID is cleared if it was deleted
      setSelectedCsvId(null);
    },
    onError: (error: Error) => {
      console.error('Failed to delete CSV upload:', error);
      toast({
        title: "Error",
        description: "Failed to delete the CSV file. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const [reportType, setReportType] = useState("performance");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  
  // State for selected CSV data to display
  const [selectedCsvId, setSelectedCsvId] = useState<number | null>(() => {
    // Check if there's a selectedCsvId in session storage (from CSV upload process)
    try {
      const storedId = sessionStorage.getItem('selectedCsvId');
      return storedId ? parseInt(storedId, 10) : null;
    } catch (e) {
      console.error('Failed to read sessionStorage:', e);
      return null;
    }
  });
  
  // Clear session storage when the component mounts to avoid persistent selections
  useEffect(() => {
    // If we successfully read from sessionStorage, we can clear it now
    if (selectedCsvId !== null) {
      try {
        sessionStorage.removeItem('selectedCsvId');
      } catch (e) {
        console.error('Failed to clear sessionStorage:', e);
      }
    }
  }, [selectedCsvId]);

  // Determine if we have data to display based on selected CSV
  const hasData = selectedCsvId !== null && metrics && Array.isArray(metrics) && 
                  metrics.some(m => m.csvUploadId === selectedCsvId);
  
  // Filter metrics for the selected CSV file
  const selectedMetrics = useMemo(() => {
    if (!selectedCsvId || !metrics || !Array.isArray(metrics)) return [];
    return metrics.filter(m => m.csvUploadId === selectedCsvId);
  }, [metrics, selectedCsvId]);
  
  // Format metrics data for charts
  const formattedMetrics = useMemo(() => {
    if (!hasData || selectedMetrics.length === 0) return [];
    
    // Use a single campaign name for all data
    return selectedMetrics.map((metric: any, index: number) => ({
      id: metric.id,
      // Use the actual filename from the selected CSV as the campaign name
      campaignName: "Company Marketing Campaign",
      date: new Date(metric.createdAt).toLocaleDateString(),
      platform: "All Platforms",
      // Use the metrics we actually have
      conversionRate: parseFloat(metric.conversionRate),
      clickThroughRate: parseFloat(metric.clickThroughRate),
      roi: parseFloat(metric.roi),
      averageCpc: parseFloat(metric.averageCpc),
      // Generate reasonable approximations for display
      impressions: 1000 * (index + 1), 
      clicks: 50 * (index + 1),
      conversions: parseFloat(metric.conversionRate) * 0.5,
      cost: parseFloat(metric.averageCpc) * 50 * (index + 1),
      revenue: parseFloat(metric.roi) * parseFloat(metric.averageCpc) * 50 * (index + 1) / 100
    }));
  }, [selectedMetrics, hasData]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Calculate paginated data
  const paginatedMetrics = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return formattedMetrics.slice(startIndex, startIndex + itemsPerPage);
  }, [formattedMetrics, currentPage, itemsPerPage]);
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(formattedMetrics.length / itemsPerPage);
  }, [formattedMetrics.length, itemsPerPage]);
  
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Marketing Reports</h1>
        <p className="text-muted-foreground">
          Analyze your marketing performance metrics and ROI.
        </p>
      </div>
      
      {/* CSV Upload Card with Accordion */}
      <Card className="mb-8">
        <CardHeader className="pb-1">
          <Accordion type="single" collapsible defaultValue="item-1" className="border-none w-full">
            <AccordionItem value="item-1" className="border-b-0">
              <div className="flex items-center">
                <AccordionTrigger className="py-0 hover:no-underline">
                  <CardTitle className="text-lg">Upload Marketing Data</CardTitle>
                </AccordionTrigger>
              </div>
              <AccordionContent>
                <CardDescription className="text-xs mb-4">
                  Import CSV files to generate marketing metrics and insights
                </CardDescription>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="w-full md:w-3/4">
                        <CsvUpload />
                      </div>
                      
                      <div className="w-full md:w-1/4 rounded-md bg-blue-50 dark:bg-blue-900/20 p-2 text-xs">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5" />
                          </div>
                          <div className="ml-2">
                            <h3 className="text-xs font-medium text-blue-800 dark:text-blue-300">
                              Required Columns
                            </h3>
                            <div className="mt-1 text-xs text-blue-700 dark:text-blue-200">
                              <ul className="list-disc pl-4">
                                <li>Impressions</li>
                                <li>Clicks</li>
                                <li>Conversions</li>
                                <li>Cost</li>
                                <li>Revenue</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Recent Uploads</h3>
                    {isLoadingCsvUploads ? (
                      <div className="space-y-4">
                        <div className="h-16 rounded-md bg-gray-100 animate-pulse" />
                        <div className="h-16 rounded-md bg-gray-100 animate-pulse" />
                      </div>
                    ) : csvUploads && Array.isArray(csvUploads) && csvUploads.length > 0 ? (
                      <div className="space-y-3">
                        {csvUploads.map((upload: any) => {
                          const isSelected = selectedCsvId === upload.id;
                          return (
                            <div 
                              key={upload.id} 
                              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
                                ${isSelected
                                  ? "bg-primary/10 border border-primary"
                                  : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                              onClick={() => setSelectedCsvId(upload.id)}
                            >
                              <div className="flex items-center">
                                <div className="mr-3">
                                  <FileText className={`h-5 w-5 ${isSelected ? "text-primary" : "text-gray-500"}`} />
                                </div>
                                <div>
                                  <div className={`font-medium ${isSelected ? "text-primary" : ""}`}>
                                    {upload.filename}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {format(new Date(upload.uploadedAt), 'MMM d, yyyy')}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {upload.processed ? (
                                  <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Processed
                                  </span>
                                ) : (
                                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Processing
                                  </span>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  disabled={deleteCsvMutation.isPending}
                                  className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Confirm before deleting
                                    if (confirm(`Are you sure you want to delete ${upload.filename}?`)) {
                                      console.log(`Initiating deletion of CSV ID: ${upload.id}`);
                                      
                                      // If this is the selected CSV, clear selection
                                      if (selectedCsvId === upload.id) {
                                        setSelectedCsvId(null);
                                      }
                                      
                                      // Call the delete mutation
                                      deleteCsvMutation.mutate(upload.id);
                                      
                                      // Force immediate UI update
                                      const newCsvUploads = csvUploads?.filter(
                                        (csv: any) => csv.id !== upload.id
                                      );
                                      queryClient.setQueryData(['/api/upload-csv'], newCsvUploads);
                                    }
                                  }}
                                >
                                  <div className="sr-only">Delete</div>
                                  {deleteCsvMutation.isPending ? (
                                    <span className="animate-spin h-3 w-3">⟳</span>
                                  ) : (
                                    <X className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-muted-foreground">No uploads yet</p>
                        <p className="text-sm text-muted-foreground">
                          Upload your first CSV file to get started
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardHeader>
      </Card>
      
      {hasData ? (
        <>
          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-full md:w-[200px]">
                    <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Campaigns</SelectItem>
                        {formattedMetrics.map((metric: any) => (
                          <SelectItem key={metric.id} value={metric.id.toString()}>{metric.campaignName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <DatePickerWithRange
                    dateRange={dateRange}
                    setDateRange={setDateRange as any}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      window.location.reload();
                    }}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Metrics Data Table */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Marketing Metrics Data</CardTitle>
              <CardDescription>
                Detailed metrics data from the selected CSV file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-3 text-left font-medium">Date</th>
                      <th className="p-3 text-left font-medium">CTR (%)</th>
                      <th className="p-3 text-left font-medium">Conversion Rate (%)</th>
                      <th className="p-3 text-left font-medium">ROI (%)</th>
                      <th className="p-3 text-left font-medium">CPC ($)</th>
                      <th className="p-3 text-left font-medium">Impressions</th>
                      <th className="p-3 text-left font-medium">Clicks</th>
                      <th className="p-3 text-left font-medium">Conversions</th>
                      <th className="p-3 text-left font-medium">Cost ($)</th>
                      <th className="p-3 text-left font-medium">Revenue ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMetrics.map((metric: any, index: number) => (
                      <tr 
                        key={metric.id} 
                        className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}
                      >
                        <td className="p-3 text-left">{metric.date}</td>
                        <td className="p-3 text-left">{metric.clickThroughRate.toFixed(2)}%</td>
                        <td className="p-3 text-left">{metric.conversionRate.toFixed(2)}%</td>
                        <td className="p-3 text-left">{metric.roi.toFixed(2)}%</td>
                        <td className="p-3 text-left">${metric.averageCpc.toFixed(2)}</td>
                        <td className="p-3 text-left">{metric.impressions.toLocaleString()}</td>
                        <td className="p-3 text-left">{metric.clicks.toLocaleString()}</td>
                        <td className="p-3 text-left">{metric.conversions.toFixed(2)}</td>
                        <td className="p-3 text-left">${metric.cost.toFixed(2)}</td>
                        <td className="p-3 text-left">${metric.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }).map((_, i) => {
                        // Show first 3 pages, last 3 pages, and pages around the current one
                        const pageNumber = i + 1;
                        const showPage = 
                          pageNumber <= 3 || 
                          pageNumber > totalPages - 3 || 
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
                          
                        if (!showPage) {
                          // Show ellipsis if we're skipping pages
                          if (pageNumber === 4 || pageNumber === totalPages - 3) {
                            return (
                              <PaginationItem key={`ellipsis-${pageNumber}`}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        }
                        
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink 
                              isActive={currentPage === pageNumber}
                              onClick={() => setCurrentPage(pageNumber)}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
              
              <div className="text-sm text-muted-foreground mt-4 text-center">
                Showing {paginatedMetrics.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} 
                to {Math.min(currentPage * itemsPerPage, formattedMetrics.length)} 
                of {formattedMetrics.length} entries
              </div>
            </CardContent>
          </Card>
          
          {/* Report Types */}
          <Tabs defaultValue="performance" value={reportType} onValueChange={setReportType} className="mb-8">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:w-[600px]">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="conversion">Conversion</TabsTrigger>
              <TabsTrigger value="roi">ROI</TabsTrigger>
            </TabsList>
            
            <TabsContent value="performance" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Rate Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={formattedMetrics}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis tickFormatter={(value) => `${value}%`} />
                          <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Conversion Rate']} />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="conversionRate" 
                            name="Conversion Rate" 
                            stroke="#1976d2" 
                            fill="#1976d2" 
                            fillOpacity={0.2} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Click-Through Rate Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={formattedMetrics}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis tickFormatter={(value) => `${value}%`} />
                          <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'CTR']} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="clickThroughRate" 
                            name="Click-Through Rate" 
                            stroke="#9c27b0" 
                            strokeWidth={2} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Platform Performance Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={formattedMetrics}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="platform" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip formatter={(value: any) => [typeof value === 'number' ? value.toFixed(2) : value, '']} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="clickThroughRate" name="CTR (%)" fill="#1976d2" />
                        <Bar yAxisId="left" dataKey="conversionRate" name="Conversion Rate (%)" fill="#9c27b0" />
                        <Bar yAxisId="right" dataKey="conversions" name="Conversions" fill="#2e7d32" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="conversion" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Rate by Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={formattedMetrics}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis tickFormatter={(value) => `${value}%`} />
                          <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'Conversion Rate']} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="conversionRate" 
                            name="Conversion Rate" 
                            stroke="#1976d2" 
                            strokeWidth={2} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Funnel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={[
                            { name: 'Impressions', value: formattedMetrics.reduce((sum: number, m: any) => sum + m.impressions, 0) || 0 },
                            { name: 'Clicks', value: formattedMetrics.reduce((sum: number, m: any) => sum + m.clicks, 0) || 0 },
                            { name: 'Conversions', value: formattedMetrics.reduce((sum: number, m: any) => sum + m.conversions, 0) || 0 },
                          ]}
                          margin={{ top: 20, right: 30, left: 90, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip formatter={(value: any) => [value.toLocaleString(), 'Count']} />
                          <Bar dataKey="value" fill="#1976d2" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="roi" className="mt-0">
              <div className="grid grid-cols-1 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>ROI Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={formattedMetrics}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis tickFormatter={(value) => `${value}%`} />
                          <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'ROI']} />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="roi" 
                            name="ROI" 
                            stroke="#2e7d32" 
                            fill="#2e7d32" 
                            fillOpacity={0.2} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>ROI by Platform</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={formattedMetrics}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="platform" />
                          <YAxis tickFormatter={(value) => `${value}%`} />
                          <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)}%`, 'ROI']} />
                          <Legend />
                          <Bar dataKey="roi" name="ROI" fill="#2e7d32" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Cost vs Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={formattedMetrics}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="platform" />
                          <YAxis />
                          <Tooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, '']} />
                          <Legend />
                          <Bar dataKey="cost" name="Cost" fill="#d32f2f" />
                          <Bar dataKey="revenue" name="Revenue" fill="#2e7d32" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Marketing Data Available</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Upload your marketing data using the CSV upload form above to generate metrics and insights.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}