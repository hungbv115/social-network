const {Blob} = require('buffer');
const fs = require('fs');
const buffer = require("buffer");
const createFileName = (inputURI) => {
    let inputMIME = inputURI.split(',')[0].split(':')[1].split(';')[0];
    let ext = inputMIME.split("/")[1];
    let today = new Date();
    let nameFile = today.getTime().toString();
    return nameFile + "."+ext;
}
const convertToBuffer = (inputURI) => {
    return Buffer.from(inputURI.split(",")[1], 'base64');
}


module.exports = {createFileName,convertToBuffer};
