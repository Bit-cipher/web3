import { ethers, formatEther } from "ethers";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const convertToTokenUnits = (amount, decimals) => {
  return ethers.parseUnits(amount, decimals);
};

export const convertFromTokenUnits = (amount, decimals) => {
  return ethers.formatUnits(amount, decimals);
};

export const tokenABI = [
  // Only the essential functions are included here
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function name() view returns (string)", // Optional metadata function
];

const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;
const POLYGONZKEVM_API_KEY = process.env.POLYGONZKEVM_API_KEY;

const provider = new ethers.JsonRpcProvider("https://1rpc.io/polygon/zkevm");

export const createSingleWallet = async (req, res, next) => {
  try {
    const wallet1 = ethers.Wallet.createRandom();
    const seedPhrase = wallet1.mnemonic.phrase;
    const privateKey1 = wallet1.privateKey;

    const address1 = wallet1.address;

    const wallet = {
      address: address1,
      privateKey: privateKey1,
      mnemonic: seedPhrase,
    };
    res.status(200).json({
      message: "wallet created",
      data: wallet,
    });
  } catch (error) {
    res
      .status(404)
      .json({ message: "An error occurred", error: error.message });
  }
};

export const sendToken = async (req, res, next) => {
  try {
    const { toAddress, erc20contractAddress, amount, privateKey } = req.body;

    const walletInstance = new ethers.Wallet(privateKey, provider);
    const tokenContract = new ethers.Contract(
      erc20contractAddress,
      tokenABI,
      walletInstance
    );

    let tokenDecimals = 18; // Default decimals (ERC-20 standard)
    try {
      tokenDecimals = await tokenContract.decimals(); // Get the actual decimals if available
    } catch (decimalsError) {
      console.warn(
        "Could not fetch token decimals, using default 18 decimals."
      );
    }

    // const tokenDecimals = await tokenContract.decimals();
    const convertedAmount = convertToTokenUnits(amount, tokenDecimals);

    const tx = await tokenContract.transfer(toAddress, convertedAmount);

    res.status(200).json({
      message: "Transaction successful",
      data: tx.hash,
    });
  } catch (error) {
    res
      .status(404)
      .json({ message: "An error occurred", error: error.message });
  }
};

export const sendNativeToken = async (req, res, next) => {
  try {
    const { toAddress, amount, privateKey } = req.body;

    const walletInstance = new ethers.Wallet(privateKey, provider);

    const tx = await walletInstance.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amount.toString()),
    });

    res.status(200).json({
      message: "Transaction successful",
      data: tx.hash,
    });
  } catch (error) {
    res
      .status(404)
      .json({ message: "An error occurred", error: error.message });
  }
};

export const queryNativeBalance = async (req, res, next) => {
  try {
    const { walletAddress } = req.body;

    const balance = await provider.getBalance(walletAddress);
    const convertedBalance = ethers.formatEther(balance);

    res.status(200).json({
      message: "Here is your balance champ",
      data: convertedBalance,
    });
  } catch (error) {
    res
      .status(404)
      .json({ message: "An error occurred", error: error.message });
  }
};

export const queryErc20Balance = async (req, res, next) => {
  try {
    const { walletAddress, erc20contractAddress } = req.body;

    const tokenABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function name() view returns (string)"
    ];

    const tokenContract = new ethers.Contract(
      erc20contractAddress,
      tokenABI,
      provider
    );

    let tokenDecimals = 18; // Default decimals (ERC-20 standard)
    try {
      tokenDecimals = await tokenContract.decimals(); // Get the actual decimals if available
    } catch (decimalsError) {
      console.warn(
        "Could not fetch token decimals, using default 18 decimals."
      );
    }

    // Fetch balance
    const balance = await tokenContract.balanceOf(walletAddress);
    const convertedAmount = convertFromTokenUnits(balance, tokenDecimals);

    // Try to fetch token name (optional)
    let tokenName = "Unknown Token";
    try {
      tokenName = await tokenContract.name();
    } catch (nameError) {
      console.warn("Token contract does not implement `name()` function. Using default name.");
    }
    
    res.status(200).json({
      message: "Here is your balance champ",
      data: convertedAmount,
      tokenName,
    });
  } catch (error) {
    res
      .status(404)
      .json({ message: "An error occurred", error: error.message });
  }
};

export const fetchTransHistory = async (req, res, next) => {
  try {
    const { walletAddress } = req.body;

    const url = `https://api-cardona-zkevm.polygonscan.com/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${POLYGONZKEVM_API_KEY}`;

    const response = await axios.get(url);
    if (response.data.status === "1") {
      res.status(200).json({
        message: "Transaction History retrieved successfully",
        data: response.data.result,
      });
    } else {
      console.error("Error: ", response.data.message);
      res.status(500).json({
        message: "Failed to retrieve History",
        error: response.data.message,
      });
    }
  } catch (error) {
    res
      .status(404)
      .json({ message: "An error occurred", error: error.message });
  }
};
