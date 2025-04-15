import DashboardLayout from "@/components/layouts/dashboard-layout";
import CsvUpload from "@/components/ui/csv-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, FileText, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getQueryFn } from "@/lib/queryClient";
import { User } from "@shared/schema";

export default function UploadCsv() {
  // Get the current user directly using React Query instead of useAuth hook
  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" })
  });
  
  // Fetch user's CSV uploads
  const { data: csvUploads, isLoading } = useQuery({
    queryKey: ['/api/csv-uploads'],
    enabled: !!user,
  });

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Upload CSV Data</h1>
        <p className="text-muted-foreground">
          Import your marketing data from CSV files to generate metrics and insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload New File</CardTitle>
            </CardHeader>
            <CardContent>
              <CsvUpload />
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>CSV File Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Required Columns
                      </h3>
                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-200">
                        <p>Your CSV file should include the following columns:</p>
                        <ul className="list-disc pl-5 mt-1">
                          <li>Impressions - Total number of ad impressions</li>
                          <li>Clicks - Total number of clicks</li>
                          <li>Conversions - Total number of conversions</li>
                          <li>Cost - Total spend on the campaign</li>
                          <li>Revenue - Total revenue generated (optional)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        File Format
                      </h3>
                      <div className="mt-2 text-sm text-amber-700 dark:text-amber-200">
                        <p>
                          The file must be a valid CSV format with column headers in the first row.
                          Maximum file size is 5MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                        Example CSV
                      </h3>
                      <div className="mt-2 text-sm text-green-700 dark:text-green-200">
                        <p>Here's a simple example of a valid CSV format:</p>
                        <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto text-xs">
                          Date,Campaign,Impressions,Clicks,Conversions,Cost,Revenue<br/>
                          2023-01-01,Facebook Ads,10000,500,25,1200,3000<br/>
                          2023-01-01,Google Ads,15000,700,35,1500,4200<br/>
                          2023-01-02,Facebook Ads,12000,550,30,1300,3500
                        </pre>
                      </div>
                      <div className="mt-2">
                        <Button variant="outline" size="sm">
                          Download Example CSV
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <div className="h-16 rounded-md bg-gray-100 animate-pulse" />
                  <div className="h-16 rounded-md bg-gray-100 animate-pulse" />
                  <div className="h-16 rounded-md bg-gray-100 animate-pulse" />
                </div>
              ) : csvUploads && Array.isArray(csvUploads) && csvUploads.length > 0 ? (
                <div className="space-y-3">
                  {csvUploads.map((upload: any) => (
                    <div 
                      key={upload.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="mr-3">
                          <FileText className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium">{upload.filename}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(upload.uploadedAt), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
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
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-muted-foreground">No uploads yet</p>
                  <p className="text-sm text-muted-foreground">
                    Upload your first CSV file to get started
                  </p>
                </div>
              )}
              
              {/* Sample uploads for demo */}
              {!csvUploads && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <div className="mr-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">Q2_Campaign_Results.csv</div>
                        <div className="text-xs text-muted-foreground">Jun 15, 2023</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Processed
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <div className="mr-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">Social_Media_Metrics.csv</div>
                        <div className="text-xs text-muted-foreground">Jun 8, 2023</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Processed
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <div className="mr-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-medium">Email_Campaign_June.csv</div>
                        <div className="text-xs text-muted-foreground">Jun 2, 2023</div>
                      </div>
                    </div>
                    <div className="flex flex-col w-full max-w-[120px]">
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center mb-1">
                        <Clock className="h-3 w-3 mr-1" />
                        Processing
                      </span>
                      <Progress value={65} className="h-1" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Upload Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Storage Used</p>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">3.2 MB of 50 MB</span>
                    <span className="text-sm text-muted-foreground">6.4%</span>
                  </div>
                  <Progress value={6.4} className="h-2" />
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Uploads</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Processing Time (avg)</p>
                  <p className="text-2xl font-bold">1.2s</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
