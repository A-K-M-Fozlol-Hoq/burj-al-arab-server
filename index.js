const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const app = express()
const port = 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mfwri.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
app.use(cors())
app.use(bodyParser.json())
const admin = require('firebase-admin');

var serviceAccount = require("./configs/burj-al-arab-fozlol-firebase-adminsdk-d3bkt-a076aab9bb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});





const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
    console.log(newBooking)
  })
  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const qureyEmail = decodedToken.email;
          if (tokenEmail == qureyEmail) {
            bookings.find({ email: qureyEmail })
              .toArray((err, documents) => {
                res.status(200).send(documents);
              })
          } else {
            res.status(401).send('Unauthorized access')
          }
          // ...
        })
        .catch((error) => {
          res.status(401).send('Unauthorized access')
        });
    }
    else {
      res.status(401).send('Unauthorized access')
    }




  })
  //   client.close();
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)


// mongodb+srv://organicUser:<password>@cluster0.mfwri.mongodb.net/myFirstDatabase?retryWrites=true&w=majority