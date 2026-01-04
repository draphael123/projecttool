import { z } from "zod";

export const TransformTypeSchema = z.enum([
  "trim",
  "lowercase",
  "uppercase",
  "date-parse",
  "number-parse",
  "replace",
]);

export const FilterOperatorSchema = z.enum([
  "equals",
  "not-equals",
  "contains",
  "not-contains",
  "greater-than",
  "less-than",
  "is-empty",
  "is-not-empty",
]);

export const DedupeStrategySchema = z.enum(["first", "last", "merge"]);

export const DerivedFieldTypeSchema = z.enum([
  "concat",
  "fallback",
  "add",
  "subtract",
  "multiply",
  "divide",
]);

export const ColumnMappingSchema = z.object({
  templateColumn: z.string(),
  sourceColumn: z.string(),
  sourceFile: z.string().optional(),
});

export const TransformSchema = z.object({
  column: z.string(),
  type: TransformTypeSchema,
  params: z.object({
    searchValue: z.string().optional(),
    replaceValue: z.string().optional(),
    dateFormat: z.string().optional(),
  }).optional(),
});

export const FilterSchema = z.object({
  column: z.string(),
  operator: FilterOperatorSchema,
  value: z.union([z.string(), z.number()]).optional(),
});

export const DedupeRuleSchema = z.object({
  keyColumns: z.array(z.string()),
  strategy: DedupeStrategySchema,
});

export const DerivedFieldSchema = z.object({
  name: z.string(),
  type: DerivedFieldTypeSchema,
  sourceColumns: z.array(z.string()),
  separator: z.string().optional(),
  defaultValue: z.string().optional(),
});

export const OutputOptionsSchema = z.object({
  includeSourceFile: z.boolean(),
  templateColumnOrder: z.boolean(),
});

export const ReportConfigSchema = z.object({
  instructions: z.string().optional(),
  quickPrompt: z.string().optional(),
  columnMappings: z.array(ColumnMappingSchema),
  transforms: z.array(TransformSchema),
  filters: z.array(FilterSchema),
  dedupe: DedupeRuleSchema.nullable(),
  derivedFields: z.array(DerivedFieldSchema),
  outputOptions: OutputOptionsSchema,
});

export type ReportConfig = z.infer<typeof ReportConfigSchema>;


