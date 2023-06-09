const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000 ;

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eo0io7y.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const doctorsCollection = client.db('doctorDB').collection('doctors');
    const appionmentCollection = client.db('doctorDB').collection('appionment');
    const usersCollection = client.db('doctorDB').collection('users');

    // users relate api 
    app.post('/users' , async(req, res)=>{
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result)
    })

    app.get('/totalDoctors' , async(req , res) =>{
      const result = await doctorsCollection.estimatedDocumentCount();
      res.send({totalDoctors: result})
    })

    app.get('/doctors' , async(req , res) =>{
      const cursor = doctorsCollection.find()
      const result = await cursor.toArray();
      res.send(result);
    })


    app.get('/doctors/:id', async(req , res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id) }

      const option = {
      projection: { name:1 , description:1 ,  image:1 , expertise:1 }}

      const result= await doctorsCollection.findOne(query , option);
      res.send(result)

    })


    // Creating index on two fields
    const indexKeys = { name: 1, treatment: 1 }; // Replace field1 and field2 with your actual field names
    const indexOptions = { name: "nameTreatment" }; // Replace index_name with the desired index name
    const result = await appionmentCollection.createIndex(indexKeys, indexOptions);
    console.log(result);
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );



app.get("/getJobsByText/:text", async (req, res) => {
      const text = req.params.text;
      const result = await appionmentCollection
        .find({
          $or: [
            { name: { $regex: text, $options: "i" } },
            { treatment: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });


    // Appionment 

    // Method to get an appointment with a specific email

    app.get('/appionment', async(req, res)=>{
      console.log(req.query.email);
      let query = {};
      if(req.query?.email){
        query= {email: req.query.email}
      }
      const result = await appionmentCollection.find(query).toArray();
      res.send(result);
    })

    //

    app.post('/appionment' ,async(req , res)=>{
      const appionment = req.body;
      console.log(appionment)
      const result = await appionmentCollection.insertOne(appionment);
      res.send(result);
    })

    app.delete('appionment/:id', async(req, res) =>{
      const id = req.params.id;
      console.log(id)
      // const query = {_id: new ObjectId(id)};
      // const result = await appionmentCollection.deleteOne(query)
      // res.send(result)
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/' , (req , res) =>{
    res.send('Medical service is running')
})

app.listen(port , ()=>{
    console.log(`medical service is running on port ${port}`)
})