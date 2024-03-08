import { Storage } from '@google-cloud/storage';
import stream from 'node:stream';
import type * as streamWeb from 'node:stream/web';

const storage = new Storage({
  credentials: {
    client_email: process.env.GCP_SERVICE_ACCOUNT_CLIENT_EMAIL,
    private_key: process.env.GCP_SERVICE_ACCOUNT_PRIVATE_KEY,
  },
});

const bucketName = 'ronin_media';

/**
 * Uploads the given `ReadableStream` to the Google Cloud Storage Bucket.
 * @param options.body - The media to upload.
 * @param options.fileName - The name of the file with format extension to upload.
 * @param options.contentType - The media's `Content-Type`.
 */
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
