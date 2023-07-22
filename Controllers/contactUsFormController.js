import nodemailer from "nodemailer";

export const contactUsForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(422).json({
        status: false,
        message: "Please provide all the required fields properly",
      });
    }

    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "dev.speakerore@gmail.com",
        pass: "iixfmhklzudmtkqc",
      },
    });

    let info = await transporter.sendMail({
      from: email, // sender address
      to: "dev.speakerore@gmail.com", // list of receivers
      subject: "Contact Form", // Subject line
      // text: "", // plain text body
      html: `<div><span>Name:-</span><span>${name}</span></div><br/><div><span>Email:-</span><span>${email}</span></div><br/><div><span>Message:-</span><span>${message}</span></div>`, // html body
    });

    if (info.accepted[0] === email) {
      return res.status(201).json({
        status: true,
        Message: "Your Form is submitted. We will reach out to you soon",
      });
    } else {
      return res
        .status(201)
        .json({ status: true, Message: "Your Form is Not submitted" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "something went wrong", err: error });
  }
};
