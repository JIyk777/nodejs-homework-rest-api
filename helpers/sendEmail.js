const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const { SEND_GRID_KEY } = process.env;

sgMail.setApiKey(SEND_GRID_KEY);

const sendEmail = async (data) => {
  const email = { ...data, from: "buzanov.kostya@gmail.com" };
  await sgMail.send(email);
  return true;
};

module.exports = sendEmail;
