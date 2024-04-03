import moment from "moment";
import { baseUrl } from "../../common/config/constant.config";

export default class GetUserResource {
  constructor(data) {
    this._id = data._id;
    this.status = data.status;
    this.accountStatus = data.accountStatus;
    this.countryCode = data.countryCode;
    this.phone = data.phone;
    this.email = data.email;
    this.name = data.name;
    this.profileImage = data.profileImage ? baseUrl(data.profileImage) : null;
    this.birthDate = data.birthDate
      ? +moment(data.birthDate).format("x")
      : null;
    this.hieghtInFeet = data.hieghtInFeet;
    this.hieghtInInch = data.hieghtInInch;
    this.address = data.address;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.currentAddress = data.currentAddress;
    this.currentLatitude = data.currentLatitude;
    this.currentLongitude = data.currentLongitude;
    this.gender = data.gender;
    this.likeToDate = data.likeToDate;
    this.agePreferenceFrom = data.agePreferenceFrom;
    this.agePreferenceTo = data.agePreferenceTo;
    this.photos = data.photos
      ? data.photos.map((value) => {
          return {
            _id: value._id,
            image: value.image ? baseUrl(value.image) : null,
          };
        })
      : [];
    this.daysToMeet = data.daysToMeet;
    this.socialLink = data.socialLink;
    this.referralCode = data.referralCode;
    this.approvedStatus = data.approvedStatus;
    this.isProfileCompleted = data.isProfileCompleted;
    this.isPhoneVerifiedAt = data.phoneVerifiedAt !== null;
    this.isEmailVerified = data.emailVerifiedAt !== null;
    this.isBlocked = data.isBlocked ? true : false;
  }
}
