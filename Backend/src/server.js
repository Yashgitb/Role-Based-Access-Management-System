import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";


dotenv.config()

const app = express()

//Middleware
app.use(express.json());

connectDB();

app.use(cors({
    origin: "http://localhost:5173"
}));

const PORT = process.env.PORT || 5000;


app.get('/',(req,res) => {
    res.send("Server is running")
})


app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`);
})


app.use("/api/auth", authRoutes);