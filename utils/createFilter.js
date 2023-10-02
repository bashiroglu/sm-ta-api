module.exports = (req) => {
  return {
    $cond: [
      { $eq: ["$private", true] },
      {
        $or: [
          { createdBy: req.user.id },
          { assignedTo: req.user.id },
          { involvedBys: req.user.id },
        ],
      },
      {},
    ],
  };
};
