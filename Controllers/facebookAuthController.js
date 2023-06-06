import passport from "passport";

export const facebookAuth = passport.authenticate("facebook", {
  scope: ["email", "public_profile"],
});

export const facebookAuthCallback = passport.authenticate("facebook", {
  failureRedirect: "https://www.google.com/",
  failureMessage: "Login failed"
});

export const facebookRedirectCallback = (req, res) => {
    try {
      res.redirect("http://localhost:5000/api/login/success");
    } catch (error) {
      console.log(error);
    }
  };