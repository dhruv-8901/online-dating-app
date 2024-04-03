import moment from "moment";
import Dates from "../model/dates";
import { DATE_IDEA_STATUS } from "../src/common/constants/constant";
import Match from "../model/match";
import PeopleReaction from "../model/peopleReaction";

const removeMatches = async () => {
  const oldMatches = await Match.aggregate([
    {
      $match: {
        created_at: {
          $lt: new Date(moment().subtract(30, "days").startOf("day")),
        },
      },
    },
    {
      $lookup: {
        from: "dates",
        let: { userId: "$userId", peopleId: "$peopleId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  {
                    $and: [
                      { $eq: ["$userId", "$$userId"] },
                      { $eq: ["$peopleId", "$$peopleId"] },
                    ],
                  },
                  {
                    $and: [
                      { $eq: ["$userId", "$$peopleId"] },
                      { $eq: ["$peopleId", "$$userId"] },
                    ],
                  },
                ],
              },
              status: {
                $ne: DATE_IDEA_STATUS.SUGGESTION,
              },
            },
          },
        ],
        as: "dateDetails",
      },
    },
  ]);

  oldMatches.forEach(async (match) => {
    if (match.dateDetails.length > 0) {
      return;
    }
    await PeopleReaction.deleteMany({
      $or: [
        {
          userId: match.userId,
          peopleId: match.peopleId,
        },
        {
          userId: match.peopleId,
          peopleId: match.userId,
        },
      ],
    });

    await Match.deleteOne({
      _id: match._id,
    });
  });
};

export default removeMatches;
