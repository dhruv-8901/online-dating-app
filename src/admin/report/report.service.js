import Report from "../../../model/report";

class ReportServices {
  /**
   * Get all venues
   * @param {*} filter
   */
  static async getAllReports(filter) {
    const search = filter.search.value ? filter.search.value : "";
    const skip = +filter.start;
    const limit = +filter.length + +filter.start;
    const pipeline = [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $lookup: {
          from: "users",
          localField: "reportedBy",
          foreignField: "_id",
          as: "reporteeDetails",
        },
      },
      {
        $unwind: "$reporteeDetails",
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            {
              "reporteeDetails.name": {
                $regex: `.*${search}.*`,
                $options: "i",
              },
            },
            {
              "userDetails.name": {
                $regex: `.*${search}.*`,
                $options: "i",
              },
            },
          ],
        },
      });
    }

    const data = await Report.aggregate(pipeline);

    const filterData = await Report.aggregate([
      ...pipeline,
      {
        $sort: { created_at: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    return { data, filterData };
  }
}

export default ReportServices;
