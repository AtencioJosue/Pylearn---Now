import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import { ensureUploadsDir, uploadsDir } from "./storage";

const app: Express = express();

app.set("trust proxy", 1);

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

// Ensure the local uploads folder exists for storing avatar files in local mode
ensureUploadsDir();

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === process.env.CORS_ORIGIN ||
        /^https?:\/\/localhost:\d+$/.test(origin) ||
        /^https?:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS origin not allowed"));
    },
  }),
);
app.use(express.json({ limit: "3mb" }));
app.use(express.urlencoded({ extended: true, limit: "3mb" }));

// Serve profile pictures dynamically under the /uploads URL prefix
app.use("/uploads", express.static(uploadsDir));

app.use("/api", router);

export default app;
