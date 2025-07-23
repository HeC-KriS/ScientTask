const mongoose = require("mongoose")
const connect = mongoose.connect("mongodb://localhost:27017/scient")

connect.then(() =>{
    console.log("Database connected")

})
.catch(()=>{
    console.log("Database not connected")

})

const LoginSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    username: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required:true
    },
    role: {
        type:String,
        required:true
    }

})
const ProjectSchema = new mongoose.Schema({
  project: { type: String, required: true },
  owner: { type: String, required: true },
  description: { type: String, required: true }
});

const collection = new mongoose.model("users",LoginSchema);
const collection2 = new mongoose.model("projects",ProjectSchema)
module.exports = {collection ,collection2};
