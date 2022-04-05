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

const urlObject = model('urlObject', urlSchema);

const createAndSaveDocument = async (urlString) => {
  try {  
    const count = await urlObject.find().count();
    const url = await new urlObject({
      original_url: urlString,
      short_url: count
    });
    url.save();
    return url;
  } catch (error) {
    console.log(error.message);
  }
}

// request handlers
app
  .post("/api/shorturl", (req, res) => {
    console.log(req.body.url);
    dns.lookup(req.body.url, async () => {
      try {
        const link = await urlObject.findOne({"original_url": req.body.url});
        if (link === null){
          req.link = await createAndSaveDocument(req.body.url);
        } else {
          req.link = link;
        }
        res.json(req.link);
      }
      catch(error){
        res.json({ error: 'invalid url' })
      }
    })})
    .get("/api/shorturl/:short_url", (req, res) => {
      try {
        const link = await urlObject.findOne({"short_url": req.body.short_url});
        if (link === null){
          throw Error;
        } else {
          res.json(link)
        }
      }
      catch(error) {
        res.json({ error: 'invalid short url' })
      }
    }) 