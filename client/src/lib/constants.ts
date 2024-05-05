import { IToken } from "./interfaces";

export const FACTORY = import.meta.env.VITE_LFACTORY
export const ROUTER = import.meta.env.VITE_LROUTER

export const DEFAULT_TOKENS: IToken[] = [
    {
        name: "Test USDC",
        symbol: "TUSDC",
        address: import.meta.env.VITE_USDC,
        icon: "/coin/usdc.jpg"
    },
    {
        name: "Test USDT",
        symbol: "TUSDT",
        address: import.meta.env.VITE_USDT,
        icon: "/coin/tether.jpg"
    },
    {
        name: "Test WBTC",
        symbol: "TWBTC",
        address: import.meta.env.VITE_WBTC,
        icon: "/coin/btc.jpg"
    },
    {
        name: "Test DAI",
        symbol: "TDAI",
        address: import.meta.env.VITE_DAI,
        icon: "/coin/dai.jpg"
    }
]



export const ADDRESS_TO_SYMBOL = {
    [import.meta.env.VITE_USDC]: "TUSDC",
    [import.meta.env.VITE_USDT]: "TUSDT",
    [import.meta.env.VITE_WBTC]: "TWBTC",
    [import.meta.env.VITE_DAI]: "TDAI"
}