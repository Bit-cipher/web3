import express from "express";
import { createNewAddress, getETHbal, getETHTransHistory } from "../controller/ethereum.js";

const router = express.Router();

router.route("/eth/get-bal").get(getETHbal);
router.route("/eth/trans-history").get(getETHTransHistory);
router.route("/eth/create-wallet").post(createNewAddress);

export default router;
