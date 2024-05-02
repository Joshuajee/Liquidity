import { Address } from "viem";

export interface IToken     {
    name: string,
    symbol: string,
    address: Address,
    icon: string
}