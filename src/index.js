import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path : "./.env",
    override : true
})

const port = parseInt(process.env.PORT || 8000,10);


connectDB()
.then(() => {
    app.get("/", (req,res) => {
        res.send("App Running")
    })

    app.listen( port,() => {
        console.log("Server running on port : ", port)
    })
})
.catch((err) => {
    console.log("MongoDB connection failed : ", err)
})




