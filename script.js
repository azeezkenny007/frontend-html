import { createWalletClient, custom,createPublicClient,defineChain,parseEther,formatEther   } from 'https://esm.sh/viem'
import {contractAddress, abi} from './constants-js.js'
const connectButton = document.getElementById("connect-button");
const getBalanceButton = document.getElementById("balance");
const fundButton = document.getElementById("fund-button");
const ethAmountInput = document.getElementById("input-amount");
const withdrawButton = document.getElementById("withdraw-button");


let walletClient;
let publicClient;
async function connect() {
    if (typeof window.ethereum !== "undefined") {
      walletClient = createWalletClient({
        transport: custom(window.ethereum),
      })
      await walletClient.requestAddresses()
      connectButton.innerHTML = "Connected"
    } else {
      connectButton.innerHTML = "Please install MetaMask"
    }
  }



  async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
      try {
        publicClient = createPublicClient({
          transport: custom(window.ethereum),
        })
        const balance = await publicClient.getBalance({
          address: contractAddress,
        })
        console.log(formatEther(balance))
      } catch (error) {
        console.log(error)
      }
    } else {
      getBalanceButton.innerHTML = "Please install MetaMask"
    }
  }

  async function getCurrentChain(client) {
    const chainId = await client.getChainId()
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
    })
    return currentChain
  }




  async function fund() {
    const ethAmount = ethAmountInput.value
    console.log(`Funding with ${ethAmount}...`)
  
    if (typeof window.ethereum !== "undefined") {
      try {
        walletClient = createWalletClient({
          transport: custom(window.ethereum),
        })
        const [account] = await walletClient.requestAddresses()
        const currentChain = await getCurrentChain(walletClient)
  
        console.log("Processing transaction...")
        publicClient = createPublicClient({
          transport: custom(window.ethereum),
        })
        const { request } = await publicClient.simulateContract({
          address: contractAddress,
          abi,
          functionName: "fund",
          account,
          chain: currentChain,
          value: parseEther(ethAmount),
        })
        const hash = await walletClient.writeContract(request)
        console.log("Transaction processed: ", hash)
      } catch (error) {
        console.log(error)
      }
    } else {
      fundButton.innerHTML = "Please install MetaMask"
    }
  }


async function withdraw() {
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
        value: parseEther("0"), // Explicitly setting value to 0
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

// Add event listener
withdrawButton.onclick = withdraw;
getBalanceButton.onclick= getBalance
connectButton.onclick= connect
fundButton.onclick= fund




