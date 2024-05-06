import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Address } from "viem"
import { ADDRESS_TO_SYMBOL } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function weiToCurrency(value: bigint) : string {
  return  (value / (10n ** 18n)).toString()
}


export function getPair (token0: Address, token1: Address) {
  
  const symbol1 = ADDRESS_TO_SYMBOL[token0 as any]
  const symbol2 = ADDRESS_TO_SYMBOL[token1 as any]

  return {symbol1, symbol2}
}