// JWT AUTHENTICATION
import jwt from "jsonwebtoken";
import { baseUrl } from "../config/constant.config";
import { JWT } from "../constants/constant";

export default (req, res, next) => {
  if (req.session.token) {
    jwt.verify(req.session.token, JWT.SECRET, function (err, decoded) {
      if (err) {
        if (req.xhr) {
          return res.status(401).send("unauthorized");
        }
        res.redirect(baseUrl("admin/login"));
      } else {
        next();
      }
    });
  } else {
    if (req.xhr) {
      return res.status(401).send("unauthorized");
    }
    return res.redirect(baseUrl("admin/login"));
  }
};
