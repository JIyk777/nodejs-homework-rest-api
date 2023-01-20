const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const gravatar = require("gravatar");

const fs = require("fs").promises;

const { HttpError, sendEmail } = require("../helpers");

const path = require("path");

const { v4: uuidv4 } = require("uuid");

const { User, authSchemas } = require("../models/user");

const { SECRET_KEY, BASE_URL } = process.env;

const register = async (req, res) => {
  try {
    const value = await authSchemas.registerSchema.validateAsync(req.body);
    const { email, password } = value;
    const user = await User.findOne({ email });
    if (user) {
      throw new Error("Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = uuidv4();
    const newUser = await User.create({
      ...value,
      password: hashPassword,
      avatarURL,
      verificationToken,
    });

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a
          target="_blank"
          href='${BASE_URL}/api/users/verify/${verificationToken}'
        >
          Click to verify email
        </a>`,
    };

    await sendEmail(verifyEmail);

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    if (error.message === "Email in use") {
      return res.status(409).json({
        message: error.message,
      });
    }
    res.status(400).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const value = await authSchemas.loginSchema.validateAsync(req.body);

    const { email, password } = value;

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Email or password is wrong");
    }
    if (!user.verify) {
      throw new Error("Email or password is wrong");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);

    if (!passwordCompare) {
      throw new Error("Email or password is wrong");
    }

    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
    await User.findByIdAndUpdate(user._id, { token });
    res.status(200).json({
      token: token,
      user: { email: user.email, subscription: user.subscription },
    });
  } catch (error) {
    if (error.message === "Email or password is wrong") {
      return res.status(401).json({
        message: error.message,
      });
    }
    res.status(400).json({
      message: error.message,
    });
  }
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;

  res.status(200).json({ email, subscription });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).json({ message: "No Content" });
};

const avatarDir = path.join(__dirname, "../", "public", "avatars");

const updateAvatar = async (req, res) => {
  if (!req.file) {
    throw HttpError(400, "Avatar not attach");
  }
  const { _id } = req.user;

  const { path: tempUpload, originalname } = req.file;

  const filename = `${_id}_${originalname}`;

  const resultUpload = path.join(avatarDir, filename);

  fs.rename(tempUpload, resultUpload);

  const avatarURL = path.join("avatars", filename);

  await User.findByIdAndUpdate(_id, { avatarURL });

  res.status(200).json({
    avatarURL,
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });
  res.json({ message: "Verification successful" });
};

const reVerification = async (req, res) => {
  try {
    const value = await authSchemas.reVerificationSchema.validateAsync(
      req.body
    );

    const { email } = value;

    console.log(email);

    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(404, "User not found");
    }
    if (user.verificationToken === "") {
      throw HttpError(404, "Verification has already been passed");
    }

    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: "",
    });

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a
          target="_blank"
          href='${BASE_URL}/api/users/verify/${user.verificationToken}'
        >
          Click to verify email
        </a>`,
    };

    await sendEmail(verifyEmail);

    res.status(200).json({ message: email });
  } catch (error) {
    res.status(error.status).json({
      message: error.message,
    });
  }
};
module.exports = {
  register,
  login,
  getCurrent,
  logout,
  updateAvatar,
  verify,
  reVerification,
};
