import { Storage } from '@google-cloud/storage';
import stream from 'node:stream';
import type * as streamWeb from 'node:stream/web';

const storage = new Storage({
  credentials: {
    client_email: process.env.EMAIL,
    private_key: process.env.KEY,
  },
});

const bucketName = 'acme_corp';

export const uploadToCloudStorage = async ({
  body,
  fileName,
  contentType,
}: {
  fileName: string;
  contentType: string;
  body: ReadableStream<Uint8Array>;
}) => {
  const file = storage.bucket(bucketName).file(fileName);
  const readStream = stream.Readable.fromWeb(body as unknown as streamWeb.ReadableStream);
  const writeStream = file.createWriteStream({
    metadata: {
      contentType,
    },
  });

  await new Promise((resolve, reject) => {
    readStream
      .pipe(writeStream)
      .on('finish', () => {
        resolve(null);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};
