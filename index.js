const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
require('dotenv').config();




//middleWare
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.1xqvvcz.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unAuthorized Access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'unAuthorized Access' })
        }
        req.decoded = decoded;
        next();
    })
}


async function run() {
    try {
        const serviceCollection = client.db('tTravel').collection('services');
        const reviewCollection = client.db('tTravel').collection('reviews');



        //JWT
        app.post('/jwt', (req, res) => {
            const user = req.body;
            console.log(user)
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '7d' })
            res.send({ token })
        })


        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services)
        })

        app.get('/allServices', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services)
        })

        //single one find
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service)
        })

        //review post
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })

        //Services post
        app.post('/addServices', async (req, res) => {
            const review = req.body;
            const result = await serviceCollection.insertOne(review)
            res.send(result)
        })



        //review API --all reviews
        app.get('/reviewsServiceName', async (req, res) => {
            // console.log(req.query)
            let query = {}
            if (req.query.serviceName) {
                query = {
                    serviceName: req.query.serviceName
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })


        //reviews get
        app.get('/reviews', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            console.log('-----inside review-----', decoded);
            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unAuthorized Access' })
            }
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        //delete 
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result)
        })

    }
    finally {

    }

}
run().catch(error => console.error(error))







//---------
app.get('/', (req, res) => {
    res.send("T-Travel server is Running")
})
app.listen(port, () => {
    console.log(`T-Travel server running on port ${port}`)
})