import passport from "passport";

export const facebookAuth = passport.authenticate("facebook", {
  scope: ["email", "public_profile"],
});

export const facebookAuthCallback = passport.authenticate("facebook", {
  failureRedirect: "https://speakerore.com",
  failureMessage: "Login failed",
});

export const facebookRedirectCallback = (req, res) => {
  try {
    res.redirect("https://speakerore.com");
  } catch (error) {
    console.log(error);
  }
};
