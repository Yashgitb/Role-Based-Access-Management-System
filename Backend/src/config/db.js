import mongoose from "mongoose";

let pendingConnection = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (pendingConnection) {
        return pendingConnection;
    }

    try {
        pendingConnection = mongoose.connect(process.env.MONGO_URI);
        const conn = await pendingConnection;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error("Database connection failed:", error.message);
        if (!process.env.VERCEL) {
            process.exit(1);
        }
        throw error;
    } finally {
        pendingConnection = null;
    }
};

export default connectDB;
