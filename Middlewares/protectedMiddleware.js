export const protectedRoute = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({ error: "Unautorized user please login first" });
};
