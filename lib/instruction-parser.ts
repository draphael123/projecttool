import type { ReportConfig } from "./schemas";
import type { ColumnMapping, Filter, Transform, DedupeRule, DerivedField } from "./types";
import { autoMapColumns, calculateSimilarity } from "./csv-utils";

export interface ParsedInstructions {
  columnMappings: ColumnMapping[];
  filters: Filter[];
  transforms: Transform[];
  dedupe: DedupeRule | null;
  derivedFields: DerivedField[];
  outputOptions: {
    includeSourceFile: boolean;
    templateColumnOrder: boolean;
  };
}

/**
 * Parse natural language instructions and extract configuration requirements
 */
export function parseInstructions(
  instructions: string,
  quickPrompt: string,
  templateHeaders: string[],
  sourceHeaders: string[]
): ParsedInstructions {
  const combinedText = `${quickPrompt || ""} ${instructions || ""}`.toLowerCase().trim();
  
  if (!combinedText) {
    return {
      columnMappings: [],
      filters: [],
      transforms: [],
      dedupe: null,
      derivedFields: [],
      outputOptions: {
        includeSourceFile: false,
        templateColumnOrder: true,
      },
    };
  }

  const result: ParsedInstructions = {
    columnMappings: [],
    filters: [],
    transforms: [],
    dedupe: null,
    derivedFields: [],
    outputOptions: {
      includeSourceFile: combinedText.includes("source file") || combinedText.includes("include source"),
      templateColumnOrder: !combinedText.includes("don't use template order"),
    },
  };

  // Parse column mappings
  result.columnMappings = parseColumnMappings(combinedText, templateHeaders, sourceHeaders);

  // Parse filters
  result.filters = parseFilters(combinedText, templateHeaders);

  // Parse transforms
  result.transforms = parseTransforms(combinedText, templateHeaders);

  // Parse deduplication
  result.dedupe = parseDeduplication(combinedText, templateHeaders);

  // Parse derived fields
  result.derivedFields = parseDerivedFields(combinedText, templateHeaders);

  return result;
}

function parseColumnMappings(
  text: string,
  templateHeaders: string[],
  sourceHeaders: string[]
): ColumnMapping[] {
  const mappings: ColumnMapping[] = [];

  // Pattern: "map 'source' to 'template'" or "map source to template"
  const mapPattern = /map\s+['"]?([^'"]+)['"]?\s+to\s+['"]?([^'"]+)['"]?/gi;
  let match;
  while ((match = mapPattern.exec(text)) !== null) {
    const sourceCol = match[1].trim();
    const templateCol = match[2].trim();
    
    // Find best matching headers
    const sourceMatch = findBestMatch(sourceCol, sourceHeaders);
    const templateMatch = findBestMatch(templateCol, templateHeaders);
    
    if (sourceMatch && templateMatch) {
      mappings.push({
        templateColumn: templateMatch,
        sourceColumn: sourceMatch,
      });
    }
  }

  // If no explicit mappings found, try auto-mapping
  if (mappings.length === 0 && templateHeaders.length > 0 && sourceHeaders.length > 0) {
    const autoMappings = autoMapColumns(templateHeaders, sourceHeaders);
    Array.from(autoMappings.entries()).forEach(([template, source]) => {
      mappings.push({
        templateColumn: template,
        sourceColumn: source,
      });
    });
  }

  return mappings;
}

function parseFilters(text: string, availableHeaders: string[]): Filter[] {
  const filters: Filter[] = [];

  // Pattern: "filter out rows where X is Y" or "exclude where X equals Y"
  const filterPatterns = [
    {
      pattern: /(?:filter out|exclude|remove).*?where\s+['"]?([^'"]+)['"]?\s+(?:is|equals?|==)\s+['"]?([^'"]+)['"]?/gi,
      operator: "not-equals" as const,
    },
    {
      pattern: /(?:filter|include|keep).*?where\s+['"]?([^'"]+)['"]?\s+(?:is|equals?|==)\s+['"]?([^'"]+)['"]?/gi,
      operator: "equals" as const,
    },
    {
      pattern: /(?:filter out|exclude).*?where\s+['"]?([^'"]+)['"]?\s+contains?\s+['"]?([^'"]+)['"]?/gi,
      operator: "not-contains" as const,
    },
    {
      pattern: /(?:filter|include).*?where\s+['"]?([^'"]+)['"]?\s+contains?\s+['"]?([^'"]+)['"]?/gi,
      operator: "contains" as const,
    },
    {
      pattern: /(?:filter out|exclude).*?where\s+['"]?([^'"]+)['"]?\s+is\s+(?:empty|null|blank)/gi,
      operator: "is-not-empty" as const,
    },
    {
      pattern: /(?:filter|include).*?where\s+['"]?([^'"]+)['"]?\s+is\s+(?:empty|null|blank)/gi,
      operator: "is-empty" as const,
    },
  ];

  for (const { pattern, operator } of filterPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const columnName = match[1].trim();
      const value = match[2]?.trim();
      const columnMatch = findBestMatch(columnName, availableHeaders);
      
      if (columnMatch) {
        filters.push({
          column: columnMatch,
          operator,
          value: value || undefined,
        });
      }
    }
  }

  return filters;
}

function parseTransforms(text: string, availableHeaders: string[]): Transform[] {
  const transforms: Transform[] = [];

  // Trim whitespace
  if (text.includes("trim") || text.includes("remove whitespace")) {
    const trimPattern = /(?:trim|remove whitespace).*?(?:from|on|column)\s+['"]?([^'"]+)['"]?/gi;
    let match;
    while ((match = trimPattern.exec(text)) !== null) {
      const columnName = match[1].trim();
      const columnMatch = findBestMatch(columnName, availableHeaders);
      if (columnMatch) {
        transforms.push({ column: columnMatch, type: "trim" });
      }
    }
    // If no specific column mentioned, apply to all text columns
    if (!match && text.includes("trim")) {
      availableHeaders.forEach((header) => {
        if (!transforms.some((t) => t.column === header && t.type === "trim")) {
          transforms.push({ column: header, type: "trim" });
        }
      });
    }
  }

  // Lowercase
  if (text.includes("lowercase") || text.includes("lower case")) {
    const pattern = /(?:lowercase|lower case).*?(?:from|on|column)\s+['"]?([^'"]+)['"]?/gi;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const columnName = match[1].trim();
      const columnMatch = findBestMatch(columnName, availableHeaders);
      if (columnMatch) {
        transforms.push({ column: columnMatch, type: "lowercase" });
      }
    }
  }

  // Uppercase
  if (text.includes("uppercase") || text.includes("upper case")) {
    const pattern = /(?:uppercase|upper case).*?(?:from|on|column)\s+['"]?([^'"]+)['"]?/gi;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const columnName = match[1].trim();
      const columnMatch = findBestMatch(columnName, availableHeaders);
      if (columnMatch) {
        transforms.push({ column: columnMatch, type: "uppercase" });
      }
    }
  }

  // Date format
  const datePattern = /(?:convert|format|parse).*?(?:date|dates).*?(?:to|as)\s+['"]?([^'"]+)['"]?/gi;
  let dateMatch;
  while ((dateMatch = datePattern.exec(text)) !== null) {
    const dateFormat = dateMatch[1].trim();
    // Find date columns
    const dateKeywords = ["date", "time", "created", "updated", "modified"];
    availableHeaders.forEach((header) => {
      if (dateKeywords.some((keyword) => header.toLowerCase().includes(keyword))) {
        transforms.push({
          column: header,
          type: "date-parse",
          params: { dateFormat },
        });
      }
    });
  }

  // Number parse
  if (text.includes("parse number") || text.includes("convert to number")) {
    const pattern = /(?:parse number|convert to number).*?(?:from|on|column)\s+['"]?([^'"]+)['"]?/gi;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const columnName = match[1].trim();
      const columnMatch = findBestMatch(columnName, availableHeaders);
      if (columnMatch) {
        transforms.push({ column: columnMatch, type: "number-parse" });
      }
    }
  }

  return transforms;
}

function parseDeduplication(text: string, availableHeaders: string[]): DedupeRule | null {
  if (!text.includes("duplicate") && !text.includes("dedupe") && !text.includes("remove duplicate")) {
    return null;
  }

  const keyColumns: string[] = [];

  // Pattern: "remove duplicates based on X" or "dedupe by X"
  const dedupePattern = /(?:remove duplicates?|dedupe|deduplicate).*?(?:based on|by|using)\s+['"]?([^'"]+)['"]?/gi;
  let match;
  while ((match = dedupePattern.exec(text)) !== null) {
    const columnName = match[1].trim();
    const columnMatch = findBestMatch(columnName, availableHeaders);
    if (columnMatch && !keyColumns.includes(columnMatch)) {
      keyColumns.push(columnMatch);
    }
  }

  // If no specific column mentioned, look for common key columns
  if (keyColumns.length === 0) {
    const commonKeys = ["email", "id", "email address", "customer id", "user id"];
    for (const key of commonKeys) {
      const match = findBestMatch(key, availableHeaders);
      if (match && !keyColumns.includes(match)) {
        keyColumns.push(match);
        break;
      }
    }
  }

  if (keyColumns.length === 0) {
    return null;
  }

  // Determine strategy
  let strategy: "first" | "last" | "merge" = "first";
  if (text.includes("keep last") || text.includes("keep most recent")) {
    strategy = "last";
  } else if (text.includes("merge")) {
    strategy = "merge";
  }

  return {
    keyColumns,
    strategy,
  };
}

function parseDerivedFields(text: string, availableHeaders: string[]): DerivedField[] {
  const derivedFields: DerivedField[] = [];

  // Pattern: "create X by concatenating Y and Z" or "combine Y and Z into X"
  const concatPattern = /(?:create|make|add|new field)\s+['"]?([^'"]+)['"]?\s+(?:by|from)\s+(?:concatenating|combining|joining).*?['"]?([^'"]+)['"]?\s+(?:and|&)\s+['"]?([^'"]+)['"]?/gi;
  let match;
  while ((match = concatPattern.exec(text)) !== null) {
    const fieldName = match[1].trim();
    const col1 = match[2].trim();
    const col2 = match[3].trim();
    
    const col1Match = findBestMatch(col1, availableHeaders);
    const col2Match = findBestMatch(col2, availableHeaders);
    
    if (col1Match && col2Match) {
      derivedFields.push({
        name: fieldName,
        type: "concat",
        sourceColumns: [col1Match, col2Match],
        separator: " ",
      });
    }
  }

  return derivedFields;
}

function findBestMatch(searchTerm: string, headers: string[]): string | null {
  if (headers.length === 0) return null;
  
  const normalized = searchTerm.toLowerCase().trim();
  let bestMatch: string | null = null;
  let bestScore = 0.5; // Minimum threshold

  for (const header of headers) {
    const score = calculateSimilarity(normalized, header);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = header;
    }
  }

  return bestMatch;
}

/**
 * Merge parsed instructions with existing config, giving priority to explicit config settings
 */
export function mergeInstructionsWithConfig(
  parsed: ParsedInstructions,
  existing: ReportConfig
): ReportConfig {
  return {
    instructions: existing.instructions,
    quickPrompt: existing.quickPrompt,
    columnMappings: existing.columnMappings.length > 0 
      ? existing.columnMappings 
      : parsed.columnMappings,
    filters: [...existing.filters, ...parsed.filters],
    transforms: [...existing.transforms, ...parsed.transforms],
    dedupe: existing.dedupe || parsed.dedupe,
    derivedFields: [...existing.derivedFields, ...parsed.derivedFields],
    outputOptions: {
      includeSourceFile: existing.outputOptions.includeSourceFile || parsed.outputOptions.includeSourceFile,
      templateColumnOrder: existing.outputOptions.templateColumnOrder && parsed.outputOptions.templateColumnOrder,
    },
  };
}

