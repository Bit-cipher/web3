import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();

import ethRoutes from "./routes/ethRoutes.js";
import polygonRoutes from "./routes/polygonRoutes.js";
import { connectDB } from "./server/mongoDB.js";
app.use(express.json());
app.use(ethRoutes);
app.use(polygonRoutes);

app.listen(process.env.PORT, () => {
  connectDB();
  console.log(`web3 is running on port ${process.env.PORT}`);
});
