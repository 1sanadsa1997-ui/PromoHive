import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  import("./routes/auth")
    .then((mod) => app.use("/api/auth", mod.default))
    .catch((err) => console.error("Auth routes not loaded:", err));

  // Public routes (import dynamically)
  import("./routes/public")
    .then((mod) => {
      try {
        app.use("/api/public", mod.default);
      } catch (err) {
        console.error("Failed to mount public routes:", err);
      }
    })
    .catch((err) => {
      console.error("Public routes not loaded:", err);
    });

  // Admin routes (protected by ADMIN_PASSWORD via header x-admin-password or Authorization Bearer)
  // Dynamically import admin routes without using top-level await so Vite doesn't fail.
  import("./routes/admin")
    .then((mod) => {
      try {
        app.use("/api/admin", mod.default);
      } catch (err) {
        console.error("Failed to mount admin routes:", err);
      }
    })
    .catch((err) => {
      // ignore if unable to load admin module
      console.error("Admin routes not loaded:", err);
    });

  return app;
}
