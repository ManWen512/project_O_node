// test-aws.js
import dotenv from "dotenv";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

dotenv.config();

const testS3 = async () => {
  try {
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const command = new ListBucketsCommand({});
    const response = await s3.send(command);
    
    console.log("✅ Permissions work! Buckets:", response.Buckets?.map(b => b.Name));
  } catch (error) {
    console.error("❌ Permission issue:", error.message);
  }
};

testS3();