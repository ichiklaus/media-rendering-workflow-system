// apps/renderer/src/server.ts
import http from "http";
import express from "express";
import cors from "cors";
import path from "path";
import { config } from "./config";
import { recoverStuckJobs, workerLoop } from "./worker";

import renderRoutes from "./routes/render.routes";
import rendersRoutes from "./routes/renders.routes";
import utilsRoutes from "./routes/utils.routes";
import healthRoutes from "./routes/health.routes";
import recipientsRoute from "./routes/recipients.routes";
import firebaseRoutes from "./routes/campaign.routes";
import { paths } from "@mrws-core/config";


console.log("cwd:", process.cwd());
console.log("__dirname:", __dirname);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/static", express.static(paths.storage));
app.use("/recordings", express.static(paths.recordings));
app.use('/public', express.static(path.join(__dirname, '../../public')));

app.use("/render", renderRoutes);
app.use("/renders", rendersRoutes);
app.use("/", utilsRoutes);
app.use("/health", healthRoutes);
app.use("/recipients", recipientsRoute);
app.use("/firebase", firebaseRoutes);

const server = http.createServer(app);

server.keepAliveTimeout = 60000;
server.headersTimeout = 65000;

server.listen(config.port, () => {
  console.log(`Renderer running on port ${config.port}`);
});

recoverStuckJobs();
workerLoop();
