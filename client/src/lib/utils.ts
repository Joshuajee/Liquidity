import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function weiToCurrency(value: bigint) : string {
  return  (value / (10n ** 18n)).toString()
}