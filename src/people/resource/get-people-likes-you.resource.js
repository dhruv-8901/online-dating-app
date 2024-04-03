import moment from "moment";
import { baseUrl } from "../../common/config/constant.config";

export default class GetPeopleLikesYouListResources {
  constructor(data) {
    return data.map((items) => ({
      _id: items.partnerDetails._id,
      name: items.partnerDetails.name,
      profileImage: items.partnerDetails.profileImage
        ? baseUrl(items.partnerDetails.profileImage)
        : null,
      isAlreadyMatched:
        items.matchInfo && items.matchInfo.length > 0 ? true : false,
    }));
  }
}
