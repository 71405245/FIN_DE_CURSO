const asyncWrapper = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.error('Error in asyncWrapper:', error);
      res.status(500).json({ msg: 'Error interno en el servidor', detail: error.message });
    }
  };
};

module.exports = asyncWrapper;
