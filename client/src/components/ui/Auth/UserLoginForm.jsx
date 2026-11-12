import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaBolt, FaKey, FaShieldAlt } from 'react-icons/fa';

import Button from '../Button';
import Loader from '../Loader';
import Message from '../Message';

import {
  loginUser,
  sendInstantOTP,
  loginWithInstantOTP,
} from '../../../redux/asyncThunks/userThunks';

function UserLoginForm() {
  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' | 'password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpNotice, setOtpNotice] = useState('');
  const [sendingOTP, setSendingOTP] = useState(false);

  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const { loading, userLoginError } = user;

  const handlePasswordLogin = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  const handleSendOTP = async (e) => {
    e?.preventDefault();
    if (!email) {
      setOtpNotice('Please enter your email address first.');
      return;
    }
    setSendingOTP(true);
    setOtpNotice('');
    try {
      const res = await dispatch(sendInstantOTP({ email })).unwrap();
      setOtpSent(true);
      setOtpNotice(res.message || `OTP sent! Check your inbox at ${email}`);
    } catch (err) {
      setOtpNotice(err.message || 'Failed to dispatch OTP. Please check your email.');
    } finally {
      setSendingOTP(false);
    }
  };

  const handleOTPLogin = (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setOtpNotice('Please enter the 6-digit OTP code.');
      return;
    }
    dispatch(loginWithInstantOTP({ email, otp }));
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center w-full py-16 px-14">
          <Loader />
        </div>
      ) : (
        <div className="w-full">
          <div className="text-center mb-5">
            <h2 className="text-2xl font-black text-gray-900">Sign In to KaDpinozz</h2>
            <p className="text-xs text-emerald-700 font-semibold mt-1">
              Fresh &amp; Healthy Pizza Experience
            </p>
          </div>

          {/* Toggle between Instant OTP & Password */}
          <div className="flex bg-emerald-50 p-1 rounded-xl mb-5 border border-emerald-200">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('otp');
                setOtpNotice('');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMethod === 'otp'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-emerald-800'
              }`}
            >
              <FaBolt className="text-xs" />
              Instant OTP Login
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('password');
                setOtpNotice('');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMethod === 'password'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-emerald-800'
              }`}
            >
              <FaKey className="text-xs" />
              Password Login
            </button>
          </div>

          {userLoginError && <Message>{userLoginError}</Message>}
          {otpNotice && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl p-3 mb-4 text-center">
              {otpNotice}
            </div>
          )}

          {loginMethod === 'otp' ? (
            /* Instant OTP Flow */
            <form onSubmit={otpSent ? handleOTPLogin : handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    placeholder="Enter your email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {!otpSent && (
                    <button
                      type="submit"
                      disabled={sendingOTP || !email}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-md shrink-0 transition-colors"
                    >
                      {sendingOTP ? 'Sending...' : 'Send OTP'}
                    </button>
                  )}
                </div>
              </div>

              {otpSent && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      placeholder="• • • • • •"
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      autoFocus
                      className="w-full text-center tracking-widest text-2xl font-black text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full rounded-xl py-3.5 font-bold shadow-md">
                    Verify &amp; Sign In
                  </Button>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                    <span>Didn&apos;t get the code?</span>
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={sendingOTP}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      {sendingOTP ? 'Sending...' : 'Resend OTP'}
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : (
            /* Traditional Password Login */
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  placeholder="Enter Email Address"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  placeholder="Enter Password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end text-xs">
                <Link to="/forget-pwd" className="text-emerald-700 font-semibold hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" variant="primary" className="w-full rounded-xl py-3.5 font-bold shadow-md">
                Sign In
              </Button>
            </form>
          )}
        </div>
      )}
    </>
  );
}

export default UserLoginForm;
