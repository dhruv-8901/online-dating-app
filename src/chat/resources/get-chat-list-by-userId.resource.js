import moment from "moment";

export default class GetChatListByUserIdResources {
  constructor(data) {
    return data.map((items) => ({
      _id: items._id,
      senderId: items.senderId,
      receiverId: items.receiverId,
      message: items.message,
      sendAt: +moment(items.created_at).format("x"),
      seenAt: +moment(items.seenAt).format("x"),
    }));
  }
}
