import express from "express";
import dotenv from "dotenv";
import { connectDB } from './lib/db.js';
import FireStationBusinessRoute from "./routes/firestation.js";
import AccountRoute from "./routes/account.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/firestation/business", FireStationBusinessRoute);
app.use("/api/account/firestation", AccountRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB();
});