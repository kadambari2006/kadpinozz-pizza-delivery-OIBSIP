const bcrypt = require('bcryptjs');
const emailValidator = require('email-validator');
const asyncHandler = require('express-async-handler');

// Import Utils
const generateToken = require('../utils/generateToken');

// Import Middlewares
const sendEmail = require('../middlewares/nodemailerMiddleware');

// Import Schema
const User = require('../schemas/userSchema');

// Function to generate a random 6-digit confirmation code thats not in users Schema already
const generateVerificationCode = async () => {
  let code;
  let user;

  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    user = await User.findOne({ verificationCode: code });
  } while (user);

  return code;
};

// Initialize Controllers

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('All Fields Are Required!');
  } else {
    if (emailValidator.validate(email)) {
      let user = await User.findOne({ email: email });

      if (user) {
        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (user.email === email && passwordsMatch) {
          res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            address: user.address,
            orders: user.orders,
            isVerified: user.isVerified,
            token: generateToken(user._id),
            message: 'Login Successful!',
          });
        } else {
          res.status(401);
          throw new Error('Invalid Email or Password!');
        }
      } else {
        res.status(401);
        throw new Error('Invalid Email or Password!');
      }
    } else {
      res.status(400);
      throw new Error('Invalid Email Address!');
    }
  }
});

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public

const registerUser = asyncHandler(async (req, res) => {
  let { name, email, password, confirmPassword, phoneNumber, address } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    res.status(400);
    throw new Error('All Fields Are Required!');
  } else {
    if (emailValidator.validate(req.body.email)) {
      let user = await User.findOne({ email: email });

      if (user) {
        res.status(400);
        throw new Error('User Already Exists!');
      } else {
        if (password !== confirmPassword) {
          res.status(400);
          throw new Error('Passwords Do Not Match!');
        } else {
          if (password.length < 8) {
            res.status(400);
            throw new Error('Password Must Be At Least 8 Characters Long!');
          } else {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);

            // Generate a verification token
            const verificationCode = await generateVerificationCode();

            // Send the verification email
            const emailSent = await sendEmail({
              to: email,
              subject: 'Your KaDpinozz Verification OTP Code',
              templateOptions: {
                title: 'Confirm Your Account',
                greeting: `Hey ${name},`,
                message: `<p>Welcome to <strong>KaDpinozz</strong>! Your account has been registered.</p>
                <p>Please enter the 6-digit OTP code below to verify your email and activate your account:</p>
                <div style="text-align: center; margin: 26px 0;">
                  <span style="display: inline-block; font-size: 2.2rem; font-weight: 800; letter-spacing: 8px; color: #047857; background: #ecfdf5; border: 2px dashed #059669; padding: 12px 30px; border-radius: 12px;">
                    ${verificationCode}
                  </span>
                </div>
                <p style="font-size: 0.9rem; color: #64748b; text-align: center;">⏱️ Valid for 10 minutes. For your security, do not share this OTP with anyone.</p>`,
              },
            });

            if (emailSent) {
              user = await User.create({
                name,
                email,
                password: hashedPassword,
                phoneNumber,
                address,
                verificationCode,
              });

              res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                address: user.address,
                orders: user.orders,
                isVerified: user.isVerified,
                token: generateToken(user._id),
                message: 'User Registered Successfully!',
              });
            } else {
              res.status(400);
              throw new Error('Error Sending Confirmation Code!');
            }
          }
        }
      }
    } else {
      res.status(400);
      throw new Error('Invalid Email Address!');
    }
  }
});

// @desc    Verify a user
// @route   POST /api/users/verify
// @access  Public

const verifyUser = asyncHandler(async (req, res) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    res.status(400);
    throw new Error('All Fields Are Required!');
  } else {
    if (emailValidator.validate(email)) {
      const query = (req.user && req.user._id) ? { email, _id: req.user._id } : { email };
      const user = await User.findOne(query);

      if (user) {
        if (user.verificationCode === verificationCode) {
          user.isVerified = true;
          user.verificationCode = null;

          const verifiedUser = await user.save();

          if (verifiedUser) {
            res.status(200).json({
              _id: verifiedUser._id,
              name: verifiedUser.name,
              email: verifiedUser.email,
              phoneNumber: verifiedUser.phoneNumber,
              address: verifiedUser.address,
              orders: verifiedUser.orders,
              isVerified: verifiedUser.isVerified,
              token: generateToken(verifiedUser._id),
              message: 'User Verified Successfully!',
            });
          } else {
            res.status(400);
            throw new Error('Error Verifying User!');
          }
        } else {
          res.status(400);
          throw new Error('Invalid Confirmation Code!');
        }
      } else {
        res.status(400);
        throw new Error('Invalid Email Address!');
      }
    } else {
      res.status(400);
      throw new Error('Invalid Email Address!');
    }
  }
});



// @desc    Send instant OTP to email as soon as entered
// @route   POST /api/users/send-otp
// @access  Public
const sendOTP = asyncHandler(async (req, res) => {
  const { email, name } = req.body;

  if (!email || !emailValidator.validate(email)) {
    res.status(400);
    throw new Error('A valid email address is required!');
  }

  let user = await User.findOne({ email });
  const code = await generateVerificationCode();

  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const tempPassword = await bcrypt.hash(Math.random().toString(36).slice(-10), salt);
    user = await User.create({
      name: name || email.split('@')[0],
      email,
      password: tempPassword,
      phoneNumber: 'N/A',
      address: 'N/A',
      verificationCode: code,
      isVerified: false,
    });
  } else {
    user.verificationCode = code;
    await user.save();
  }

  await sendEmail({
    to: email,
    subject: `${code} is your KaDpinozz OTP Code`,
    templateOptions: {
      title: 'Your KaDpinozz One-Time Password',
      greeting: `Hey ${user.name || 'Foodie'},`,
      message: `<p>You requested an instant OTP to access your <strong>KaDpinozz</strong> account.</p>
      <p style="margin-top: 12px;">Here is your 6-digit access code:</p>
      <div style="text-align: center; margin: 26px 0;">
        <span style="display: inline-block; font-size: 2.3rem; font-weight: 800; letter-spacing: 10px; color: #047857; background: #ecfdf5; border: 2px dashed #059669; padding: 14px 34px; border-radius: 14px;">
          ${code}
        </span>
      </div>
      <p style="font-size: 0.9rem; color: #64748b; text-align: center;">⏱️ Valid for 10 minutes. For your security, never share your OTP with anyone.</p>`,
    },
  });

  res.status(200).json({
    message: `OTP sent successfully to ${email}!`,
    email,
  });
});

// @desc    Verify OTP and log in immediately
// @route   POST /api/users/login-otp
// @access  Public
const loginWithOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error('Email and OTP are both required!');
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('No account found for this email address!');
  }

  if (user.verificationCode !== otp.trim()) {
    res.status(400);
    throw new Error('Invalid or expired OTP code!');
  }

  user.isVerified = true;
  user.verificationCode = null;
  const updatedUser = await user.save();

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    phoneNumber: updatedUser.phoneNumber,
    address: updatedUser.address,
    orders: updatedUser.orders,
    isVerified: updatedUser.isVerified,
    token: generateToken(updatedUser._id),
    message: 'Logged in successfully with OTP!',
  });
});

// @desc    Resend verification OTP
// @route   POST /api/users/resend-code
// @access  Public

const resendVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email Address Is Required!');
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User Not Found!');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('Account Is Already Verified!');
  }

  const newCode = await generateVerificationCode();
  user.verificationCode = newCode;
  await user.save();

  await sendEmail({
    to: email,
    subject: 'Your New KaDpinozz Verification OTP',
    templateOptions: {
      title: 'New Verification OTP',
      greeting: `Hey ${user.name || ''},`,
      message: `<p>You requested a new verification OTP code for your KaDpinozz account:</p>
      <div style="text-align: center; margin: 26px 0;">
        <span style="display: inline-block; font-size: 2.2rem; font-weight: 800; letter-spacing: 8px; color: #047857; background: #ecfdf5; border: 2px dashed #059669; padding: 12px 30px; border-radius: 12px;">
          ${newCode}
        </span>
      </div>
      <p style="font-size: 0.9rem; color: #64748b; text-align: center;">⏱️ Valid for 10 minutes. Please enter this code on the verification screen.</p>`,
    },
  });

  res.status(200).json({ message: 'A new verification OTP has been sent to your email!' });
});

// @desc Forgot Password
// @route POST /api/users/forgotpassword
// @access Public

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email Address Is Required!');
  } else {
    if (emailValidator.validate(email)) {
      const user = await User.findOne({ email });

      if (user) {
        // Generate a reset token
        const resetToken = await generateVerificationCode();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 600000; // 10 minutes

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/forget-pwd?email=${encodeURIComponent(user.email)}&token=${resetToken}`;

        // Send the reset email
        const emailSent = await sendEmail({
          to: user.email,
          subject: 'Your KaDpinozz Password Reset Link & OTP',
          templateOptions: {
            title: 'Password Reset Request',
            greeting: `Hi ${user.name || ''},`,
            message: `<p>You requested a password reset for your KaDpinozz account.</p>
            <p>You can click the secure password reset link below to directly set a new password:</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);">
                Reset Password Link
              </a>
            </div>
            <p style="text-align: center; font-size: 0.9rem; color: #4b5563;">Or enter your 6-digit OTP code manually on the reset page:</p>
            <div style="text-align: center; margin: 16px 0;">
              <span style="display: inline-block; font-size: 2.2rem; font-weight: 800; letter-spacing: 8px; color: #047857; background: #ecfdf5; border: 2px dashed #059669; padding: 10px 24px; border-radius: 12px;">
                ${resetToken}
              </span>
            </div>
            <p style="font-size: 0.85rem; color: #64748b; text-align: center;">⏱️ Valid for 10 minutes. If you did not request this, please ignore this email.</p>`,
          },
        });

        if (emailSent) {
          const resetUserPwd = await user.save();

          if (resetUserPwd) {
            res.status(200).json({
              _id: resetUserPwd._id,
              name: resetUserPwd.name,
              email: resetUserPwd.email,
              phoneNumber: resetUserPwd.phoneNumber,
              address: resetUserPwd.address,
              orders: resetUserPwd.orders,
              isVerified: resetUserPwd.isVerified,
              token: generateToken(resetUserPwd._id),
              message: 'Password Reset Email Sent Successfully!',
            });
          } else {
            res.status(400);
            throw new Error('Error Updating User!');
          }
        } else {
          res.status(400);
          throw new Error('Error Sending Password Reset Email!');
        }
      } else {
        res.status(400);
        throw new Error('Invalid Email Address!');
      }
    } else {
      res.status(400);
      throw new Error('Invalid Email Address!');
    }
  }
});

// @desc Reset Password
// @route POST /api/users/resetpassword
// @access Public

const resetPassword = asyncHandler(async (req, res) => {
  const { email, resetToken, newPassword, confirmNewPassword } = req.body;

  if (!email || !resetToken || !newPassword || !confirmNewPassword) {
    res.status(400);
    throw new Error('All Fields Are Required!');
  } else {
    if (emailValidator.validate(email)) {
      const user = await User.findOne({
        email,
      });

      if (user) {
        if (user.resetPasswordExpire > Date.now()) {
          if (user.resetPasswordToken === resetToken) {
            if (newPassword !== confirmNewPassword) {
              res.status(400);
              throw new Error('Passwords Do Not Match!');
            } else {
              if (newPassword.length < 8) {
                res.status(400);
                throw new Error('Password Must Be At Least 8 Characters Long!');
              } else {
                const salt = await bcrypt.genSalt(10);
                hashedPassword = await bcrypt.hash(newPassword, salt);

                user.password = hashedPassword;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpire = undefined;

                const updatedUser = await user.save();

                if (updatedUser) {
                  res.status(200).json({
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phoneNumber: updatedUser.phoneNumber,
                    address: updatedUser.address,
                    orders: updatedUser.orders,
                    isVerified: updatedUser.isVerified,
                    token: generateToken(updatedUser._id),
                    message: 'Password Reset Successful!',
                  });
                } else {
                  res.status(400);
                  throw new Error('Error Resetting Password!');
                }
              }
            }
          } else {
            res.status(400);
            throw new Error('Invalid Reset Token!');
          }
        } else {
          res.status(400);
          throw new Error('Reset Token Expired!');
        }
      } else {
        res.status(404);
        throw new Error('User Not Found!');
      }
    } else {
      res.status(400);
      throw new Error('Invalid Email Address!');
    }
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address,
      orders: user.orders,
      isVerified: user.isVerified,
      message: 'User Profile Fetched Successfully!',
    });
  } else {
    res.status(404);
    throw new Error('User Not Found!');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    let { name, email, phoneNumber, address, password, confirmPassword } = req.body;

    if (emailValidator.validate(email)) {
      let match = false;

      if (password !== '') {
        match = await bcrypt.compare(password, user.password);
      }

      if (user.email === email && match) {
        res.status(400);
        throw new Error('You Have Not Made Any Changes!');
      } else {
        if (password !== '' && password !== confirmPassword) {
          res.status(400);
          throw new Error('Passwords Do Not Match!');
        } else {
          if (password.length < 8) {
            res.status(400);
            throw new Error('Password Must Be At Least 8 Characters Long!');
          } else {
            if (password !== '') {
              const salt = await bcrypt.genSalt(Number(process.env.SALT));
              const hashedPassword = await bcrypt.hash(password, salt);
              user.password = hashedPassword;
            }

            user.name = name || user.name;
            user.email = email || user.email;
            user.phoneNumber = phoneNumber || user.phoneNumber;
            user.address = address || user.address;

            const updatedUser = await user.save();

            if (updatedUser) {
              res.status(200).json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber,
                address: updatedUser.address,
                orders: updatedUser.orders,
                isVerified: updatedUser.isVerified,
                token: generateToken(updatedUser._id),
                message: 'User Profile Updated Successfully!',
              });
            } else {
              res.status(400);
              throw new Error('Error Updating User Profile!');
            }
          }
        }
      }
    } else {
      res.status(400);
      throw new Error('Invalid Email or Password!');
    }
  } else {
    res.status(404);
    throw new Error('User Not Found!');
  }
});

// @desc    Get all Users
// @route   GET /api/users
// @access  Private/Admin

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});

  if (users) {
    res.status(200).json(users);
  } else {
    res.status(404);
    throw new Error('Users Not Found!');
  }
});

// @desc    Get User by ID
// @route   GET /api/users/:id
// @access  Private/Admin

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error('User Not Found!');
  }
});

// @desc    Update User By ID
// @route   PUT /api/users/:id
// @access  Private/Admin

const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    let { name, email, phoneNumber, address } = req.body;

    if (emailValidator.validate(email)) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.address = address || user.address;

      const updatedUser = await user.save();

      if (updatedUser) {
        res.status(200).json({
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
          address: updatedUser.address,
          orders: updatedUser.orders,
          isVerified: updatedUser.isVerified,
          token: generateToken(updatedUser._id),
          message: 'User Updated Successfully!',
        });
      } else {
        res.status(400);
        throw new Error('Error Updating User!');
      }
    } else {
      res.status(400);
      throw new Error('Invalid Email Address!');
    }
  } else {
    res.status(404);
    throw new Error('User Not Found!');
  }
});

// @desc    Delete a User By Id
// @route   DELETE /api/users/:id
// @access  Private/Admin

const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (user) {
    res.status(200).json({ message: 'User Removed Successfully!' });
  } else {
    res.status(404);
    throw new Error('User Not Found!');
  }
});

// Export Controllers
module.exports = {
  authUser,
  registerUser,
  verifyUser,
  resendVerificationCode,
  sendOTP,
  loginWithOTP,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
