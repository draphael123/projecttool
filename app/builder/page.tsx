"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, X, Download, RefreshCw, Plus, Trash2 } from "lucide-react";
import { parseCSV, autoMapColumns, downloadCSV } from "@/lib/csv-utils";
import { processData } from "@/lib/processor";
import type { ParsedCSV } from "@/lib/types";
import type { ReportConfig } from "@/lib/schemas";

const ITEMS_PER_PAGE = 50;

export default function BuilderPage() {
  const [templateFile, setTemplateFile] = useState<ParsedCSV | null>(null);
  const [inputFiles, setInputFiles] = useState<ParsedCSV[]>([]);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [config, setConfig] = useState<ReportConfig>({
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
      const processed = processData(templateFile.headers, inputFiles, config);
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
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">CSV Report Builder</h1>
        <Button onClick={handleGenerate} disabled={!templateFile || inputFiles.length === 0}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Template Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Template CSV</CardTitle>
            <CardDescription>Upload a CSV file that defines the output schema</CardDescription>
          </CardHeader>
          <CardContent>
            {templateFile ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{templateFile.filename}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTemplateFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {templateFile.rowCount} rows, {templateFile.headers.length} columns
                </div>
                {templateFile.error && (
                  <div className="text-sm text-destructive">{templateFile.error}</div>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {templateFile.headers.slice(0, 10).map((h) => (
                    <Badge key={h} variant="outline">{h}</Badge>
                  ))}
                  {templateFile.headers.length > 10 && (
                    <Badge variant="outline">+{templateFile.headers.length - 10} more</Badge>
                  )}
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload template</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleTemplateUpload(file);
                  }}
                />
              </label>
            )}
          </CardContent>
        </Card>

        {/* Input Files Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Input CSV Files</CardTitle>
            <CardDescription>Upload one or more CSV files to combine</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent mb-4">
              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload files</span>
              <input
                type="file"
                className="hidden"
                accept=".csv"
                multiple
                onChange={(e) => handleInputFilesUpload(e.target.files)}
              />
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {inputFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{file.filename}</div>
                    <div className="text-sm text-muted-foreground">
                      {file.rowCount} rows, {file.headers.length} columns
                    </div>
                    {file.error && (
                      <div className="text-xs text-destructive">{file.error}</div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setInputFiles((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Tabs */}
      {templateFile && inputFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="mapping" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="mapping">Mapping</TabsTrigger>
                <TabsTrigger value="transforms">Transforms</TabsTrigger>
                <TabsTrigger value="filters">Filters</TabsTrigger>
                <TabsTrigger value="dedupe">Dedupe</TabsTrigger>
                <TabsTrigger value="derived">Derived</TabsTrigger>
                <TabsTrigger value="output">Output</TabsTrigger>
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
                        <Trash2 className="h-4 w-4" />
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
                        <Trash2 className="h-4 w-4" />
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
                  >
                    <Plus className="mr-2 h-4 w-4" />
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
                        <Trash2 className="h-4 w-4" />
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
                  >
                    <Plus className="mr-2 h-4 w-4" />
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
                          <Trash2 className="h-4 w-4" />
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
                  >
                    <Plus className="mr-2 h-4 w-4" />
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

      {/* Preview Table */}
      {processedData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Preview ({processedData.length} rows)</CardTitle>
                <CardDescription>Showing first 200 rows</CardDescription>
              </div>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
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
  );
}

