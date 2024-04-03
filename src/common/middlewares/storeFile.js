import multer from "multer";
import fs from "fs";
import { BadRequestException } from "../../error-exception";
/**
 * @description : file upload middleware for request.
 * @param {obj} req : request of route.
 * @param {obj} res : response of route.
 * @param {callback} next : executes the next middleware succeeding the current middleware.
 * @param {string} destination : destination.
 * @param {string} filename : filedname.
 */
const storeFiles =
  (destination, filename, single = "single") =>
  async (req, res, next) => {
    let increment = 0;
    return new Promise((resolve, reject) => {
      const multerStorage = multer.diskStorage({
        destination: (req, file, cb) => {
          fs.mkdirSync(destination, { recursive: true });
          cb(null, destination);
        },
        filename: (req, file, cb) => {
          let ext = file.mimetype.split("/")[1];
          cb(null, `${file.fieldname}-${Date.now() + increment}.${ext}`);
          increment++;
        },
      });

      if (single === "single") {
        multer({
          storage: multerStorage,
          limits: {
            fileSize: 10 * 1024 * 1024, // 10 MB maximum file size
          },
        }).single(filename)(req, res, next);
      } else {
        multer({
          storage: multerStorage,
        }).array(filename)(req, res, next);
      }
    })
      .then(() => next())
      .catch((err) => {
        throw new BadRequestException(err.message);
        // res.send({ error: err });
      });
  };

export default storeFiles;
