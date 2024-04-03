import moment from "moment";
import { baseUrl } from "../../common/config/constant.config";
import { FRIEND_TYPE } from "../../common/constants/constant";

export default class PeopleListResources {
  constructor(data) {
    return data.map((items) => ({
      _id: items._id,
      name: items.name,
      profileImage: items.profileImage ? baseUrl(items.profileImage) : null,
      // age: moment().diff(items.birthDate, "years", false),
      age: items.age,
      hieghtInFeet: items.hieghtInFeet,
      hieghtInInch: items.hieghtInInch,
      daysToMeet: items.daysToMeet,
      photos: items.photos
        ? items.photos.map((value) => {
            return {
              _id: value._id,
              image: value.image ? baseUrl(value.image) : null,
            };
          })
        : [],
      address: items.address,
      latitude: items.latitude,
      longitude: items.longitude,
      isblocked: items.blockData && items.blockData.length > 0 ? true : false,
    }));
  }
}
