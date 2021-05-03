module.exports = (res, next, taskId, emitter) => {
  setTimeout(() => {
    const error = new Error('took too much time to respond');
    error.status = 500;
    error.taskId = taskId;
    next(error);
  }, 30000);
  emitter.once(taskId, (data) => res.json(data));
};
