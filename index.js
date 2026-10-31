import express from 'express'
import { MongoClient } from 'mongodb';
import 'dotenv/config'
const app = express()
const port = 5000

// connect to mongodb
const client = new MongoClient(`mongodb+srv://${process.env.MONGODB_USESRNAME}:${process.env.MONGODB_PASSWOED}@cluster0.4dwew1j.mongodb.net/`);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
connectToMongoDB()
console.log(`name ${process.env.NAME}`)


app.get("/", (req, res)=>{
    res.send("Welcome to my Server")
})
app.listen(port,()=>{
    console.log(`Example app listening on port ${port}`)
})