require("dotenv").config();
const Minio = require("minio");

export const bucket = "post";

export const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port:9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});
