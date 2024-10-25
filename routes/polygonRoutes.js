import express from "express";
import {
  createSingleWallet,
  fetchTransHistory,
  queryErc20Balance,
  queryNativeBalance,
  sendNativeToken,
  sendToken,
} from "../controller/polygon.js";

const router = express.Router();
router.route("/pol/create-wallet").post(createSingleWallet);
router.route("/pol/send-token").post(sendToken);
router.route("/pol/send-native-token").post(sendNativeToken);
router.route("/pol/get-erc20-balance").get(queryErc20Balance);
router.route("/pol/get-native-balance").get(queryNativeBalance);
router.route("/pol/get-trans-history").get(fetchTransHistory);

export default router;
