export default class GetDateVenueListResources {
  constructor(data) {
    return data.map((items) => ({
      _id: items._id,
      venue: items.venue,
    }));
  }
}
