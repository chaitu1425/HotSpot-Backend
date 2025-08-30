import express from "express"
import dotenv from "dotenv"
dotenv.config()
import dbconnect from "./config/dbconnect.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/authroutes.js"
import cors from "cors"
const port = process.env.PORT || 5000
const app=express()
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authRouter)


app.get("/",(req,res)=>{
    res.send("Hello")
})

app.listen(8000,()=>{   
    console.log(`Server is running in ${port}`)
    dbconnect()
})