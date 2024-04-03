import { baseUrl } from "../../common/config/constant.config";
import { checkIdIsValid } from "../../common/helper";
import VenueServices from "./venue.service";

class VenueController {
  /**
   * Get all venues
   * @param {*} req
   * @param {*} res
   */
  static async getAllVenues(req, res) {
    const { data, filterData } = await VenueServices.getAllVenues(req.query);

    const response = {
      draw: req.query.draw,
      recordsTotal: data.length,
      recordsFiltered: data.length,
      data: filterData,
    };

    return res.json(response);
  }

  /**
   * Get venue page
   * @param {*} req
   * @param {*} res
   */
  static async getVenuePage(req, res) {
    return res.render("admin/venue/venue", { page: "venue" });
  }

  /**
   * Get add venue page
   * @param {*} req
   * @param {*} res
   */
  static async getAddVenuePage(req, res) {
    return res.render("admin/venue/add", { page: "venue" });
  }

  /**
   * Add venue
   * @param {*} req
   * @param {*} res
   */
  static async addVenue(req, res) {
    await VenueServices.addVenue(req.body);

    return res.redirect(baseUrl("admin/venue"));
  }

  /**
   * Delete venue from id
   * @param {*} req
   * @param {*} res
   */
  static async deleteVenueFromId(req, res) {
    await VenueServices.deleteVenueFromId(req.params.venueId);

    return res.send("Venue deleted successfully.");
  }

  /**
   * Get edit venue page
   * @param {*} req
   * @param {*} res
   */
  static async getEditVenuePage(req, res) {
    checkIdIsValid(req.params.venueId);
    const data = await VenueServices.getVenueDataFromId(req.params.venueId);

    return res.render("admin/venue/edit", {
      page: "venue",
      venue: data && data.length ? data[0].venue : "",
      venueTiming: data && data.length ? data[0].venueTiming : [],
    });
  }

  /**
   * Edit venue from id
   * @param {*} req
   * @param {*} res
   */
  static async editVenueFromId(req, res) {
    checkIdIsValid(req.params.venueId);
    await VenueServices.editVenueFromId(req.params.venueId, req.body);

    return res.redirect(baseUrl("admin/venue"));
  }
}

export default VenueController;
