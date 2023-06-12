import passport from "passport";

export const authenticate = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const authenticateCallback = passport.authenticate("google", {
  successReturnToOrRedirect: "https://speakerore.com",
  failureRedirect: "/api/auth/check",
  session: true,
});

export const redirectCallback = (req, res) => {
  try {
    res.redirect("https://speakerore.com");
  } catch (error) {
    console.log(error);
  }
};

export const logout = (req, res) => {
  req.logout();
  req.session.destroy();
  res.send("Logged out successfully");
};
