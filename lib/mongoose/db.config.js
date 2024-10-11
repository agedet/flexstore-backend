import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
    // create a database connection
    mongoose
    .set('strictQuery', false)
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to database');
    }) .catch((error) => {
        console.log(error.message);
    });


	// try {
	// 	// console.log("mongodb: ", process.env.MONGODB_URI);
	// 	const conn = await mongoose.connect(process.env.MONGODB_URI);
	// 	// console.log(`MongoDB Connected: ${conn.connection.host}`);
	// } catch (error) {
	// 	console.log("Error connection to MongoDB: ", error.message);
	// 	// process.exit(1); // 1 is failure, 0 status code is success
	// }
};