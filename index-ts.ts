import { createWalletClient, custom, createPublicClient, defineChain, parseEther, formatEther, WalletClient, PublicClient, Chain } from 'viem';
import "viem/window";
import { contractAddress, abi } from './constants-ts';

// Get DOM elements
const connectButton = document.getElementById("connect-button") as HTMLButtonElement;
const getBalanceButton = document.getElementById("balance") as HTMLButtonElement;
const fundButton = document.getElementById("fund-button") as HTMLButtonElement;
const ethAmountInput = document.getElementById("input-amount") as HTMLInputElement;
const withdrawButton = document.getElementById("withdraw-button") as HTMLButtonElement;

// Declare variables with types
let walletClient: WalletClient;
let publicClient: PublicClient;

async function connect(): Promise<void> {
    if (typeof window.ethereum !== "undefined") {
        walletClient = createWalletClient({
            transport: custom(window.ethereum),
        });
        await walletClient.requestAddresses();
        connectButton.innerHTML = "Connected";
    } else {
        connectButton.innerHTML = "Please install MetaMask";
    }
}

async function getBalance(): Promise<void> {
    if (typeof window.ethereum !== "undefined") {
        try {
            publicClient = createPublicClient({
                transport: custom(window.ethereum),
            });
            const balance = await publicClient.getBalance({
                address: contractAddress,
            });
            console.log(formatEther(balance));
        } catch (error) {
            console.log(error);
        }
    } else {
        getBalanceButton.innerHTML = "Please install MetaMask";
    }
}

async function getCurrentChain(client: WalletClient | PublicClient): Promise<Chain> {
    const chainId = await client.getChainId();
    const currentChain = defineChain({
        id: chainId,
        name: "Custom Chain",
        nativeCurrency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
        },
        rpcUrls: {
            default: {
                http: ["http://localhost:8545"],
            },
        },
    });
    return currentChain;
}

async function fund(): Promise<void> {
    const ethAmount = ethAmountInput.value;
    console.log(`Funding with ${ethAmount}...`);

    if (typeof window.ethereum !== "undefined") {
        try {
            walletClient = createWalletClient({
                transport: custom(window.ethereum),
            });
            const [account] = await walletClient.requestAddresses();
            const currentChain = await getCurrentChain(walletClient);

            console.log("Processing transaction...");
            publicClient = createPublicClient({
                transport: custom(window.ethereum),
            });
            const { request } = await publicClient.simulateContract({
                address: contractAddress,
                abi,
                functionName: "fund",
                account,
                chain: currentChain,
                value: parseEther(ethAmount),
            });
            const hash = await walletClient.writeContract(request);
            console.log("Transaction processed: ", hash);
        } catch (error) {
            console.log(error);
        }
    } else {
        fundButton.innerHTML = "Please install MetaMask";
    }
}

async function withdraw(): Promise<void> {
    if (typeof window.ethereum !== "undefined") {
        try {
            walletClient = createWalletClient({
                transport: custom(window.ethereum),
            });
            const [account] = await walletClient.requestAddresses();
            const currentChain = await getCurrentChain(walletClient);

            console.log("Processing withdrawal...");
            publicClient = createPublicClient({
                transport: custom(window.ethereum),
            });
            
            const { request } = await publicClient.simulateContract({
                address: contractAddress,
                abi,
                functionName: "withdraw",
                account,
                chain: currentChain,
                value: parseEther("0"),
            });
            
            const hash = await walletClient.writeContract(request);
            console.log("Withdrawal processed: ", hash);
        } catch (error) {
            console.log(error);
        }
    } else {
        withdrawButton.innerHTML = "Please install MetaMask";
    }
}

// Add event listeners
connectButton.onclick = connect;
getBalanceButton.onclick = getBalance;
fundButton.onclick = fund;
withdrawButton.onclick = withdraw;