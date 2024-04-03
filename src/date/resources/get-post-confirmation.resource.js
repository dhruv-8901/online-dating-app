import moment from "moment";
import { baseUrl } from "../../common/config/constant.config";

export default class GetPostConfirmationListResources {
  constructor(data) {
    return data.map((items) => ({
      _id: items._id,
      status: items.status,
      dateAndTime: +moment(items.dateAndTime).format("x"),
      partnerDetails: {
        _id: items.partnerDetails._id,
        name: items.partnerDetails.name,
        profileImage: items.partnerDetails.profileImage
          ? baseUrl(items.partnerDetails.profileImage)
          : null,
      },
    }));
  }
}
