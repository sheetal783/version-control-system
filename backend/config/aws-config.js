import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config(); // load .env variables

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: "ap-south-1"
});

const s3 = new AWS.S3();

const S3_BUCKET = "git-demo-bucket12";


export { s3, S3_BUCKET };