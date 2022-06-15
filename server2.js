const { S3, AbortMultipartUploadCommand, CreateBucketCommand, ListBucketsCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

require('dotenv').config();

const client = new S3({
    endpoint: "https://nyc3.digitaloceanspaces.com",
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.SPACES_KEY,
      secretAccessKey: process.env.SPACES_SECRET
    }
});

console.log(process.env.SPACES_KEY);
console.log(CreateBucketCommand);

// Specifies the new Space's name.


// Creates the new Space.
const createNewBucket = async (bucket, s3Client) => {
  const bucketParams = { Bucket: bucket };
  try {
    const data = await s3Client.send(new CreateBucketCommand(bucketParams));
    console.log("Success", data.Location);
    return data;
  } catch (err) {
    console.log("Error", err);
  }
};

const emptyS3Directory = async (bucket, dir, s3Client) => {
  const listParams = {
      Bucket: bucket,
      Prefix: dir
  };

  const listedObjects = await s3Client.listObjectsV2(listParams).promise();

  if (listedObjects.Contents.length === 0) return;

  const deleteParams = {
      Bucket: bucket,
      Delete: { Objects: [] }
  };

  listedObjects.Contents.forEach(({ Key }) => {
      deleteParams.Delete.Objects.push({ Key });
  });

  await s3Client.deleteObjects(deleteParams).promise();

  if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir);
}

const getPutSignedUrl = async (Bucket, Key, ContentType, s3Client, expiresIn = 900) => {
  const bucketParams = {Bucket, Key, ContentType};


  try {
    const url = await getSignedUrl(s3Client, new PutObjectCommand({Bucket, Key, ContentType}), { expiresIn }); // Adjustable expiration.
    console.log("URL:", url);
    return url;
  } catch (err) {
    console.log("Error", err);
    return false;
  }
};

const getPostSignedUrl = async (Bucket, folder, s3Client, Expires = 3600) => {

  const params = {
    Bucket,
    Expires,
    Conditions: [
      ['starts-with', '$key', folder]
    ]
  };
  
  s3Client.createPresignedPost(params, (err, data) => {
    if (err) {
      console.error('Presigning post data encountered an error', err);
    } else {
      data.Fields.key = 'path/to/uploads/${filename}';
      console.log('The post data is', data);
    }
  });
}

getPostSignedUrl('s3-testing', 'yoyo/', client);