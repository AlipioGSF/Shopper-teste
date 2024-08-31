require("dotenv").config();
import express, { Application } from "express";
import router from "./routes/measureRoute";

const app: Application = express();
const route = router;

// Middleware
app.use(express.json());

// Routes
app.use(route);

export default app;
