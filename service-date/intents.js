module.exports.addDate_v1_0_0 = (msg) => {
  msg.date = new Date();
  return msg;
};

module.exports.addWeekDay_v1_0_1 = (msg) => {
  msg.weekDay = new Date().getDay();
  return msg;
};
