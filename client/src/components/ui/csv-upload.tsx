import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { 
  UploadCloud, 
  FileText, 
  AlertTriangle, 
  X, 
  Play, 
  ArrowRight,
  FileUp,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function CsvUpload() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFileData, setUploadedFileData] = useState<any>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // First step: Upload file only
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      console.log(`Starting upload for file: ${file.name}`);
      const formData = new FormData();
      formData.append("file", file);

      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 200);

      try {
        const response = await fetch("/api/upload-csv/", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || response.statusText);
        }

        clearInterval(interval);
        setUploadProgress(100);
        
        const data = await response.json();
        console.log(`Upload successful, received data:`, data);
        return data;
      } catch (error) {
        console.error(`Upload error:`, error);
        clearInterval(interval);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "File uploaded successfully",
        description: `${selectedFile?.name} is ready for processing.`,
      });
      setUploadedFileData(data);
      setUploadProgress(100);
      
      // Force cache invalidation before processing
      queryClient.invalidateQueries({ queryKey: ['/api/upload-csv/'] });
      
      // Give a small delay to allow the cache to refresh
      setTimeout(() => {
        processMutation.mutate(data.id);
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
      setSelectedFile(null);
    },
  });
  
  // Second step: Process the file and generate metrics
  const processMutation = useMutation({
    mutationFn: async (csvId: number) => {
      // Simulate processing progress
      const interval = setInterval(() => {
        setProcessingProgress((prev) => {
          const newProgress = prev + Math.random() * 8;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 200);
      
      try {
        // We'll use the existing processing on the server
        // Just simulate a delay here to show progress
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        clearInterval(interval);
        setProcessingProgress(100);
        
        return { success: true, csvId };
      } catch (error) {
        clearInterval(interval);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Processing complete",
        description: "Your data has been processed and is ready for analysis.",
      });
      
      // Refetch the metrics and other data
      queryClient.refetchQueries({ queryKey: ['/api/metrics'] });
      queryClient.refetchQueries({ queryKey: ['/api/insights'] });
      
      // Set the session storage to remember which CSV file to select
      if (uploadedFileData && uploadedFileData.id) {
        try {
          sessionStorage.setItem('selectedCsvId', uploadedFileData.id.toString());
        } catch (e) {
          console.error('Failed to set sessionStorage:', e);
        }
      }
      
      // Reset state for new upload
      setTimeout(() => {
        setSelectedFile(null);
        setUploadedFileData(null);
        setUploadProgress(0);
        setProcessingProgress(0);
        setCurrentStep(1);
        setIsOpen(false);
        
        // Navigate to reports page or reload to display data
        window.location.href = '/reports';
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Processing failed",
        description: error.message,
        variant: "destructive",
      });
      setProcessingProgress(0);
    },
  });

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  // Handle file drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  // Validate and set file
  const validateAndSetFile = (file: File) => {
    // Check if file is a CSV
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  // Handle upload button click
  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  // Handle drag events
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  // Clear selected file
  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file selection and immediate upload
  const handleQuickUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file.",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      uploadMutation.mutate(file);
    }
  };

  return (
    <div className="mb-4">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full border rounded-lg shadow-sm bg-card"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost" 
            className="flex w-full justify-between p-4 rounded-lg"
          >
            <div className="flex items-center">
              <FileUp className="h-5 w-5 mr-2 text-primary" />
              <span className="font-medium">Upload Marketing Data</span>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            {!uploadMutation.isPending && !processMutation.isPending ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors flex-1 ${
                    isDragging 
                      ? "border-primary bg-primary/5" 
                      : "border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex items-center justify-center">
                    <UploadCloud className="h-5 w-5 text-primary mr-2" />
                    <span className="text-sm font-medium">Drop CSV file here or</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-1 h-8 px-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      browse
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleQuickUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                
                {selectedFile && (
                  <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md border shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-1 rounded-full mr-2">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium truncate max-w-[150px]">{selectedFile.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={clearSelectedFile}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleUpload}
                        className="h-7 px-2"
                      >
                        Upload
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 px-2">
                {uploadMutation.isPending && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Uploading file...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                
                {processMutation.isPending && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Processing data...</span>
                      <span>{Math.round(processingProgress)}%</span>
                    </div>
                    <Progress value={processingProgress} className="h-2" />
                  </div>
                )}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
