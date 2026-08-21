import {clsx, type ClassValue} from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs : ClassValue[]){
    return twMerge(clsx(inputs))
}

/**
 * Safely normalise any API list response to an array.
 * Handles: plain array, paged { items: [] }, or null/undefined.
 */
export function toArr<T = any>(data: any): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];
  if (Array.isArray(data.items)) return data.items as T[];
  return [];
}
