import { ethers, formatEther } from "ethers";
import axios from "axios";
import dotenv from "dotenv";
import User from "../models/user.js";

dotenv.config();

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");

export const getETHbal = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    console.log(walletAddress);

    const balance = await provider.getBalance(walletAddress);
    const formattedBalnace = formatEther(balance);
    console.log(formattedBalnace);

    res
      .status(200)
      .json({ message: "current ETHEREUM balance:", data: formattedBalnace });
  } catch (error) {
    res.status(404).json(error.message);
  }
};

export const getETHTransHistory = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${walletAddress}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${ETHERSCAN_API_KEY}`;

    const response = await axios.get(url);
    if (response.data.status === "1") {
      res.status(200).json({
        message: "ETH Transaction History retrieved successfully",
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

export const createNewAddress = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const wallet = ethers.Wallet.createRandom();

    console.log("Address:", wallet.address);
    console.log("Private Key:", wallet.privateKey);
    // console.log("Mnemonic:", wallet.mnemonic.phrase);

    const user = new User({
      userName,
      password,
      address: wallet.address,
      privateKey: wallet.privateKey,
    });

    await user.save();

    res
      .status(200)
      .json({ message: "address saved to database", data: wallet.address });
  } catch (error) {
    res
      .status(404)
      .json({ message: "An error occurred", error: error.message });
  }
};
