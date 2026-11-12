import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FaTimes, FaShieldAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

// Import Thunks
import {
  getUserDetails,
  verifyEmail,
  resendVerificationOTP,
} from '../../../redux/asyncThunks/userThunks';

// Import Components
import Button from '../Button';
import Loader from '../Loader';
import Message from '../Message';

function VerficationModal({ onClose }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const { loading, userDetails, userVerifyEmailError, userVerifyEmailSuccess } =
    user;

  const [email, setEmail] = useState(userDetails?.email || '');
  const [verificationCode, setVerificationCode] = useState('');

  const handleModalClose = () => {
    setModalVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(verifyEmail({ email, verificationCode }));
  };

  const handleResendOTP = async () => {
    if (!email) {
      setResendStatus('Please enter your email first.');
      return;
    }
    setResendLoading(true);
    setResendStatus('');
    try {
      const res = await dispatch(resendVerificationOTP({ email })).unwrap();
      setResendStatus(res.message || 'OTP resent successfully! Please check your email.');
    } catch (err) {
      setResendStatus(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    if (!userDetails) {
      dispatch(getUserDetails({}));
    }

    if (userVerifyEmailSuccess) {
      dispatch(getUserDetails({}));
      setModalVisible(false);
      setTimeout(() => {
        onClose();
      }, 300);
    }

    if (onClose) {
      setModalVisible(true);
    }
  }, [dispatch, onClose, userVerifyEmailSuccess, userDetails]);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50 p-4 backdrop-filter backdrop-blur-sm transition-opacity duration-200 ${
        modalVisible ? 'opacity-100' : 'opacity-0 delay-150'
      }`}
      onClick={handleModalClose}
    >
      <div
        className="bg-white rounded-3xl p-6 sm:p-8 w-full sm:w-2/3 md:w-1/2 max-w-lg shadow-2xl border border-emerald-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-2xl">
            <FaShieldAlt className="text-emerald-600" />
            <h2>Verify Your Email</h2>
          </div>
          <button
            className="text-gray-400 hover:text-red-500 rounded-full p-1 transition-colors"
            onClick={handleModalClose}
          >
            <FaTimes />
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <form className="w-full" onSubmit={submitHandler}>
            <p className="text-gray-600 text-sm mb-4">
              Enter the 6-digit OTP code sent to your email to activate your <strong>KaDpinozz</strong> account.
            </p>

            {userVerifyEmailError && <Message>{userVerifyEmailError}</Message>}
            {resendStatus && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm rounded-lg p-3 my-2 text-center">
                {resendStatus}
              </div>
            )}

            <div className="w-full my-3">
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="w-full my-3">
              <label htmlFor="verificationCode" className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                maxLength="6"
                placeholder="• • • • • •"
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                className="w-full text-center tracking-widest text-2xl font-black text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full rounded-xl py-3.5 mt-2 font-bold shadow-md"
            >
              Verify OTP &amp; Activate Account
            </Button>

            <div className="text-center mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Didn&apos;t receive the code?</span>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-emerald-700 font-bold hover:underline disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

VerficationModal.propTypes = {
  onClose: PropTypes.func,
};

export default VerficationModal;
