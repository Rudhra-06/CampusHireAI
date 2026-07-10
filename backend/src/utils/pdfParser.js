import pdf from 'pdf-parse';
import fs from 'fs';

export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    return '';
  }
};
