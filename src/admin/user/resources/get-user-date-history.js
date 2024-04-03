import moment from "moment";

export default class GetUserDateHistoryListResources {
  constructor(data) {
    return data.map((items) => ({
      _id: items._id,
      venue: items.venueDetails.venue,
      status: items.status,
      dateAndTime: +moment(items.dateAndTime).format("x"),
      partnerName: items.partnerDetails.name,
    }));
  }
}
