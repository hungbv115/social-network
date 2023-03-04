const fs = require("fs");
const path = require("path");

const UPLOAD_DIR_NAME = "uploads";

export const saveLocal = ({ stream, filename }) => {
    const timestamp = new Date().toISOString().replace(/\D/g, "");
    const id = `${timestamp}_${filename}`;
    const filepath = path.join(UPLOAD_DIR_NAME, id);
    const fsPath = path.join(process.cwd(), filepath);
    return new Promise((resolve, reject) =>
      stream
        .on("error", error => {
          if (stream.truncated)
            // Delete the truncated file
            fs.unlinkSync(fsPath);
          reject(error);
        })
        .on("end", () => resolve({ id, filepath }))
        .pipe(fs.createWriteStream(fsPath))
    );
  }