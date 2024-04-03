import ReportServices from "./report.service";

class ReportController {
  /**
   * Get all reports
   * @param {*} req
   * @param {*} res
   */
  static async getAllReports(req, res) {
    const { data, filterData } = await ReportServices.getAllReports(req.query);

    const response = {
      draw: req.query.draw,
      recordsTotal: data.length,
      recordsFiltered: data.length,
      data: filterData,
    };

    return res.json(response);
  }

  /**
   * Get report page
   * @param {*} req
   * @param {*} res
   */
  static async getReportPage(req, res) {
    return res.render("admin/report/", { page: "report" });
  }
}

export default ReportController;
