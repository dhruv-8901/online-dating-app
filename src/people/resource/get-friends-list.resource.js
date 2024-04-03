import { baseUrl } from "../../common/config/constant.config";

export default class FriendListResources {
  constructor(data) {
    return data.map((items) => ({
      _id: items._id,
      firstName: items.friendData.firstName,
      lastName: items.friendData.lastName,
      profileImage: items.friendData.profileImage
        ? baseUrl(items.friendData.profileImage)
        : null,
      isVerified: items.friendData.isVerified,
      distance: items.friendData.distance,
      pets: items.friendData.pets.map((items) => ({
        _id: items._id,
        image: items.image ? baseUrl(items.image) : null,
        name: items.name,
        age: items.age,
      })),
    }));
  }
}
