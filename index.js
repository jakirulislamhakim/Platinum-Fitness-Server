const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5prtsfh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // collection
    const galleryCollection = client
      .db("Platinum-Fitness")
      .collection("galleryData");
    const trainersCollection = client
      .db("Platinum-Fitness")
      .collection("Trainers");

    // get Gallery Data
    app.get("/api/v1/gallery", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page) || 1;

      try {
        const result = await galleryCollection
          .find()
          .skip((page - 1) * size)
          .limit(size)
          .toArray();
        // Assuming you have more items in the collection
        const hasMore =
          (await galleryCollection.countDocuments()) > page * size;
        // Calculate nextPage if there's more data available
        const nextPage = hasMore ? page + 1 : null;

        res.send({
          nextPage,
          items: result,
        });
      } catch (error) {
        console.error("Error fetching gallery items:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // get trainers data
    app.get("/api/v1/trainers", async (req, res) => {
      try {
        const result = await trainersCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
