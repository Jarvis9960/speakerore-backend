import passport from "passport";

export const authenticate = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const authenticateCallback = passport.authenticate("google", {
  failureRedirect: "https://www.google.com/",
  failureMessage: "Login failed",
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
