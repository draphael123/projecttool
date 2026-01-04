export type TransformType = 
  | "trim"
  | "lowercase"
  | "uppercase"
  | "date-parse"
  | "number-parse"
  | "replace";

export type FilterOperator = 
  | "equals"
  | "not-equals"
  | "contains"
  | "not-contains"
  | "greater-than"
  | "less-than"
  | "is-empty"
  | "is-not-empty";

export type DedupeStrategy = 
  | "first"
  | "last"
  | "merge";

export type DerivedFieldType = 
  | "concat"
  | "fallback"
  | "add"
  | "subtract"
  | "multiply"
  | "divide";

export interface ColumnMapping {
  templateColumn: string;
  sourceColumn: string;
  sourceFile?: string; // If undefined, applies to all files
}

export interface Transform {
  column: string;
  type: TransformType;
  params?: {
    searchValue?: string;
    replaceValue?: string;
    dateFormat?: string;
  };
}

export interface Filter {
  column: string;
  operator: FilterOperator;
  value?: string | number;
}

export interface DedupeRule {
  keyColumns: string[];
  strategy: DedupeStrategy;
}

export interface DerivedField {
  name: string;
  type: DerivedFieldType;
  sourceColumns: string[];
  separator?: string; // For concat
  defaultValue?: string; // For fallback
}

export interface OutputOptions {
  includeSourceFile: boolean;
  templateColumnOrder: boolean;
}

export interface ReportConfig {
  columnMappings: ColumnMapping[];
  transforms: Transform[];
  filters: Filter[];
  dedupe: DedupeRule | null;
  derivedFields: DerivedField[];
  outputOptions: OutputOptions;
}

export interface ParsedCSV {
  filename: string;
  headers: string[];
  data: Record<string, any>[];
  rowCount: number;
  error?: string;
}

export interface ProcessedRow extends Record<string, any> {
  _sourceFile?: string;
}

