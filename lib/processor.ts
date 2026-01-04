import type {
  ProcessedRow,
  ParsedCSV,
} from "./types";
import type { ReportConfig } from "./schemas";

export function processData(
  templateHeaders: string[],
  inputFiles: ParsedCSV[],
  config: ReportConfig
): ProcessedRow[] {
  let rows: ProcessedRow[] = [];

  // Step 1: Parse and map columns
  for (const file of inputFiles) {
    if (file.error || file.data.length === 0) continue;

    for (const sourceRow of file.data) {
      const row: ProcessedRow = {};
      
      // Apply column mappings
      for (const mapping of config.columnMappings) {
        if (mapping.sourceFile && mapping.sourceFile !== file.filename) {
          continue;
        }
        
        const sourceValue = sourceRow[mapping.sourceColumn];
        row[mapping.templateColumn] = sourceValue ?? "";
      }
      
      // Add source file if option is enabled
      if (config.outputOptions.includeSourceFile) {
        row._sourceFile = file.filename;
      }
      
      rows.push(row);
    }
  }

  // Step 2: Transform
  for (const transform of config.transforms) {
    rows = rows.map((row) => {
      const value = row[transform.column];
      if (value === undefined || value === null) return row;

      let transformed: any = value;

      switch (transform.type) {
        case "trim":
          transformed = String(value).trim();
          break;
        case "lowercase":
          transformed = String(value).toLowerCase();
          break;
        case "uppercase":
          transformed = String(value).toUpperCase();
          break;
        case "number-parse":
          transformed = parseFloat(String(value));
          if (isNaN(transformed)) transformed = value;
          break;
        case "date-parse":
          try {
            transformed = new Date(String(value)).toISOString();
          } catch {
            transformed = value;
          }
          break;
        case "replace":
          if (transform.params?.searchValue !== undefined) {
            transformed = String(value).replace(
              new RegExp(transform.params.searchValue, "g"),
              transform.params.replaceValue || ""
            );
          }
          break;
      }

      row[transform.column] = transformed;
      return row;
    });
  }

  // Step 3: Derive fields
  for (const derived of config.derivedFields) {
    rows = rows.map((row) => {
      let value: any = "";

      switch (derived.type) {
        case "concat":
          value = derived.sourceColumns
            .map((col) => String(row[col] || ""))
            .join(derived.separator || "");
          break;
        case "fallback":
          value =
            derived.sourceColumns
              .map((col) => row[col])
              .find((v) => v !== undefined && v !== null && v !== "") ??
            derived.defaultValue ??
            "";
          break;
        case "add":
          value = derived.sourceColumns
            .map((col) => parseFloat(String(row[col] || 0)))
            .reduce((a, b) => a + b, 0);
          break;
        case "subtract":
          if (derived.sourceColumns.length >= 2) {
            value =
              parseFloat(String(row[derived.sourceColumns[0]] || 0)) -
              parseFloat(String(row[derived.sourceColumns[1]] || 0));
          }
          break;
        case "multiply":
          value = derived.sourceColumns
            .map((col) => parseFloat(String(row[col] || 1)))
            .reduce((a, b) => a * b, 1);
          break;
        case "divide":
          if (derived.sourceColumns.length >= 2) {
            const divisor = parseFloat(String(row[derived.sourceColumns[1]] || 1));
            value =
              divisor !== 0
                ? parseFloat(String(row[derived.sourceColumns[0]] || 0)) / divisor
                : 0;
          }
          break;
      }

      row[derived.name] = value;
      return row;
    });
  }

  // Step 4: Filter
  for (const filter of config.filters) {
    rows = rows.filter((row) => {
      const value = row[filter.column];

      switch (filter.operator) {
        case "equals":
          return String(value) === String(filter.value);
        case "not-equals":
          return String(value) !== String(filter.value);
        case "contains":
          return String(value).toLowerCase().includes(String(filter.value || "").toLowerCase());
        case "not-contains":
          return !String(value).toLowerCase().includes(String(filter.value || "").toLowerCase());
        case "greater-than":
          return parseFloat(String(value)) > parseFloat(String(filter.value || 0));
        case "less-than":
          return parseFloat(String(value)) < parseFloat(String(filter.value || 0));
        case "is-empty":
          return value === undefined || value === null || String(value).trim() === "";
        case "is-not-empty":
          return value !== undefined && value !== null && String(value).trim() !== "";
        default:
          return true;
      }
    });
  }

  // Step 5: Dedupe
  if (config.dedupe && config.dedupe.keyColumns.length > 0) {
    const seen = new Map<string, ProcessedRow>();
    
    rows = rows.filter((row) => {
      const key = config.dedupe!.keyColumns
        .map((col) => String(row[col] ?? ""))
        .join("|");
      
      if (!seen.has(key)) {
        seen.set(key, row);
        return true;
      }
      
      const existing = seen.get(key)!;
      
      if (config.dedupe!.strategy === "last") {
        seen.set(key, row);
        return false; // Remove the previous one later
      } else if (config.dedupe!.strategy === "merge") {
        // Merge: combine values, prefer non-empty
        for (const col in row) {
          if (!row[col] && existing[col]) {
            row[col] = existing[col];
          }
        }
        seen.set(key, row);
        return false;
      }
      
      return false; // "first" strategy - keep first, skip this
    });
  }

  // Step 6: Output formatting
  // Ensure all template columns exist
  rows = rows.map((row) => {
    const formatted: ProcessedRow = {};
    
    // Add template columns in order
    for (const header of templateHeaders) {
      formatted[header] = row[header] ?? "";
    }
    
    // Add source file if enabled
    if (config.outputOptions.includeSourceFile && row._sourceFile) {
      formatted["SourceFile"] = row._sourceFile;
    }
    
    return formatted;
  });

  return rows;
}

