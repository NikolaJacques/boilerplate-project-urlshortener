require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const {Schema, model} = mongoose;
autoIncrement = require('mongoose-auto-increment');
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

// solution

// parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: {
    type: Number,
    required: true
  }
});

const autoNumberSchema = new Schema({
  autoNumber: {
    type: Number,
    required: true
  }
});

const urlObject = model('urlObject', urlSchema);
const autoNumberObject = model('autoNumberObject', autoNumberSchema);

// initialize auto number
initializeAutonumber = (done) => {
  const autoNumber = new autoNumberObject({
    autoNumber: 0
  });
  autoNumber.save((err, data) => {
    if (err) return done(err);
    done(null, data);
  })
};

updateAutoNumber = async (done) => {
  let updateValue;
  const numberObject = await autoNumberObject.findOne();
  if (!numberObject) {
    updateValue = await initializeAutonumber().autoNumber;
  } else {
    updateValue = numberObject.autoNumber
  }
  autoNumberObject.findOneAndUpdate({},{autoNumber: updateValue + 1}, {new: true}, (err, data) => {
    if (err) return done(err);
    done(null, data);
  })
};

createAndSaveDocument = async (inputObject, done) => {
  const url = await new urlObject(inputObject);
  url.save((err, data) => {
    if (err) return done(err);
    done(null, data);
  });
}

// request handlers
app
  .post("/api/shorturl", async (req, res, next) => {
    dns.lookup(req.body.url, () => {
      try {
        req.url = {
          original_url: req.body.url,
          short_url: await updateAutoNumber().autoNumber
        };
        next();
      }
      catch(err){
        res.json({ error: 'invalid url' })
      }
    })})
    .post("/api/shorturl", (req, res) => {
      createAndSaveDocument(req.url, (err, data) => {
          try {
            res.json(data);
          }
          catch(err){
            res.send("An error occured saving record")
          }
      })
    }) 
/*   .get("api/shorturl", (req, res) => {

  }) */