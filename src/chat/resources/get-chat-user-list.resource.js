import moment from "moment";
import { baseUrl } from "../../common/config/constant.config";

export default class GetUserChatListResources {
  constructor(data) {
    return data.map((items) => ({
      dateId: items._id,
      _id: items.userDetails._id,
      name: items.userDetails.name,
      profileImage: items.userDetails.profileImage
        ? baseUrl(items.userDetails.profileImage)
        : null,
      lastMsg: items.chat
        ? items.chat.lastMessage
          ? items.chat.lastMessage.message
          : null
        : null,
      lastMsgDate: items.chat
        ? items.chat.lastMessage
          ? +moment(items.chat.lastMessage.created_at).format("x")
          : null
        : null,
      unseenMsgCount: items.chat ? items.chat.unseenCount : null,
    }));
  }
}
