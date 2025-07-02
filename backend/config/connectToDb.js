const mongoose = require("mongoose");

module.exports = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("connected to mongodb ");
    }catch(error){
        console.log("connection failed to mongodb", error);
    }
}