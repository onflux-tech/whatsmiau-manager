import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const RECORD_ID_RE = /^[a-z0-9]+$/i;

export function sanitizeId(id: string | undefined | null): string {
  if (!id || !RECORD_ID_RE.test(id)) return "";
  return id;
}
