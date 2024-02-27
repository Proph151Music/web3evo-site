import fs from 'fs/promises';
import path from 'path';
import BadRequestError from '~/errors/bad-request-error';
import { rootDir } from '~/server';

export async function saveImage(imageBase64: string, filePath: string) {
  const matches = imageBase64.match(/^data:(.*);base64,(.*)$/);
  const ext = matches?.[1]?.split('/')[1]; // Extracts file extension (e.g., 'png', 'jpg')
  const data = matches?.[2];

  const filePathParts = filePath.split('/');
  const fileName = filePathParts.slice(-1)[0];

  if (!ext || !data) throw new BadRequestError('Invalid base64 image');

  const imageBuffer = Buffer.from(data, 'base64');
  const imagePath = `${filePath}.${ext}`;
  const directoryPath = path.join(rootDir, 'public', 'images', path.dirname(imagePath));

  try {
    // Create the directory if it doesn't exist
    await fs.mkdir(directoryPath, { recursive: true });

    // Now you can safely write the file
    await fs.writeFile(`${directoryPath}/${fileName}.${ext}`, imageBuffer);
  } catch (error) {
    console.error('Error writing file:', error);
  }

  return `public/images/${imagePath}`;
}

export function getImageUri(imagePath: string) {
  imagePath = imagePath.replace(/^public\//, '');
  return `${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/${imagePath}`;
}
