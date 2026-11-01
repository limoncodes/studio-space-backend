import express from 'express'
import { MongoClient } from 'mongodb';
import cors from "cors"
import 'dotenv/config'
const app = express()

app.use(express.json());
app.use(cors());
const port = process.env.PORT || 5000

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

const MongodbConnection = await connectToMongoDB(); 
const db = MongodbConnection.db('studio-space')
const studioCollection = db.collection("studios")




app.get("/", (req, res)=>{
    res.send("Welcome to my Server")
})

app.post("/add-studio", async (req, res)=>{
  const data = req.body
  const result = await studioCollection.insertOne(data)
  res.send(result)
  console.log("Limon")

})

app.listen(port,()=>{
    console.log(`Example app listening on port ${port}`)
})