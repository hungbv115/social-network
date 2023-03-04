const {minioClient} = require('./minio.js');
const { v4 } = require('uuid');
const {Stream} = require('stream');

const pass = new Stream.PassThrough();

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
const minioUtils = {
    //upload img
    uploadImg: async (file,fileName,bucketName)=> {

        await createBucket(bucketName);
        let metaData = {
            'Content-Type': 'application/octet-stream'
        }
        // Using fPutObject API upload your file to the bucket photos.
        minioClient.fPutObject(bucketName, fileName, file, metaData, function (err, etag) {
            if (err) return console.log(err)
            console.log('File uploaded successfully.')
        });
        const url = await minioClient.presignedGetObject(bucketName, fileName);
        console.log("Get url successfully: ", url);
        return url;
    },
    //upload file
     uploadFile: async (bucketName, fileName, file) => {
        console.log("Start");
        await createBucket(bucketName);
        const submitFileDataResult = await minioClient
            .putObject(bucketName, fileName, file)
            .catch((e) => {
                console.log("Error while creating object from file data: ", e);
                throw e;
            });

        // // thực hiện lấy url sau khi upload file
        const url = await minioClient.presignedGetObject(bucketName, fileName);
        // console.log("Get url successfully: ", url);
        // return url;
        return {
            writeStream: pass,
            promise: url
          };
     },
     getFileUrl: async (bucketName,fileName)=>{
         // thực hiện lấy url sau khi upload file
         console.log(fileName);
         let url = await minioClient.presignedGetObject(bucketName, fileName, 60 * 60 * 24);
         return url;
     },
     deleteFile: async (bucketName,fileName)=>{
        try{
            await minioClient.removeObject(bucketName,fileName);
        }catch (err){
            console.log(err);
        }

     }
}
module.exports = minioUtils;
