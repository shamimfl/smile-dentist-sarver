const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config();



app.use(cors())
app.use(express.json())

app.get('/', (req, res)=>{
    res.send('Running your server')
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dbmdmy2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    const serviceCollection = client.db("test").collection("services");
    const reviewCollection = client.db("test").collection("review");

    app.post('/addService', async (req, res)=>{
        const service = req.body;
        const result = await serviceCollection.insertOne(service)
        res.send(result)
    })

    app.get('/service', async (req, res)=>{
        const query = {}
        const service = serviceCollection.find(query);
        const result = await service.limit(3).toArray() 
        res.send(result);
    })
    app.get('/service/:_id', async (req, res)=>{
        const {_id} = req.params
        const query = {_id: ObjectId(_id)}
        const service = await serviceCollection.findOne(query);
        
        res.send(service);
    })


    app.get('/allservice', async (req, res)=>{
        const query = {}
        const service = serviceCollection.find(query);
        const result = await service.toArray() 
        res.send(result);
    })

    // add review
    app.post('/review',async (req, res)=>{
        const review = req.body;
        const result = await reviewCollection.insertOne(review);
        res.send(result)
    })

    app.get('/review',async (req, res)=>{
        const name = req.query.serviceName;
        const query = {serviceName: name};
        const service = reviewCollection.find(query)
        const result = await service.toArray()
        res.send(result)
    })

    // my reviews


    app.get('/myReview',async (req, res)=>{
        const email = req.query.email;
        const query = {email};
        const cursor = reviewCollection.find(query)
        const result = await cursor.toArray()
        res.send(result)
    })

    // delete review 
    app.delete('/review/:id', async (req, res)=>{
        const {id} = req.params
        const query = {_id: ObjectId(id)}
        const result = await reviewCollection.deleteOne(query);
        res.send(result)
        // console.log(id)
    })
}

run().catch(console.dir)





app.listen(port, ()=>{
    console.log(`server running on ${port}`)
})
