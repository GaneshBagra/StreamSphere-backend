import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"

const connectDB = async () => {
    try{
       const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
       console.log(`\n mongoDB connected !! DB HOST :  ${connectionInstance.connections[0].host}`)
    }catch(err){
        console.log("PORT : ",process.env.PORT)
        console.log('Error on connecting with DB : ', err);
        process.exit(1)
    }
}

export default connectDB;
