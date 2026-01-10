const {MongoClient} = require("mongodb");

const url = "mongodb+srv://priya07_db_user:Test12345@curiousnode.aegl1gk.mongodb.net/";

const client = new MongoClient(url);

const dbName = "HelloWorld";

async function main () {
    
    await client.connect();
    console.log("Connected Successfully to Server");
    const db = client.db(dbName);
    const collection = db.collection("User");

    // READ 
    const findResult = await collection.find({}).toArray();
    console.log("Found documents =>", findResult);


    return "done..";
       
}



main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());







// NOTES

// Go to mongodb website
// Create a free M0 cluster
// Create a user
// Get the connection string
// Install Mongo DB compass
// Create a database
// INstall mongodb package
// Create a connection from code
// Documents CRUD - CReate, REad, Update, Delete