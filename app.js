import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import categoryRoutes from "./routes/categoryRoutes.js";
import cors from "cors";
import dotenv from "dotenv";

const app = express();

const environment = process.env.NODE_ENV || "development";
dotenv.config({
  path: `.env.${environment}`,
});
const PORT = process.env.PORT || 3000;
const databaseUrl = process.env.DATABASE_URL;

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*", // can be improved by adding whitelisted IPs
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

// Use category routes
app.use("/api/categories", categoryRoutes);

// MongoDB Connection 
export const connectDB = async () => {
  const mongoURI = databaseUrl;
  console.log(mongoURI, process.env.DATABASE_URL);
  mongoose
    .connect(mongoURI)
    .then(() => {
      console.log("Connected", mongoURI);
    })
    .catch((err) => {
      console.error("Connection issue:", err);
    });
};

connectDB()
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
