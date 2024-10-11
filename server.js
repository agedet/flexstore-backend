import mongoose from "mongoose";
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan'
import cookieParser from "cookie-parser";
import router from "./routes/auth.routes.js";
import { connectDB } from "./lib/mongoose/db.config.js";

const PORT = process.env.PORT || 5000;
// const hostname = '127.0.0.1';
const authRoutes = router;

const app = express();
app.use(express.json());
// app.use(express.urlencoded({ extends: true}));
app.use(cors({
    origin: 'http://localhost:3000/',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Cache-Control",
        "Expires",
        "Pragma"
    ],
    credentials: true,
}));

app.use(cookieParser());
dotenv.config();

app.use(morgan('combined'));
app.use(morgan('tiny'));
app.disable('x-powered-by');


// create a database connection
// mongoose
// .set('strictQuery', false)
// .connect(process.env.MONGODB_URI)
// .then(() => {
//     console.log('Connected to database');
// }) .catch((error) => {
//     console.log(error.message);
// });

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
});