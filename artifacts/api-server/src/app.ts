import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import { ensureUploadsDir, uploadsDir } from "./storage";

const app: Express = express();

// Ensure the local uploads folder exists for storing avatar files in local mode
ensureUploadsDir();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve profile pictures dynamically under the /uploads URL prefix
app.use("/uploads", express.static(uploadsDir));

app.use("/api", router);

export default app;
