import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Address } from "viem"
import { ADDRESS_TO_SYMBOL } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function weiToEther(value: bigint) : string {
  return Number(value / (10n ** 18n)).toString();
}

export function weiToCurrency(value: bigint) : string {
  const etherValue = Number(value / (10n ** 18n));

  if (etherValue < 1000) {
    return  Number(etherValue).toFixed(4)
  }

  if (etherValue < 1000000) {
    return  Number(etherValue / 1000).toFixed(4) + "K"
  }

  if (etherValue < 1000000000) {
    return  Number(etherValue / 1000000).toFixed(4) + "M"
  }

  if (etherValue < 1000000000000) {
    return  Number(etherValue / 1000000000).toFixed(4) + "B"
  }

  return  Number(etherValue / 1000000000000).toFixed(4) + "T"

}


export function getPair(token0: Address, token1: Address) {
  const symbol1 = ADDRESS_TO_SYMBOL[token0 as any]
  const symbol2 = ADDRESS_TO_SYMBOL[token1 as any]
  return {symbol1, symbol2}
}

export const getTokenName = (token: Address) => {
  return ADDRESS_TO_SYMBOL[token as any]
}

export const sortTokens = (tokenA: Address, tokenB: Address) => {
  return tokenA > tokenB ?  [tokenA, tokenB] : [tokenB, tokenA]
}