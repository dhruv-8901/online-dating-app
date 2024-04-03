import multer from "multer";
import fs from "fs";
import { BadRequestException } from "../../error-exception";

const storeFilesNew = (fields) => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    const multerStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        const fieldDestination = fields.find(
          (field) => field.name === file.fieldname
        )?.destination;

        fs.mkdirSync(fieldDestination, { recursive: true });
        cb(null, fieldDestination);
      },
      filename: (req, file, cb) => {
        let ext = file.mimetype.split("/")[1];
        cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
      },
    });

    const upload = multer({
      storage: multerStorage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB maximum file size
      },
    }).fields(fields);
    upload(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  })
    .then(() => next())
    .catch((err) => {
      throw new BadRequestException(err.message);
      // res.send({ error: err });
    });
};

export default storeFilesNew;
