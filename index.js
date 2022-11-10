const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require('dotenv').config();



app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Running your server')
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dbmdmy2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}



async function run() {
    const serviceCollection = client.db("test").collection("services");
    const reviewCollection = client.db("test").collection("review");


    app.post('/jwt', (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
        res.send({ token })

    })


    app.post('/addService', async (req, res) => {
        const service = req.body;
        const result = await serviceCollection.insertOne(service)
        res.send(result)
    })

    app.get('/service', async (req, res) => {
        const query = {}
        const service = serviceCollection.find(query).sort({fullDate : -1, fullTime: -1});;
        const result = await service.limit(3).toArray()
        res.send(result);
    })
    app.get('/service/:_id', async (req, res) => {
        const { _id } = req.params
        const query = { _id: ObjectId(_id) }
        const service = await serviceCollection.findOne(query).sort({fullDate : -1, fullTime: -1});

        res.send(service);

    })


    app.get('/allservice', async (req, res) => {
        const query = {}
        const service = serviceCollection.find(query).sort({fullDate : -1, fullTime: -1});
        const result = await service.toArray()
        res.send(result);
    })

    // add review
    app.post('/review', async (req, res) => {
        const review = req.body;
        const result = await reviewCollection.insertOne(review);
        res.send(result)
    })

    app.get('/review', async (req, res) => {
        const name = req.query.serviceName;
        const query = { serviceName: name };
        const service = reviewCollection.find(query).sort({fullDate : -1, fullTime: -1})
        const result = await service.toArray()
        res.send(result)
    })

    // my reviews


    app.get('/myReview', verifyJWT, async (req, res) => {

        const decoded = req.decoded;

        if (decoded.email !== req.query.email) {
            res.status(403).send({ message: 'unauthorized access' })
        }

        let query = {};
        if (req.query.email) {
            query = {
                email: req.query.email
            }
        }
        const cursor = reviewCollection.find(query).sort({fullDate : 1, fullTime: 1})
        const result = await cursor.toArray()
        res.send(result)
    })

    // delete review 
    app.delete('/review/:id', async (req, res) => {
        const { id } = req.params
        const query = { _id: ObjectId(id) }
        const result = await reviewCollection.deleteOne(query);
        res.send(result)
        // console.log(id)
    })

    // get data for edit review 
    app.get('/edit/:_id', async (req, res) => {
        const _id = req.params._id;
        const query = { _id: ObjectId(_id) }
        const cursor = reviewCollection.find(query);
        const result = await cursor.toArray()
        res.send(result);
    })

    // update 
    app.put('/edit/:_id', async (req, res) => {
        const _id = req.params._id;
        const data = req.body;
        const query = { _id: ObjectId(_id) };
        const options = { upsert: true };
        const updateDoc = {
            $set: {
                message: data.message,
                ratings: data.ratings
            }
        };
        const result = await reviewCollection.updateOne(query, updateDoc, options);
        res.send(result)
        console.log(data)
    })

}

run().catch(console.dir)





app.listen(port, () => {
    console.log(`server running on ${port}`)
})
