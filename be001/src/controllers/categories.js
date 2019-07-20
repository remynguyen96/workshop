export const GetAll = async (req, res, next) => {
  try {
    res.status(200).json({ txt: 'workshop' });
  } catch (err) {
    next(err);
  }
};

export const Create = async (req, res, next) => {
  try {
    res.status(201).json({ ...req.body });
  } catch (err) {
    next(err);
  }
};
