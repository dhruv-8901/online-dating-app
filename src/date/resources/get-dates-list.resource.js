import moment from "moment";
import { baseUrl } from "../../common/config/constant.config";

export default class GetDatesListResources {
  constructor(data) {
    return data.map((items) => ({
      _id: items._id,
      rescheduleBy: items.rescheduleBy,
      venue:
        items.venueDetails && items.venueDetails.length
          ? items.venueDetails[0].venue
          : null,
      status: items.status,
      dateAndTime: +moment(items.dateAndTime).format("x"),
      actionRequired: items.actionRequired,
      cancelledBy: items.cancelledBy,
      suggestionIdeaPopup: items.suggestionIdeaPopup,
      partnerDetails: {
        _id: items.partnerDetails._id,
        name: items.partnerDetails.name,
        profileImage: items.partnerDetails.profileImage
          ? baseUrl(items.partnerDetails.profileImage)
          : null,
        daysToMeet: items.partnerDetails.daysToMeet,
      },
    }));
  }
}
