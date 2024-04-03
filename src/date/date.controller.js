import DateServices from "./date.service";
import GetDateVenueListResources from "./resources/get-date-venue-list.resource";
import GetDatesListResources from "./resources/get-dates-list.resource";
import GetPostConfirmationListResources from "./resources/get-post-confirmation.resource";

class DateController {
  /**
   * Get date idea list
   * @param {*} req
   * @param {*} res
   */
  static async getDateList(req, res) {
    const { data, meta } = await DateServices.getDateList(
      req.query.type,
      req.query.perPage,
      req.query.page,
      req.user
    );

    return res.send({ data, meta });
  }

  /**
   * Get venue list for dating
   * @param {*} req
   * @param {*} res
   */
  static async getVenueList(req, res) {
    const data = await DateServices.getVenueList();

    return res.send({ data: new GetDateVenueListResources(data) });
  }

  /**
   * Get available date by venue id
   * @param {*} req
   * @param {*} res
   */
  static async getVenueAvailableDateByVenueId(req, res) {
    const data = await DateServices.getVenueAvailableDateByVenueId(
      req.params.venueId
    );

    return res.send({ data });
  }

  /**
   * get available time by venue id
   * @param {*} req
   * @param {*} res
   */
  static async getVenueAvailableTimeByVenueId(req, res) {
    const data = await DateServices.getVenueAvailableTimeByVenueId(
      req.params.venueId,
      req.query.date
    );

    return res.send({ data });
  }

  /**
   * Give date idea to the poeple who likes you
   * @param {*} req
   * @param {*} res
   */
  static async giveDateIdeaToLikedPeople(req, res) {
    await DateServices.giveDateIdeaToLikedPeople(
      req.params.peopleId,
      req.body,
      req.user
    );

    return res.send({ message: "Idea sent successfully." });
  }

  /**
   * Give date idea to suggested people
   * @param {*} req
   * @param {*} res
   */
  static async giveDateIdeaToSuggestedPeople(req, res) {
    await DateServices.giveDateIdeaToSuggestedPeople(
      req.params.dateId,
      req.body,
      req.user
    );

    return res.send({ message: "Idea sent successfully." });
  }

  /**
   * Confirm or cancel date idea by dateId
   * @param {*} req
   * @param {*} res
   */
  static async confirmOrCancelDealIdeaByDateId(req, res) {
    await DateServices.confirmOrCancelDealIdeaByDateId(
      req.params.dateId,
      req.body.type,
      req.user
    );

    return res.send({ message: "Success" });
  }

  /**
   * Post confirmation by dateId
   * @param {*} req
   * @param {*} res
   */
  static async postConfirmationByDateId(req, res) {
    await DateServices.postConfirmationByDateId(
      req.params.dateId,
      req.body,
      req.user
    );

    return res.send({ message: "Post Date Confirmation Added Successfully" });
  }

  /**
   * Pending post confirmation
   * @param {*} req
   * @param {*} res
   */
  static async pendingPostConfirmation(req, res) {
    const data = await DateServices.pendingPostConfirmation(req.user);

    return res.send({ data: new GetPostConfirmationListResources(data) });
  }

  /**
   * Change date idea
   * @param {*} req
   * @param {*} res
   */
  static async changeDate(req, res) {
    const data = await DateServices.changeDate(
      req.params.dateId,
      req.body,
      req.user
    );

    return res.send({ message: "success" });
  }

  /**
   * Cancel date idea
   * @param {*} req
   * @param {*} res
   */
  static async cancelDateIdea(req, res) {
    await DateServices.cancelDateIdea(req.params.dateId, req.user);

    return res.send({ message: "success" });
  }
}

export default DateController;
