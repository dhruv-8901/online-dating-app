import { USER_TYPE } from "../common/constants/constant";
import PeopleService from "./people.service";
import FriendListResources from "./resource/get-friends-list.resource";
import GetPeopleLikesYouListResources from "./resource/get-people-likes-you.resource";
import PeopleListResources from "./resource/get-people-list.resource";

class PeopleController {
  /**
   * Get people list
   * @param {*} req
   * @param {*} res
   * @returns
   */
  static async getPeopleList(req, res) {
    const { data, meta } = await PeopleService.getPeopleList(
      req.query.perPage,
      req.query.page,
      req.user
    );

    return res.send({ data: new PeopleListResources(data), meta });
  }

  /**
   * Get people data from id
   * @param {*} req
   * @param {*} res
   */
  static async getPeopleDataFromId(req, res) {
    const data = await PeopleService.getPeopleDataFromId(
      req.params.peopleId,
      req.user
    );

    const newData = new PeopleListResources(data);

    return res.send({ data: newData.length > 0 ? newData[0] : {} });
  }

  /**
   * Get list of people which likes you
   * @param {*} req
   * @param {*} res
   * @returns
   */
  static async getListOfPeopleLikesYou(req, res) {
    const { data, meta } = await PeopleService.getListOfPeopleLikesYou(
      req.query.perPage,
      req.query.page,
      req.user
    );

    return res.send({ data: new GetPeopleLikesYouListResources(data), meta });
  }
  /**
   * Add reaction on to the people
   * @param {*} req
   * @param {*} res
   */
  static async addReactionOnToThePeople(req, res) {
    const dailyLikeLimitExceed = await PeopleService.addReactionOnToThePeople(
      req.params.peopleId,
      req.body.type,
      req.user
    );

    return res.send({ data: { dailyLikeLimitExceed, message: "Success" } });
  }

  /**
   * Send friend request
   * @param {*} req
   * @param {*} res
   */
  static async sendPeopleConnectRequest(req, res) {
    const data = await PeopleService.sendPeopleConnectRequest(
      req.params.userId,
      req.body.type,
      req.user
    );

    return res.send(data);
  }

  /**
   * Approve or reject friend request
   * @param {*} req
   * @param {*} res
   */
  static async approvePeopleConnectRequest(req, res) {
    const data = await PeopleService.approvePeopleConnectRequest(
      req.body.type,
      req.params.requestId,
      req.user
    );

    return res.send(data);
  }

  /**
   * Block unblock people from Id
   * @param {*} req
   * @param {*} res
   */
  static async blockUnblockPeopleFromId(req, res) {
    await PeopleService.blockUnblockPeopleFromId(
      req.params.peopleId,
      req.body.type,
      req.user
    );

    return res.send({ message: req.body.type == 1 ? "Unmatched" : "Success" });
  }

  /**
   * Add reaction on to the liked people
   * @param {*} req
   * @param {*} res
   */
  static async addReactionOnToTheLikedPeople(req, res) {
    await PeopleService.addReactionOnToTheLikedPeople(
      req.params.peopleId,
      req.body.type,
      req.user
    );

    return res.send({ message: "Success" });
  }

  /**
   * Report people from Id
   * @param {*} req
   * @param {*} res
   */
  static async reportPeopleFromId(req, res) {
    await PeopleService.reportPeopleFromId(req.params.peopleId, req.user);

    return res.send({ message: "Success" });
  }
}

export default PeopleController;
