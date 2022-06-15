'use strict'

const cors = require('cors')
const aws = require('aws-sdk')
const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()

const app = express()
const port = 4000

console.log(process.env.SPACES_ENDPOINT);

// Create a new S3 instance for interacting with our DO space. We use S3 because
// the API is the same between DO Spaces and AWS S3.
const spaces = new aws.S3({
  endpoint: new aws.Endpoint(process.env.SPACES_ENDPOINT),
  accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
  secretAccessKey: process.env.SPACES_SECRET_ACCESS_KEY
})

// console.log (spaces);

app.use(cors())
app.use(bodyParser.json())

app.post('/presigned_url', (req, res) => {
  const body = req.body

  const params = {
    Bucket: "myBucket",
    Key: 'testfile.jpg',
    Expires: 60 * 30, // Expires in 30 minutes
    ContentType: 'image',
    ACL: 'public-read', // Remove this to make the file private
  }

  const signedUrl = spaces.getSignedUrl('putObject', params)

  console.log(signedUrl);
  // res.json({signedUrl})
})

const displayPostUrl = () => {
  
  const params = {
    Bucket: "s3-testing",
    Key: 'testfile.jpg',
    Expires: 60 * 30, // Expires in 30 minutes
    ContentType: 'image',
    ACL: 'public-read', // Remove this to make the file private
  }

  const signedUrl = spaces.getSignedUrl('putObject', params)

  console.log(signedUrl);
}

displayPostUrl();

app.listen(port, () => console.log(`Listening for requests on port ${port}...`))