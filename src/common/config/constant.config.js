require("dotenv").config();
let swipeLimit = 5;

/**
 * Get base url
 * @readonly
 */
module.exports.baseUrl = (path = null) => {
  let url = `${process.env.BASE_URL}`;
  return url + (path ? `/${path}` : "");
};

/**
 * Enum platform type
 * @readonly
 * @enum
 */
module.exports.PLATFORM = Object.freeze({
  ANDROID: "Android",
  IOS: "iOS",
});


