import { WagmiProvider, createConfig, http } from "wagmi";
import { hardhat, liskSepolia, localhost } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { ReactNode } from "react";

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [liskSepolia, hardhat],
    transports: {
      // RPC URL for each chain
      [liskSepolia.id]: http(
        `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_ID}`,
      ),
      [localhost.id]: http(
        `http://127.0.0.1:8545`,
      ),
      [hardhat.id]: http(
        `http://127.0.0.1:8545`,
      ),
    },

    // Required API Keys
    walletConnectProjectId: String(import.meta.env.VITE_WALLETCONNECT_PROJECT_ID),

    // Required App Info
    appName: "Liquidity",

    // Optional App Info
    appDescription: "Your App Description",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children : ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};