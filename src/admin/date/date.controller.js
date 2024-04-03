import Dates from "../../../model/dates";
import Venue from "../../../model/venue";
import DateServices from "./date.service";

class DateController {
  /**
   * Get all dates
   * @param {*} req
   * @param {*} res
   */
  static async getAllDates(req, res) {
    const { data, filterData } = await DateServices.getAllDates(req.query);

    const response = {
      draw: req.query.draw,
      recordsTotal: data.length,
      recordsFiltered: data.length,
      data: filterData,
    };

    return res.json(response);
  }

  /**
   * Get date page
   * @param {*} req
   * @param {*} res
   */
  static async getDatePage(req, res) {
    const allVenue = await Venue.find();
    return res.render("admin/date/dates", {
      page: "date",
      venueData: allVenue,
    });
  }

  /**
   * Get cancelled date page
   * @param {*} req
   * @param {*} res
   */
  static async getCancelledDatePage(req, res) {
    const allVenue = await Venue.find();

    return res.render("admin/date/cancellededDates", {
      page: "date",
      venueData: allVenue,
    });
  }

  /**
   * Get cancelled Dates listing
   * @param {*} req
   * @param {*} res
   */
  static async getCancelledDatesListing(req, res) {
    const { data, filterData } = await DateServices.getCancelledDatesListing(
      req.query
    );

    const response = {
      draw: req.query.draw,
      recordsTotal: data.length,
      recordsFiltered: data.length,
      data: filterData,
    };

    return res.json(response);
  }
}

export default DateController;
