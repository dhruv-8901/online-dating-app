/**
 * authConstant.js
 * @description :: constants used in authentication
 */

module.exports = {
  JWT: {
    SECRET: "guestpetnotformeitsforyouenjoy",
    EXPIRES_IN: "1 YEAR",
  },

  BCRYPT: {
    SALT_ROUND: 12,
  },

  ROLE: {
    PATIENT: 1,
    DOCTOR: 2,
  },

  PAGINATION: {
    DEFAULT_PER_PAGE: 10,
    DEFAULT_PAGE: 1,
  },

  DATE_IDEA_STATUS: {
    SENT: 1,
    CONFIRM: 2,
    CANCEL: 3,
    RESCHEDULE: 4,
    COMPLETED: 5,
    SUGGESTION: 6,
  },

  PEOPLE: {
    LIKE: 1,
    DISLIKE: 2,
  },

  ACCOUNT_STATUS: {
    ACTIVE: 0,
    PAUSE: 1,
    DELETED: 2,
  },

  IS_BLOCKED: {
    TRUE: 1,
    FALSE: 0,
  },

  GENDER: {
    MAN: 0,
    WOMAN: 1,
    NONBINARY: 2,
  },

  USER_TYPE: {
    USER: 1,
    ADMIN: 2,
  },

  APPROVE_STATUS: {
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2,
  },

  NOTIFICATION_TYPE: {
    MEMBERSHIP_APPROVAL: "1",
    LIKE: "2",
    MATCH: "3",
    DATE: "4",
    CHAT: "5",
  },

  DISTANCE_FILTER: 8.04672,
};
