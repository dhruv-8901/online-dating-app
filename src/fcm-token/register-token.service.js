import FcmToken from "../../model/fcmToken";

/**
 * request to store fcm token
 */
export default async (req, res, _next) => {
  const authUser = req.user;
  const { deviceId, token, platform } = req.body;

  const fcmToken = await FcmToken.findOne({ userId: authUser._id, deviceId });

  if (!fcmToken) {
    return await FcmToken.create({
      token,
      deviceId,
      userId: authUser._id,
      platform,
    });
  }

  return await FcmToken.updateOne(
    { userId: authUser._id, deviceId },
    {
      token,
      deviceId,
    }
  );
};
