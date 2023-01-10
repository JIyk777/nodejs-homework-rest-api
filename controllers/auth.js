const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const { User, authSchemas } = require("../models/user");

const { SECRET_KEY } = process.env;

const register = async (req, res) => {
  try {
    const value = await authSchemas.registerSchema.validateAsync(req.body);
    const { email, password } = value;
    const user = await User.findOne({ email });
    if (user) {
      throw new Error("Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ ...value, password: hashPassword });
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
module.exports = {
  register,
  login,
  getCurrent,
  logout,
};
