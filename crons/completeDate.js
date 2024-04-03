import moment from "moment";
import Dates from "../model/dates";
import { DATE_IDEA_STATUS } from "../src/common/constants/constant";

const completeDate = async () => {
  return await Dates.updateMany(
    {
      dateAndTime: {
        $lte: new Date(moment().subtract(1, "days").endOf("day")),
      },
      status: DATE_IDEA_STATUS.CONFIRM,
    },
    {
      status: DATE_IDEA_STATUS.COMPLETED,
    }
  );
};

export default completeDate;
