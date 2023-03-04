import stream from "stream";

import { minioClient } from "./minio";

const createBucket =  async (bucketName) => {

    await minioClient.listBuckets();
    minioClient.bucketExists(bucketName, function(err, exists) {
         if (!exists) {
             minioClient.makeBucket(bucketName, 'ap-southeast-1', (err) => {
                 if (err) {
                     console.log('minio error '+err);
                 }
             });
         }
        if (err) {
            if (err.code == 'NoSuchBucket') {
                minioClient.makeBucket(bucketName, 'ap-southeast-1', function(err2) {
                    if (err2) {
                        console.log("error on creating bucket", err2);
                    }
                });
            }
        }
    });
}

export const createUploadStream = async (key, bucket) => {
  const pass = new stream.PassThrough();
  await createBucket(bucket);
  return {
    writeStream: pass,
    promise: minioClient.putObject({ bucket, key, pass})
  };
}