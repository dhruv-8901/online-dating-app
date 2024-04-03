import storeFCMToken from "./register-token.service";

/**
 * request to store fcm token
 */
export default async (req, res, _next) => {
  await storeFCMToken(req);
  return res.send({ message: "Success" });
};
