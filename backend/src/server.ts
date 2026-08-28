import cors from "cors";
import express from "express";
import { initializeDatabase } from "./db/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { healthRouter } from "./routes/health.routes.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());
app.use("/health", healthRouter);
app.use(errorMiddleware);

async function startServer(): Promise<void> {
  await initializeDatabase();

  app.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Failed to start backend:", error);
  process.exitCode = 1;
});
