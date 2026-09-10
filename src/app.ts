import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env, isTest } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import { getDbMode } from "./config/db";
import { apiRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { apiLimiter } from "./middleware/rate-limit";
import { usageLogger } from "./middleware/usage";
import { sendSuccess } from "./utils/api-response";

export const app = express();

app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (!isTest) {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}
app.use(apiLimiter);
app.use(usageLogger);

app.get("/api/health", (_req, res) => {
  sendSuccess(res, {
    status: "ok",
    db: getDbMode(),
    redisConfigured: Boolean(env.REDIS_URL),
    stripeConfigured: Boolean(env.STRIPE_SECRET_KEY),
    ebayConfigured: Boolean(env.EBAY_CLIENT_ID),
    demoMode: env.DEMO_MODE,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
