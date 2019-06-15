var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectId = mongodb.ObjectId;
var cors = require("cors");
require('dotenv').config()
var USER_COLLECTION = "users";

var app = express();
app.use(cors());
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(
  process.env.MONGODB_URI,
  function(err, database) {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    // console.log(database)
    // Save database object from the callback for reuse.
    db = database;
    console.log("Database connection ready");

    // Initialize the app.
    var server = app.listen(2000, function() {
      var port = server.address().port;
      console.log("App now running on port", port);
    });
  }
);

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({ error: message });
}

app.get("/", function(req, res) {
    res.send('api are working');
});

app.get("/api/signin", function(req, res) {
  db.collection(USER_COLLECTION)
    .find({'userName' : req.query.userName, 'password' : req.query.password})
    .toArray(function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get mood");
      } else {
        if (doc === null) {
          doc = {};
        }
        // console.log(doc)
        let filteredMap = doc.map((v)=>{
            delete v.password;
            v.token = hashString(50);
            return v;
        })
        res.status(200).json(filteredMap);
      }
    });
});

app.post("/api/signup", function(req, res) {
  db.collection(USER_COLLECTION).insert(req.body, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to add mood item");
    } else {
      if (doc === null) {
        doc = {};
      }
      res.status(200).json({
          msg : 'saved'
      });
    }
  });
});

function hashString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

