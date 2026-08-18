import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes and parses an ISO date string into a Date object.
 * If the string lacks timezone indicators ('Z' or offset), it is assumed to be UTC
 * so that JavaScript correctly converts it to the user's local timezone.
 */
export function parseISODate(dateInput: string | Date | undefined | null): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  
  let str = String(dateInput).trim();
  if (!str) return null;

  const hasTimezone = str.endsWith("Z") || /[+-]\d{2}(:?\d{2})?$/.test(str);
  if (!hasTimezone) {
    str = str.replace(" ", "T") + "Z";
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Formats a timestamp into a human-readable local time string with correct hours & minutes.
 * Examples: "Today, 11:00 AM", "Yesterday, 4:15 PM", "Aug 18, 11:00 AM"
 */
export function formatConsultationTime(dateInput: string | Date | undefined | null): string {
  const d = parseISODate(dateInput);
  if (!d) return "Recent";

  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const isCurrentYear = d.getFullYear() === now.getFullYear();

  const timeStr = d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) {
    return `Today, ${timeStr}`;
  }
  if (isYesterday) {
    return `Yesterday, ${timeStr}`;
  }

  const dateOptions: Intl.DateTimeFormatOptions = isCurrentYear
    ? { month: "short", day: "numeric" }
    : { month: "short", day: "numeric", year: "numeric" };

  const dateStr = d.toLocaleDateString([], dateOptions);
  return `${dateStr}, ${timeStr}`;
}

/**
 * Formats time only in local format, e.g. "11:00 AM"
 */
export function formatTimeOnly(dateInput: string | Date | undefined | null): string {
  const d = parseISODate(dateInput);
  if (!d) return "";
  return d.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Formats date only in local format, e.g. "Aug 18, 2026"
 */
export function formatDateOnly(dateInput: string | Date | undefined | null): string {
  const d = parseISODate(dateInput);
  if (!d) return "";
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Converts markdown content into clean, structural plain text suitable for clipboard copy.
 * Formats headings, bullet points, numbered lists, and aligns tables with column padding.
 */
export function formatMarkdownToStructuredText(markdown: string): string {
  if (!markdown) return "";
  
  let text = markdown;
  text = text.replace(/<br\s*\/?>/gi, "\n");

  const lines = text.split("\n");
  const processedLines: string[] = [];
  let tableBuffer: string[][] = [];

  function flushTableBuffer() {
    if (tableBuffer.length === 0) return;

    // Filter out separator rows
    const dataRows = tableBuffer.filter(row => !row.every(c => /^[-:]+$/.test(c)));
    if (dataRows.length === 0) {
      tableBuffer = [];
      return;
    }

    // Determine max width for each column
    const numCols = Math.max(...dataRows.map(r => r.length));
    const colWidths = Array(numCols).fill(0);

    dataRows.forEach(row => {
      row.forEach((cell, idx) => {
        if (cell.length > colWidths[idx]) {
          colWidths[idx] = cell.length;
        }
      });
    });

    processedLines.push("");
    dataRows.forEach((row, rowIdx) => {
      const formattedRow = row
        .map((cell, idx) => cell.padEnd(colWidths[idx] || 0, " "))
        .join(" | ");
      processedLines.push(formattedRow);

      if (rowIdx === 0 && dataRows.length > 1) {
        // Divider under header
        const divider = colWidths.map(w => "-".repeat(w)).join("-|-");
        processedLines.push(divider);
      }
    });
    processedLines.push("");
    tableBuffer = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if line is a markdown table row
    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line
        .split("|")
        .slice(1, -1)
        .map(c => c.trim().replace(/\*\*(.*?)\*\*/g, "$1").replace(/__(.*?)__/g, "$1"));
      tableBuffer.push(cells);
      continue;
    } else {
      if (tableBuffer.length > 0) {
        flushTableBuffer();
      }
    }

    let modifiedLine = line;

    // Convert Headings: ### Heading -> Heading with underline
    if (/^#{1,6}\s+(.*)/.test(modifiedLine)) {
      const headingText = modifiedLine.replace(/^#{1,6}\s+/, "").trim();
      modifiedLine = `\n${headingText}\n${"-".repeat(Math.min(headingText.length, 36))}`;
    }

    // Convert bullet lists: * or - item -> • item
    if (/^[\*\-]\s+(.*)/.test(modifiedLine)) {
      modifiedLine = modifiedLine.replace(/^[\*\-]\s+/, "• ");
    }

    // Strip bold & italics
    modifiedLine = modifiedLine.replace(/\*\*(.*?)\*\*/g, "$1");
    modifiedLine = modifiedLine.replace(/__(.*?)__/g, "$1");
    modifiedLine = modifiedLine.replace(/\*([^\*]+)\*/g, "$1");
    modifiedLine = modifiedLine.replace(/_([^_]+)_/g, "$1");

    // Strip inline code
    modifiedLine = modifiedLine.replace(/`([^`]+)`/g, "$1");

    // Strip markdown links
    modifiedLine = modifiedLine.replace(/\[(.*?)\]\((.*?)\)/g, "$1 ($2)");

    processedLines.push(modifiedLine);
  }

  if (tableBuffer.length > 0) {
    flushTableBuffer();
  }

  return processedLines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
