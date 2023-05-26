export const protectedRoute = (req, res, next) => {
  console.log(req.isAuthenticated())
  if (req.user) {
    return next();
  }

  res.status(401).json({ error: "Unautorized user please login first" });
};
