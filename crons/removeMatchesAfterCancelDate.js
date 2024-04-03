import moment from "moment";
import Dates from "../model/dates";
import { DATE_IDEA_STATUS } from "../src/common/constants/constant";
import Match from "../model/match";
import PeopleReaction from "../model/peopleReaction";

const removeMatchesIfNoActionAfterDateCancelled = async () => {
  const removeMatches = await Dates.aggregate([
    {
      $match: {
        status: DATE_IDEA_STATUS.CANCEL,
        cancelledAt: {
          $lt: new Date(moment().subtract(30, "days").startOf("day")),
        },
      },
    },
  ]);

  removeMatches.forEach(async (date) => {
    await PeopleReaction.deleteMany({
      $or: [
        {
          userId: date.userId,
          peopleId: date.peopleId,
        },
        {
          userId: date.peopleId,
          peopleId: date.userId,
        },
      ],
    });

    await Match.deleteOne({
      $or: [
        {
          userId: date.userId,
          peopleId: date.peopleId,
        },
        {
          userId: date.peopleId,
          peopleId: date.userId,
        },
      ],
    });

    await Dates.deleteOne({
      _id: date._id,
    });
  });
};

export default removeMatchesIfNoActionAfterDateCancelled;
