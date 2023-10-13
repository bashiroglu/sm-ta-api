const getFirstOfNextMonth = () => {
  const currentDate = new Date();
  const nextMonth = new Date(currentDate);
  nextMonth.setMonth(currentDate.getMonth() + 1);
  nextMonth.setDate(2);
  nextMonth.setHours(0, 0, 0, 0);
  return nextMonth;
};

module.exports = { getFirstOfNextMonth };
