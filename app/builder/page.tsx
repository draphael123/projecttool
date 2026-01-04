"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, X, Download, RefreshCw, Plus, Trash2, FileText, Layers, Sparkles, CheckCircle2, FileEdit, Wand2, Info, HelpCircle } from "lucide-react";
import { parseCSV, autoMapColumns, downloadCSV } from "@/lib/csv-utils";
import { processData } from "@/lib/processor";
import { parseInstructions, mergeInstructionsWithConfig } from "@/lib/instruction-parser";
import type { ParsedCSV, ColumnMapping } from "@/lib/types";
import type { ReportConfig } from "@/lib/schemas";

const ITEMS_PER_PAGE = 50;

export default function BuilderPage() {
  const [templateFile, setTemplateFile] = useState<ParsedCSV | null>(null);
  const [inputFiles, setInputFiles] = useState<ParsedCSV[]>([]);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [config, setConfig] = useState<ReportConfig>({
    instructions: "",
    quickPrompt: "",
    columnMappings: [],
    transforms: [],
    filters: [],
    dedupe: null,
    derivedFields: [],
    outputOptions: {
      includeSourceFile: false,
      templateColumnOrder: true,
    },
  });

  // Handle template file upload
  const handleTemplateUpload = useCallback(async (file: File) => {
    const parsed = await parseCSV(file);
    setTemplateFile(parsed);
    
    // Auto-map columns from first input file if available
    if (inputFiles.length > 0 && inputFiles[0].headers.length > 0) {
      const mapping = autoMapColumns(parsed.headers, inputFiles[0].headers);
      const mappings: ColumnMapping[] = Array.from(mapping.entries()).map(([template, source]) => ({
        templateColumn: template,
        sourceColumn: source,
      }));
      setConfig((prev) => ({ ...prev, columnMappings: mappings }));
    }
  }, [inputFiles]);

  // Handle input files upload
  const handleInputFilesUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;
    
    const parsedFiles: ParsedCSV[] = [];
    for (let i = 0; i < files.length; i++) {
      const parsed = await parseCSV(files[i]);
      parsedFiles.push(parsed);
    }
    
    setInputFiles((prev) => [...prev, ...parsedFiles]);
    
    // Auto-map columns if template exists
    if (templateFile && parsedFiles.length > 0 && parsedFiles[0].headers.length > 0) {
      const allSourceHeaders = new Set<string>();
      parsedFiles.forEach((f) => f.headers.forEach((h) => allSourceHeaders.add(h)));
      const mapping = autoMapColumns(templateFile.headers, Array.from(allSourceHeaders));
      const mappings: ColumnMapping[] = Array.from(mapping.entries()).map(([template, source]) => ({
        templateColumn: template,
        sourceColumn: source,
      }));
      setConfig((prev) => ({ ...prev, columnMappings: mappings }));
    }
  }, [templateFile]);

  // Generate report
  const handleGenerate = useCallback(() => {
    if (!templateFile || inputFiles.length === 0) return;
    
    try {
      // Parse instructions and merge with existing config
      const allSourceHeaders = new Set<string>();
      inputFiles.forEach((f) => f.headers.forEach((h) => allSourceHeaders.add(h)));
      
      const parsedInstructions = parseInstructions(
        config.instructions || "",
        config.quickPrompt || "",
        templateFile.headers,
        Array.from(allSourceHeaders)
      );
      
      // Merge parsed instructions with existing config
      // Existing config takes priority, but parsed instructions fill in gaps
      const finalConfig = mergeInstructionsWithConfig(parsedInstructions, config);
      
      // If no column mappings exist, use parsed ones or auto-map
      if (finalConfig.columnMappings.length === 0) {
        const autoMappings = autoMapColumns(templateFile.headers, Array.from(allSourceHeaders));
        finalConfig.columnMappings = Array.from(autoMappings.entries()).map(([template, source]) => ({
          templateColumn: template,
          sourceColumn: source,
        }));
      }
      
      const processed = processData(templateFile.headers, inputFiles, finalConfig);
      setProcessedData(processed);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error processing data:", error);
      alert("Error processing data. Check console for details.");
    }
  }, [templateFile, inputFiles, config]);

  // Download CSV
  const handleDownload = useCallback(() => {
    if (processedData.length === 0 || !templateFile) return;
    
    const headers = config.outputOptions.templateColumnOrder
      ? templateFile.headers
      : Object.keys(processedData[0] || {});
    
    if (config.outputOptions.includeSourceFile && !headers.includes("SourceFile")) {
      headers.push("SourceFile");
    }
    
    downloadCSV(processedData, headers, "merged-report.csv");
  }, [processedData, templateFile, config]);

  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const paginatedData = processedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto py-8 space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              CSV Report Builder
            </h1>
            <p className="text-muted-foreground">Combine and transform your CSV files with ease</p>
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={!templateFile || inputFiles.length === 0}
            className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 hover:from-purple-700 hover:via-pink-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>

      {/* How to Use Guide */}
      <section aria-labelledby="how-to-use-heading">
        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 shadow-lg mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-100 via-cyan-100 to-blue-100 rounded-t-lg border-b-2 border-blue-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg" aria-hidden="true">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle id="how-to-use-heading" className="text-xl font-bold text-blue-900">How to Use This Tool</CardTitle>
                <CardDescription className="text-blue-800 mt-1">
                  Follow these steps to combine your CSV files and create a unified report
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base text-purple-900 mb-1">Upload Template CSV</h3>
                  <p className="text-sm text-purple-700 leading-relaxed">
                    Upload a CSV file that defines your desired output structure. This template file should contain the column headers you want in your final report. The tool will use this as a guide for mapping data from your input files.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base text-blue-900 mb-1">Upload Input CSV Files</h3>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    Upload one or more CSV files that contain the data you want to combine. You can upload multiple files at once. The tool will automatically attempt to map columns from these files to your template.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base text-pink-900 mb-1">Provide Instructions</h3>
                  <p className="text-sm text-pink-700 leading-relaxed">
                    Use the <strong>Quick Prompt</strong> for simple instructions or the <strong>Detailed Instructions</strong> field for comprehensive requirements. Describe what you want: column mappings, transformations, filters, deduplication rules, etc.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base text-green-900 mb-1">Configure & Generate</h3>
                  <p className="text-sm text-green-700 leading-relaxed">
                    Use the configuration tabs to fine-tune column mappings, apply transforms, add filters, set up deduplication, and create derived fields. Click <strong>"Generate Report"</strong> to process your data, preview the results, and download the final CSV.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-blue-200">
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">💡 Tip: All processing happens in your browser</p>
                  <p className="text-xs text-blue-800">
                    Your data never leaves your device. Everything is processed locally for maximum privacy and security. The tool supports large datasets and will show you a preview of the first 200 rows before you download.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </section>

      <section aria-labelledby="file-upload-heading">
        <h2 id="file-upload-heading" className="sr-only">File Upload Section</h2>
        <div className="grid gap-6 md:grid-cols-2">
        {/* Template Upload Card */}
        <Card className="card-hover border-2 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Template CSV</CardTitle>
                <CardDescription>Upload a CSV file that defines the output schema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {templateFile ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex-1">
                    <div className="font-semibold text-green-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {templateFile.filename}
                    </div>
                    <div className="text-sm text-green-700 mt-1">
                      {templateFile.rowCount} rows, {templateFile.headers.length} columns
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTemplateFile(null)}
                    className="hover:bg-red-100 hover:text-red-600"
                    aria-label={`Remove template file ${templateFile.filename}`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
                {templateFile.error && (
                  <div className="text-sm text-destructive bg-red-50 p-2 rounded border border-red-200">{templateFile.error}</div>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {templateFile.headers.slice(0, 10).map((h) => (
                    <Badge key={h} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">{h}</Badge>
                  ))}
                  {templateFile.headers.length > 10 && (
                    <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">+{templateFile.headers.length - 10} more</Badge>
                  )}
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-medium text-purple-700 group-hover:text-purple-900">Click to upload template</span>
                <span className="text-xs text-muted-foreground mt-1">CSV file</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleTemplateUpload(file);
                  }}
                  aria-label="Upload template CSV file that defines the output structure"
                  id="template-file-input"
                />
              </label>
            )}
          </CardContent>
        </Card>

        {/* Input Files Upload Card */}
        <Card className="card-hover border-2 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Input CSV Files</CardTitle>
                <CardDescription>Upload one or more CSV files to combine</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 mb-4 group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-700 group-hover:text-blue-900">Click to upload files</span>
              <span className="text-xs text-muted-foreground mt-1">Multiple CSV files</span>
              <input
                type="file"
                className="hidden"
                accept=".csv"
                multiple
                onChange={(e) => handleInputFilesUpload(e.target.files)}
                aria-label="Upload one or more input CSV files to combine"
                id="input-files-input"
              />
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {inputFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border-2 border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-blue-900">{file.filename}</div>
                    <div className="text-sm text-blue-700">
                      {file.rowCount} rows, {file.headers.length} columns
                    </div>
                    {file.error && (
                      <div className="text-xs text-destructive bg-red-50 p-1 rounded mt-1 border border-red-200">{file.error}</div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setInputFiles((prev) => prev.filter((_, i) => i !== idx))}
                    className="hover:bg-red-100 hover:text-red-600"
                    aria-label={`Remove input file ${file.filename}`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
      </section>

      {/* Quick Prompt Card - Simple Text Option */}
      <Card className="card-hover border-2 shadow-xl border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 mb-6">
        <CardHeader className="bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 rounded-t-lg border-b-2 border-purple-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-purple-900">
                Quick Prompt
              </CardTitle>
              <CardDescription className="text-purple-800 font-medium mt-1">
                🚀 Describe what you want in simple terms (alternative to detailed instructions below)
              </CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-3 py-1 text-sm font-semibold">
              Quick
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Textarea
              id="quickPrompt"
              placeholder="Example: &quot;Combine all my CSV files, remove duplicates by email, filter out inactive customers, and format dates as YYYY-MM-DD&quot;"
              value={config.quickPrompt || ""}
              onChange={(e) => {
                setConfig((prev) => ({
                  ...prev,
                  quickPrompt: e.target.value,
                }));
              }}
              className="min-h-[100px] resize-y bg-white border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-400 text-base leading-relaxed placeholder:text-purple-400"
            />
            {config.quickPrompt && config.quickPrompt.trim() && (
              <div className="bg-purple-100 border border-purple-300 rounded-lg p-3">
                <p className="text-xs text-purple-800 font-medium">
                  ✨ This prompt will be automatically parsed and applied when you generate the report. It will configure column mappings, filters, transforms, and other settings based on your instructions.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions Card - The Foundation */}
      <Card className="card-hover border-2 shadow-xl border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <CardHeader className="bg-gradient-to-r from-amber-200 via-orange-200 to-amber-200 rounded-t-lg border-b-2 border-amber-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <FileEdit className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-amber-900">
                Report Instructions
              </CardTitle>
              <CardDescription className="text-amber-800 font-medium mt-1">
                ⭐ Provide instructions that will guide the output configuration. These instructions form the basis for how your report will be generated.
              </CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 px-3 py-1 text-sm font-semibold">
              Foundation
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="instructions" className="text-base font-semibold text-amber-900">
                Your Instructions
              </Label>
              {config.instructions && config.instructions.trim() && (
                <Badge variant="outline" className="bg-green-50 border-green-300 text-green-700">
                  ✓ Instructions provided
                </Badge>
              )}
            </div>
            <Textarea
              id="instructions"
              placeholder="Example instructions:&#10;&#10;• Combine all input CSV files into a single report&#10;• Map 'Customer Name' column to 'Name' in the template&#10;• Filter out rows where Status equals 'Inactive'&#10;• Remove duplicates based on Email address (keep first occurrence)&#10;• Convert all date columns to YYYY-MM-DD format&#10;• Trim whitespace from all text columns&#10;• Create a new field 'Full Name' by concatenating First Name and Last Name&#10;&#10;Be as specific as possible about column mappings, transformations, filters, and output requirements."
              value={config.instructions || ""}
              onChange={(e) => {
                setConfig((prev) => ({
                  ...prev,
                  instructions: e.target.value,
                }));
              }}
              className="min-h-[180px] resize-y bg-white border-2 border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-400 text-base leading-relaxed placeholder:text-amber-400"
              aria-label="Detailed instructions field - provide comprehensive requirements for report configuration"
              aria-describedby="instructions-description"
            />
            <div id="instructions-description" className="sr-only">
              Enter detailed instructions about how you want the report configured. Your instructions will be automatically parsed and applied to configure column mappings, transformations, filters, and other settings.
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium mb-2">
                💡 How Instructions Work:
              </p>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Your instructions guide the column mapping, transformations, filters, and deduplication rules</li>
                <li>Be specific about column names, data formats, and output requirements</li>
                <li>Instructions are used as reference when configuring the report settings below</li>
                <li>The final output will be based on both your instructions and the configuration settings</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      {templateFile && inputFiles.length > 0 && (
        <Card className="card-hover border-2 shadow-lg border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-100 via-pink-100 via-blue-100 to-purple-100 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">Report Configuration</CardTitle>
                {config.instructions && config.instructions.trim() && (
                  <CardDescription className="text-xs mt-1 text-purple-700">
                    Configure settings below based on your instructions above
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="mapping" className="w-full">
              <TabsList className="grid w-full grid-cols-6 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 p-1 rounded-lg border border-purple-200">
                <TabsTrigger value="mapping" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-pink-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">Mapping</TabsTrigger>
                <TabsTrigger value="transforms" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-pink-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">Transforms</TabsTrigger>
                <TabsTrigger value="filters" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-pink-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">Filters</TabsTrigger>
                <TabsTrigger value="dedupe" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-pink-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">Dedupe</TabsTrigger>
                <TabsTrigger value="derived" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-pink-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">Derived</TabsTrigger>
                <TabsTrigger value="output" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:via-pink-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg">Output</TabsTrigger>
              </TabsList>

              {/* Column Mapping Tab */}
              <TabsContent value="mapping" className="space-y-4">
                <div className="space-y-2">
                  {config.columnMappings.map((mapping, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Select
                        value={mapping.templateColumn}
                        onValueChange={(value) => {
                          const newMappings = [...config.columnMappings];
                          newMappings[idx].templateColumn = value;
                          setConfig((prev) => ({ ...prev, columnMappings: newMappings }));
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {templateFile.headers.map((h) => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-muted-foreground">→</span>
                      <Select
                        value={mapping.sourceColumn}
                        onValueChange={(value) => {
                          const newMappings = [...config.columnMappings];
                          newMappings[idx].sourceColumn = value;
                          setConfig((prev) => ({ ...prev, columnMappings: newMappings }));
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(new Set(inputFiles.flatMap((f) => f.headers))).map((h) => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={mapping.sourceFile || "all"}
                        onValueChange={(value) => {
                          const newMappings = [...config.columnMappings];
                          newMappings[idx].sourceFile = value === "all" ? undefined : value;
                          setConfig((prev) => ({ ...prev, columnMappings: newMappings }));
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Files</SelectItem>
                          {inputFiles.map((f) => (
                            <SelectItem key={f.filename} value={f.filename}>{f.filename}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setConfig((prev) => ({
                            ...prev,
                            columnMappings: prev.columnMappings.filter((_, i) => i !== idx),
                          }));
                        }}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setConfig((prev) => ({
                        ...prev,
                        columnMappings: [
                          ...prev.columnMappings,
                          { templateColumn: templateFile.headers[0] || "", sourceColumn: "" },
                        ],
                      }));
                    }}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Mapping
                  </Button>
                </div>
              </TabsContent>

              {/* Transforms Tab */}
              <TabsContent value="transforms" className="space-y-4">
                <div className="space-y-2">
                  {config.transforms.map((transform, idx) => (
                    <div key={idx} className="flex gap-2 items-center p-2 border rounded">
                      <Select
                        value={transform.column}
                        onValueChange={(value) => {
                          const newTransforms = [...config.transforms];
                          newTransforms[idx].column = value;
                          setConfig((prev) => ({ ...prev, transforms: newTransforms }));
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {templateFile.headers.map((h) => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={transform.type}
                        onValueChange={(value: any) => {
                          const newTransforms = [...config.transforms];
                          newTransforms[idx].type = value;
                          setConfig((prev) => ({ ...prev, transforms: newTransforms }));
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trim">Trim</SelectItem>
                          <SelectItem value="lowercase">Lowercase</SelectItem>
                          <SelectItem value="uppercase">Uppercase</SelectItem>
                          <SelectItem value="number-parse">Parse Number</SelectItem>
                          <SelectItem value="date-parse">Parse Date</SelectItem>
                          <SelectItem value="replace">Replace</SelectItem>
                        </SelectContent>
                      </Select>
                      {transform.type === "replace" && (
                        <>
                          <Input
                            placeholder="Search"
                            value={transform.params?.searchValue || ""}
                            onChange={(e) => {
                              const newTransforms = [...config.transforms];
                              newTransforms[idx].params = {
                                ...newTransforms[idx].params,
                                searchValue: e.target.value,
                              };
                              setConfig((prev) => ({ ...prev, transforms: newTransforms }));
                            }}
                            className="w-32"
                          />
                          <Input
                            placeholder="Replace with"
                            value={transform.params?.replaceValue || ""}
                            onChange={(e) => {
                              const newTransforms = [...config.transforms];
                              newTransforms[idx].params = {
                                ...newTransforms[idx].params,
                                replaceValue: e.target.value,
                              };
                              setConfig((prev) => ({ ...prev, transforms: newTransforms }));
                            }}
                            className="w-32"
                          />
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setConfig((prev) => ({
                            ...prev,
                            transforms: prev.transforms.filter((_, i) => i !== idx),
                          }));
                        }}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setConfig((prev) => ({
                        ...prev,
                        transforms: [
                          ...prev.transforms,
                          { column: templateFile.headers[0] || "", type: "trim" },
                        ],
                      }));
                    }}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                  >
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                    Add Transform
                  </Button>
                </div>
              </TabsContent>

              {/* Filters Tab */}
              <TabsContent value="filters" className="space-y-4">
                <div className="space-y-2">
                  {config.filters.map((filter, idx) => (
                    <div key={idx} className="flex gap-2 items-center p-2 border rounded">
                      <Select
                        value={filter.column}
                        onValueChange={(value) => {
                          const newFilters = [...config.filters];
                          newFilters[idx].column = value;
                          setConfig((prev) => ({ ...prev, filters: newFilters }));
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {templateFile.headers.map((h) => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={filter.operator}
                        onValueChange={(value: any) => {
                          const newFilters = [...config.filters];
                          newFilters[idx].operator = value;
                          setConfig((prev) => ({ ...prev, filters: newFilters }));
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="not-equals">Not Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="not-contains">Not Contains</SelectItem>
                          <SelectItem value="greater-than">Greater Than</SelectItem>
                          <SelectItem value="less-than">Less Than</SelectItem>
                          <SelectItem value="is-empty">Is Empty</SelectItem>
                          <SelectItem value="is-not-empty">Is Not Empty</SelectItem>
                        </SelectContent>
                      </Select>
                      {!["is-empty", "is-not-empty"].includes(filter.operator) && (
                        <Input
                          placeholder="Value"
                          value={filter.value?.toString() || ""}
                          onChange={(e) => {
                            const newFilters = [...config.filters];
                            newFilters[idx].value = e.target.value;
                            setConfig((prev) => ({ ...prev, filters: newFilters }));
                          }}
                          className="w-48"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setConfig((prev) => ({
                            ...prev,
                            filters: prev.filters.filter((_, i) => i !== idx),
                          }));
                        }}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setConfig((prev) => ({
                        ...prev,
                        filters: [
                          ...prev.filters,
                          { column: templateFile.headers[0] || "", operator: "equals", value: "" },
                        ],
                      }));
                    }}
                    className="border-pink-300 text-pink-700 hover:bg-pink-50 hover:border-pink-400"
                  >
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                    Add Filter
                  </Button>
                </div>
              </TabsContent>

              {/* Dedupe Tab */}
              <TabsContent value="dedupe" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={config.dedupe !== null}
                      onCheckedChange={(checked) => {
                        setConfig((prev) => ({
                          ...prev,
                          dedupe: checked
                            ? { keyColumns: [templateFile.headers[0] || ""], strategy: "first" }
                            : null,
                        }));
                      }}
                    />
                    <Label>Enable Deduplication</Label>
                  </div>
                  {config.dedupe && (
                    <div className="space-y-4 pl-6">
                      <div>
                        <Label>Key Columns</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {templateFile.headers.map((h) => (
                            <div key={h} className="flex items-center gap-2">
                              <Checkbox
                                checked={config.dedupe!.keyColumns.includes(h)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setConfig((prev) => ({
                                      ...prev,
                                      dedupe: prev.dedupe
                                        ? {
                                            ...prev.dedupe,
                                            keyColumns: [...prev.dedupe.keyColumns, h],
                                          }
                                        : null,
                                    }));
                                  } else {
                                    setConfig((prev) => ({
                                      ...prev,
                                      dedupe: prev.dedupe
                                        ? {
                                            ...prev.dedupe,
                                            keyColumns: prev.dedupe.keyColumns.filter((c) => c !== h),
                                          }
                                        : null,
                                    }));
                                  }
                                }}
                              />
                              <Label>{h}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Strategy</Label>
                        <Select
                          value={config.dedupe.strategy}
                          onValueChange={(value: any) => {
                            setConfig((prev) => ({
                              ...prev,
                              dedupe: prev.dedupe ? { ...prev.dedupe, strategy: value } : null,
                            }));
                          }}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="first">Keep First</SelectItem>
                            <SelectItem value="last">Keep Last</SelectItem>
                            <SelectItem value="merge">Merge</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Derived Fields Tab */}
              <TabsContent value="derived" className="space-y-4">
                <div className="space-y-2">
                  {config.derivedFields.map((field, idx) => (
                    <div key={idx} className="p-4 border rounded space-y-2">
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="Field Name"
                          value={field.name}
                          onChange={(e) => {
                            const newFields = [...config.derivedFields];
                            newFields[idx].name = e.target.value;
                            setConfig((prev) => ({ ...prev, derivedFields: newFields }));
                          }}
                          className="w-48"
                        />
                        <Select
                          value={field.type}
                          onValueChange={(value: any) => {
                            const newFields = [...config.derivedFields];
                            newFields[idx].type = value;
                            setConfig((prev) => ({ ...prev, derivedFields: newFields }));
                          }}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="concat">Concat</SelectItem>
                            <SelectItem value="fallback">Fallback</SelectItem>
                            <SelectItem value="add">Add</SelectItem>
                            <SelectItem value="subtract">Subtract</SelectItem>
                            <SelectItem value="multiply">Multiply</SelectItem>
                            <SelectItem value="divide">Divide</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setConfig((prev) => ({
                              ...prev,
                              derivedFields: prev.derivedFields.filter((_, i) => i !== idx),
                            }));
                          }}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                      <div>
                        <Label>Source Columns</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {templateFile.headers.map((h) => (
                            <div key={h} className="flex items-center gap-2">
                              <Checkbox
                                checked={field.sourceColumns.includes(h)}
                                onCheckedChange={(checked) => {
                                  const newFields = [...config.derivedFields];
                                  if (checked) {
                                    newFields[idx].sourceColumns.push(h);
                                  } else {
                                    newFields[idx].sourceColumns = newFields[idx].sourceColumns.filter(
                                      (c) => c !== h
                                    );
                                  }
                                  setConfig((prev) => ({ ...prev, derivedFields: newFields }));
                                }}
                              />
                              <Label>{h}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      {field.type === "concat" && (
                        <Input
                          placeholder="Separator (optional)"
                          value={field.separator || ""}
                          onChange={(e) => {
                            const newFields = [...config.derivedFields];
                            newFields[idx].separator = e.target.value;
                            setConfig((prev) => ({ ...prev, derivedFields: newFields }));
                          }}
                          className="w-48"
                        />
                      )}
                      {field.type === "fallback" && (
                        <Input
                          placeholder="Default Value (optional)"
                          value={field.defaultValue || ""}
                          onChange={(e) => {
                            const newFields = [...config.derivedFields];
                            newFields[idx].defaultValue = e.target.value;
                            setConfig((prev) => ({ ...prev, derivedFields: newFields }));
                          }}
                          className="w-48"
                        />
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setConfig((prev) => ({
                        ...prev,
                        derivedFields: [
                          ...prev.derivedFields,
                          { name: "", type: "concat", sourceColumns: [] },
                        ],
                      }));
                    }}
                    className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400"
                  >
                    <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                    Add Derived Field
                  </Button>
                </div>
              </TabsContent>

              {/* Output Options Tab */}
              <TabsContent value="output" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={config.outputOptions.includeSourceFile}
                      onCheckedChange={(checked) => {
                        setConfig((prev) => ({
                          ...prev,
                          outputOptions: { ...prev.outputOptions, includeSourceFile: checked as boolean },
                        }));
                      }}
                    />
                    <Label>Include Source File Column</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={config.outputOptions.templateColumnOrder}
                      onCheckedChange={(checked) => {
                        setConfig((prev) => ({
                          ...prev,
                          outputOptions: { ...prev.outputOptions, templateColumnOrder: checked as boolean },
                        }));
                      }}
                    />
                    <Label>Use Template Column Order</Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Instructions Summary - shown when instructions exist and data is processed */}
      {processedData.length > 0 && config.instructions && config.instructions.trim() && (
        <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-lg border-b-2 border-amber-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <FileEdit className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl text-amber-900 font-bold">Applied Instructions</CardTitle>
                <CardDescription className="text-amber-800 mt-1">
                  These instructions formed the basis for generating the report below
                </CardDescription>
              </div>
              <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-white/80 backdrop-blur-sm border-2 border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed font-medium">
                {config.instructions}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Table */}
      {processedData.length > 0 && (
        <Card className="card-hover border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Preview ({processedData.length} rows)</CardTitle>
                  <CardDescription>Showing first 200 rows</CardDescription>
                </div>
              </div>
              <Button 
                onClick={handleDownload}
                className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 hover:from-green-700 hover:via-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                aria-label={`Download merged CSV report with ${processedData.length} rows`}
              >
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                Download CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {templateFile &&
                      (config.outputOptions.templateColumnOrder
                        ? templateFile.headers
                        : Object.keys(processedData[0] || {})
                      )
                        .concat(config.outputOptions.includeSourceFile ? ["SourceFile"] : [])
                        .map((header) => (
                          <TableHead key={header}>{header}</TableHead>
                        ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.slice(0, 200).map((row, idx) => (
                    <TableRow key={idx}>
                      {templateFile &&
                        (config.outputOptions.templateColumnOrder
                          ? templateFile.headers
                          : Object.keys(processedData[0] || {})
                        )
                          .concat(config.outputOptions.includeSourceFile ? ["SourceFile"] : [])
                          .map((header) => (
                            <TableCell key={header}>{String(row[header] ?? "")}</TableCell>
                          ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}

