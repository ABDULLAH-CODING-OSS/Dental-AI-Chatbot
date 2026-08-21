import { ReceiptData } from "./ReceiptCard";
import { ClinicInfo, DoctorInfo, ServiceInfo } from "./ListingsCard";

export interface ParsedContent {
  mainText: string;
  receipt?: ReceiptData;
  slots?: {
    doctorName: string;
    date: string;
    times: string[];
  };
  listings?:
    | { type: "clinics"; items: ClinicInfo[] }
    | { type: "doctors"; items: DoctorInfo[] }
    | { type: "services"; items: ServiceInfo[] };
}

/**
 * Parse receipt data from chat response
 * Backend sends receipt as a structured object, but also as formatted markdown in the answer
 */
export function parseReceiptFromContent(
  content: string,
  receipt?: Record<string, any>
): ReceiptData | undefined {
  if (receipt && receipt.confirmation_number) {
    return {
      confirmation_number: receipt.confirmation_number,
      doctor: receipt.doctor || "",
      specialty: receipt.specialty || "",
      date: receipt.date || "",
      time: receipt.time || "",
      price: typeof receipt.price === "number" ? receipt.price : parseFloat(receipt.price) || 0,
      status: receipt.status || "pending",
    };
  }
  return undefined;
}

/**
 * Parse available time slots from message content
 * Format: "Available slots for {doctorName} on {date}:\n- {time}\n- {time}..."
 */
export function parseAvailableSlots(content: string): ParsedContent["slots"] | undefined {
  const slotsMatch = content.match(/Available slots for (.+?) on (.+?):\n([\s\S]*?)(?:\n\n|$)/i);
  if (!slotsMatch) return undefined;

  const doctorName = slotsMatch[1].trim();
  const date = slotsMatch[2].trim();
  const slotsText = slotsMatch[3];

  const times = slotsText
    .split("\n")
    .filter((line) => line.trim().startsWith("-"))
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter((time) => time.length > 0);

  if (times.length === 0) return undefined;

  return { doctorName, date, times };
}

/**
 * Parse clinic listings from message content
 * Format: "{id}. {name} | Location: {address} | Hours: {hours}"
 */
export function parseClinicListings(content: string): ClinicInfo[] | undefined {
  const clinicPattern = /(\d+)\.\s+(.+?)\s*\|\s*Location:\s*(.+?)\s*\|\s*Hours:\s*(.+?)(?:\n|$)/gi;
  const matches = [...content.matchAll(clinicPattern)];

  if (matches.length === 0) return undefined;

  return matches.map((match) => ({
    id: parseInt(match[1], 10),
    name: match[2].trim(),
    address: match[3].trim(),
    hours: match[4].trim(),
  }));
}

/**
 * Parse doctor listings from message content
 * Format: "{id}. {name} ({specialty}) | Fee: ${fee} | Slots: {slots}"
 */
export function parseDoctorListings(content: string): DoctorInfo[] | undefined {
  const doctorPattern = /(\d+)\.\s+(.+?)\s*\((.+?)\)\s*\|\s*Fee:\s*\$?([\d.]+)\s*(?:\|\s*Slots:\s*(.+?))?(?:\n|$)/gi;
  const matches = [...content.matchAll(doctorPattern)];

  if (matches.length === 0) return undefined;

  return matches.map((match) => ({
    id: parseInt(match[1], 10),
    name: match[2].trim(),
    specialty: match[3].trim(),
    fee: parseFloat(match[4]),
    slots: match[5]?.trim(),
  }));
}

/**
 * Parse service listings from message content
 * Format: "{id}. {name} | Base price: ${price}"
 */
export function parseServiceListings(content: string): ServiceInfo[] | undefined {
  const servicePattern = /(\d+)\.\s+(.+?)\s*\|\s*Base price:\s*\$?([\d.]+)/gi;
  const matches = [...content.matchAll(servicePattern)];

  if (matches.length === 0) return undefined;

  return matches.map((match) => ({
    id: parseInt(match[1], 10),
    name: match[2].trim(),
    price: parseFloat(match[3]),
  }));
}

/**
 * Remove structural markdown from content to leave natural text
 * This strips out the patterns we're parsing separately
 */
export function removeStructuredPatterns(content: string): string {
  let cleaned = content;

  // Remove receipt markdown (keep main text)
  cleaned = cleaned
    .replace(/\*\*Confirmation #:\*\*[^\n]*\n?/g, "")
    .replace(/\*\*Doctor:\*\*[^\n]*\n?/g, "")
    .replace(/\*\*Date:\*\*[^\n]*\n?/g, "")
    .replace(/\*\*Fee:\*\*[^\n]*\n?/g, "");

  // Remove "Available slots" section and leave just the natural text before it
  const beforeSlots = cleaned.split(/Available slots for .+? on .+?:/i)[0];
  if (beforeSlots !== cleaned) {
    cleaned = beforeSlots;
  }

  // Remove listing patterns but keep intro text
  // e.g., "Here are the available doctors:" should stay
  const clinicListStart = cleaned.search(/\d+\.\s+\w+\s*\|\s*Location:/i);
  if (clinicListStart > 0) {
    cleaned = cleaned.substring(0, clinicListStart);
  }

  const doctorListStart = cleaned.search(/\d+\.\s+\w+\s*\([^)]+\)\s*\|\s*Fee:/i);
  if (doctorListStart > 0) {
    cleaned = cleaned.substring(0, doctorListStart);
  }

  const serviceListStart = cleaned.search(/\d+\.\s+\w+\s*\|\s*Base price:/i);
  if (serviceListStart > 0) {
    cleaned = cleaned.substring(0, serviceListStart);
  }

  return cleaned.trim();
}

/**
 * Main parser function that orchestrates all parsing
 */
export function parseMessageContent(
  content: string,
  receiptData?: Record<string, any>
): ParsedContent {
  const receipt = parseReceiptFromContent(content, receiptData);
  const slots = parseAvailableSlots(content);
  const clinicListings = parseClinicListings(content);
  const doctorListings = parseDoctorListings(content);
  const serviceListings = parseServiceListings(content);

  const listings = clinicListings
    ? { type: "clinics" as const, items: clinicListings }
    : doctorListings
      ? { type: "doctors" as const, items: doctorListings }
      : serviceListings
        ? { type: "services" as const, items: serviceListings }
        : undefined;

  const mainText = removeStructuredPatterns(content);

  return {
    mainText,
    receipt,
    slots,
    listings,
  };
}
