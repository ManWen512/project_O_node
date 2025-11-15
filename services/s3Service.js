// services/s3Service.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export const uploadToS3 = async (filePath, originalName, mimeType, folder) => {
  // Create S3 client INSIDE the function
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  try {
    const fileData = fs.readFileSync(filePath);
    const fileExtension = path.extname(originalName);
    const fileName = `${folder}/${uuidv4()}${fileExtension}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: fileData,
      ContentType: mimeType,
    };

    console.log("Uploading to S3:", {
      bucket: process.env.AWS_BUCKET_NAME,
      fileName,
      region: process.env.AWS_REGION,
    });

    const command = new PutObjectCommand(params);
    const response = await s3.send(command);

    const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    console.log("✅ Upload successful:", url);

    return url;
  } catch (error) {
    console.error("❌ S3 upload error:", error.message);
    throw error;
  }
};
