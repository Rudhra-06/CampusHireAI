import pdf from 'pdf-parse';
import fs from 'fs';
import { getFromS3Buffer } from './s3.js';

/**
 * Extract plain text from a PDF Buffer, S3 URL/Key, HTTP URL, or local file path.
 * @param {Buffer|string} input
 * @returns {Promise<string>} Extracted text
 */
export const extractTextFromPDF = async (input) => {
  try {
    let dataBuffer;

    if (!input) return '';

    if (Buffer.isBuffer(input)) {
      dataBuffer = input;
    } else if (typeof input === 'string') {
      if (process.env.AWS_S3_BUCKET && (input.startsWith('s3://') || input.includes('.amazonaws.com/') || input.startsWith('resumes/'))) {
        dataBuffer = await getFromS3Buffer(input);
      } else if (input.startsWith('http://') || input.startsWith('https://')) {
        const response = await fetch(input);
        const arrayBuffer = await response.arrayBuffer();
        dataBuffer = Buffer.from(arrayBuffer);
      } else if (fs.existsSync(input)) {
        dataBuffer = fs.readFileSync(input);
      } else {
        console.error('PDF input not found or inaccessible:', input);
        return '';
      }
    } else {
      return '';
    }

    if (!dataBuffer || dataBuffer.length === 0) return '';
    const data = await pdf(dataBuffer);
    return data.text || '';
  } catch (error) {
    console.error('PDF parsing error:', error.message || error);
    return '';
  }
};

export default extractTextFromPDF;

