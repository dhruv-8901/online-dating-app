import GetDatesListResources from "../date/resources/get-dates-list.resource";
import ChatServices from "./chat.service";
import GetChatListByUserIdResources from "./resources/get-chat-list-by-userId.resource";
import GetUserChatListResources from "./resources/get-chat-user-list.resource";

class ChatController {
  /**
   * Save file for chat
   * @param {*} req
   * @param {*} res
   */
  static async saveFileOnServer(req, res) {
    const data = await ChatServices.saveFileOnServer(req.file);
    return res.send({ data });
  }

  /**
   * Get chat list
   * @param {*} req
   * @param {*} res
   */
  static async getChatList(req, res) {
    const { data, meta } = await ChatServices.getChatList(
      req.query.type,
      req.query.perPage,
      req.query.page,
      req.user
    );

    return res.send({ data: new GetUserChatListResources(data), meta });
  }

  /**
   * get chat list by userId
   * @param {*} req
   * @param {*} res
   * @returns
   */
  static async getUserChatListByUserId(req, res) {
    const { isUserBlocked, dateDetail, data, meta } =
      await ChatServices.getUserChatListByUserId(
        req.params.userId,
        req.query.dateId,
        req.query.perPage,
        req.query.page,
        req.user
      );

    return res.send({
      data: {
        isUserBlocked,
        dateDetail,
        chats: new GetChatListByUserIdResources(data),
      },
      meta,
    });
  }
}

export default ChatController;
