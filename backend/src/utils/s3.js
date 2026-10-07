import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION || 'us-east-1';
const bucketName = process.env.AWS_S3_BUCKET;

export const s3Client = bucketName
  ? new S3Client({
      region,
      ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
          }
        : {}),
    })
  : null;

/**
 * Upload a file buffer to S3.
 * @param {Buffer} fileBuffer
 * @param {string} key
 * @param {string} mimeType
 * @returns {Promise<string>} Uploaded file URL or Key
 */
export const uploadToS3 = async (fileBuffer, key, mimeType = 'application/pdf') => {
  if (!s3Client || !bucketName) {
    throw new Error('AWS S3 bucket is not configured. Set AWS_S3_BUCKET in environment.');
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
};

/**
 * Download a file from S3 into an in-memory Buffer.
 * @param {string} keyOrUrl
 * @returns {Promise<Buffer>}
 */
export const getFromS3Buffer = async (keyOrUrl) => {
  if (!s3Client || !bucketName) {
    throw new Error('AWS S3 bucket is not configured.');
  }

  let key = keyOrUrl;
  if (key.startsWith('http://') || key.startsWith('https://')) {
    const url = new URL(key);
    key = url.pathname.replace(/^\//, '');
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await s3Client.send(command);
  
  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

export default { s3Client, uploadToS3, getFromS3Buffer };
