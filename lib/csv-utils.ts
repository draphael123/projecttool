import Papa from "papaparse";
import type { ParsedCSV, ProcessedRow, ReportConfig } from "./types";

export function parseCSV(file: File): Promise<ParsedCSV> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          resolve({
            filename: file.name,
            headers: results.meta.fields || [],
            data: [],
            rowCount: 0,
            error: results.errors.map((e) => e.message).join(", "),
          });
          return;
        }

        resolve({
          filename: file.name,
          headers: results.meta.fields || [],
          data: results.data as Record<string, any>[],
          rowCount: results.data.length,
        });
      },
      error: (error) => {
        resolve({
          filename: file.name,
          headers: [],
          data: [],
          rowCount: 0,
          error: error.message,
        });
      },
    });
  });
}

export function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "")
    .replace(/\s+/g, "");
}

export function calculateSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeHeader(str1);
  const norm2 = normalizeHeader(str2);
  
  if (norm1 === norm2) return 1.0;
  
  // Levenshtein-like similarity (simple version)
  const longer = norm1.length > norm2.length ? norm1 : norm2;
  const shorter = norm1.length > norm2.length ? norm2 : norm1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

export function autoMapColumns(
  templateHeaders: string[],
  sourceHeaders: string[],
  threshold: number = 0.6
): Map<string, string> {
  const mapping = new Map<string, string>();
  const usedSourceHeaders = new Set<string>();
  
  for (const templateHeader of templateHeaders) {
    let bestMatch: string | null = null;
    let bestScore = threshold;
    
    for (const sourceHeader of sourceHeaders) {
      if (usedSourceHeaders.has(sourceHeader)) continue;
      
      const score = calculateSimilarity(templateHeader, sourceHeader);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = sourceHeader;
      }
    }
    
    if (bestMatch) {
      mapping.set(templateHeader, bestMatch);
      usedSourceHeaders.add(bestMatch);
    }
  }
  
  return mapping;
}

export function downloadCSV(data: ProcessedRow[], headers: string[], filename: string = "merged-report.csv") {
  const csv = Papa.unparse({
    fields: headers,
    data: data.map((row) => headers.map((h) => row[h] ?? "")),
  });
  
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}



