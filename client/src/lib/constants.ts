import { zeroAddress } from "viem";
import { IToken } from "./interfaces";

export const DEFAULT_TOKENS: IToken[] = [
    {
        name: "TUSDC",
        symbol: "TUSDC",
        address: zeroAddress,
        icon: ""
    },
    {
        name: "TUSDT",
        symbol: "TUSDT",
        address: zeroAddress,
        icon: ""
    },
    {
        name: "TJEE",
        symbol: "TJEE",
        address: zeroAddress,
        icon: ""
    }
]