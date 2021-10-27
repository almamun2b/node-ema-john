const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config()


const app = express();
const port = process.env.PORT || 5000;

// MiddleWare
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u222i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db("ema-john");
        const productCollection = database.collection("products");
        const orderCollection = database.collection("orders");

        // GET API
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const count = await cursor.count();

            console.log(req.query);
            const page = req.query.page;
            const size = parseInt(req.query.size);

            let products;
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
                // console.log(products);
            }
            else {
                products = await cursor.toArray();
            }

            res.send({
                count,
                products
            });
        });

        // POST API - Get Data by Keys
        app.post('/products/bykeys', async (req, res) => {
            console.log(req.body);
            const keys = req.body;
            const query = { key: { $in: keys } };
            const products = await productCollection.find(query).toArray();
            res.json(products);
        });

        // POST API - Add Orders
        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log(order);
            const result = await orderCollection.insertOne(order);

            res.send(result);
        });

        // UPDATE API

        // DELETE API

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Server is Running");
});

app.listen(port, () => {
    console.log(`Server is Running at: http://localhost:${port}`);
});
