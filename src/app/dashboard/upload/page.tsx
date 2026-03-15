"use client";
import { useState, useRef } from "react";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import Card, { CardContent, CardHeader } from "@/src/components/ui/Card";
import Button from "@/src/components/ui/Button";
import axios from "axios";


function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const nextChar = line[i + 1];
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function normalizeCsvValue(value: string): string {
  return value.trim().replace(/^"|"$/g, "").replace(/""/g, '"');
}

function countValidFeedbackRows(csvText: string): number {
  const lines = csvText
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return 0;
  }

  const headers = splitCsvLine(lines[0]).map((header) =>
    normalizeCsvValue(header).toLowerCase().replace(/\s+/g, "_")
  );

  const feedbackIndex = headers.findIndex((header) => header === "feedback");
  const feedbackTextIndex = headers.findIndex((header) => header === "feedback_text");
  const targetIndex = feedbackIndex !== -1 ? feedbackIndex : feedbackTextIndex;

  if (targetIndex === -1) {
    throw new Error("Missing feedback column");
  }

  let validCount = 0;
  for (const line of lines.slice(1)) {
    const values = splitCsvLine(line);
    const feedbackValue = values[targetIndex];
    if (typeof feedbackValue === "string" && normalizeCsvValue(feedbackValue).length > 0) {
      validCount += 1;
    }
  }

  return validCount;
}

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = async (selectedFile: File): Promise<boolean> => {
    const isCsv =
      selectedFile.type === "text/csv" ||
      selectedFile.name.toLowerCase().endsWith(".csv");

    if (!isCsv) {
      setFile(null);
      setUploadStatus("error");
      setMessage("Only CSV files are allowed.");
      return false;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFile(null);
      setUploadStatus("error");
      setMessage("File size must be 5 MB or less.");
      return false;
    }

    try {
      const csvText = await selectedFile.text();
      const feedbackCount = countValidFeedbackRows(csvText);

      if (feedbackCount > 200) {
        setFile(null);
        setUploadStatus("error");
        setMessage(`Maximum 200 feedbacks can be uploaded at once.`);
        return false;
      }

      setFile(selectedFile);
      setUploadStatus("idle");
      setMessage("");
      return true;
    } catch {
      setFile(null);
      setUploadStatus("error");
      setMessage("Could not validate this CSV file. Please check the format and try again.");
      return false;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      await validateAndSetFile(droppedFile);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const isValid = await validateAndSetFile(selectedFile);
      if (!isValid) {
        e.target.value = "";
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await axios.post("/api/v1/upload-csv", formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = response.data;

      if (response.status === 200) {
        setUploadStatus("success");
        setMessage(data.message || "File uploaded and processed successfully!");
      } else {
        setUploadStatus("error");
        setMessage(data.message || "Upload failed. Please try again.");
      }
    } catch {
      setUploadStatus("error");
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadStatus("idle");
    setMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Upload Feedback
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Import your customer feedback data via CSV file
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  Upload CSV File
                </h2>
              </CardHeader>
              <CardContent>
                {/* Drag & Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
                    ${isDragging 
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" 
                      : "border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    }
                    ${file ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : ""}
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {file ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-medium text-zinc-900 dark:text-white">{file.name}</p>
                        <p className="text-sm text-zinc-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                        className="text-sm text-red-600 hover:text-red-500 font-medium"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-medium text-zinc-900 dark:text-white">
                          Drop your CSV file here, or <span className="text-indigo-600">browse</span>
                        </p>
                        <p className="text-sm text-zinc-500 mt-1">
                          Supports CSV files up to 5MB and 200 feedback rows
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {isUploading && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-zinc-600 dark:text-zinc-400">Uploading...</span>
                      <span className="text-zinc-900 dark:text-white font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Status Message */}
                {uploadStatus !== "idle" && (
                  <div className={`mt-6 p-4 rounded-lg ${
                    uploadStatus === "success" 
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800" 
                      : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  }`}>
                    <div className="flex items-center gap-3">
                      {uploadStatus === "success" ? (
                        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                      <p className={`text-sm ${
                        uploadStatus === "success" 
                          ? "text-emerald-700 dark:text-emerald-300" 
                          : "text-red-700 dark:text-red-300"
                      }`}>
                        {message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    isLoading={isUploading}
                    className="flex-1"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload & Process
                  </Button>
                  {file && (
                    <Button variant="outline" onClick={resetUpload}>
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  CSV Format
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Your CSV file should contain the following columns:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">feedback</span>
                    <span className="text-xs text-zinc-500">(required)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full" />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">source</span>
                    <span className="text-xs text-zinc-500">(optional)</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white mb-2">Example:</p>
                  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-700 dark:text-zinc-300 overflow-x-auto">
                    <div className="text-indigo-600 dark:text-indigo-400">feedback_text,source</div>
                    <div>&quot;Great product!&quot;,email</div>
                    <div>&quot;Needs improvement&quot;,survey</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-2">What happens next?</h3>
                  <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      AI categorizes each feedback
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Sentiment is analyzed
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Results saved to dashboard
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
