const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();



//middleWare
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.1xqvvcz.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const serviceCollection = client.db('tTravel').collection('services');



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