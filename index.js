import express from 'express'
import { MongoClient, ObjectId } from 'mongodb';
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
app.get("/add-studio", async (req, res)=> {
  
  

   try {
    const result = await studioCollection.find().toArray();

    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch studios",
    });
  }

})
app.get("/add-studio/:id" , async (req, res)=>{
  const id = req.params
  const result = await studioCollection.findOne({_id: new ObjectId(id)})
  res.send(result)

})

// My listening
app.get("/my-listings/:email", async (req, res) => {
  const email = req.params.email;

  const result = await studioCollection
    .find({ "owner.email": email })
    .toArray();

  res.send(result);
});
app.patch("/update-studio/:id", async (req, res) => {
  const {id} = req.params;
  const updateData= req.body;
  const result = await studioCollection.updateOne(
    {_id: new ObjectId(id)},
    {$set:updateData}
  )
  res.json(result)


})
app.delete("/delete-studio/:id", async (req, res) => {
  const {id} = req.params;
  const result = await studioCollection.deleteOne({_id: new ObjectId(id)})
  res.json(result)
})



app.listen(port,()=>{
    console.log(`Example app listening on port ${port}`)
})