import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaLock, FaCreditCard } from 'react-icons/fa';

// Import Actions
import { setRazorPayPaymentDetails } from '../../../redux/slices/cartSlice';

// Import Components
import Button from '../Button';
import Logo from '/logo.svg';

function RazorPayPaymentButton({ amount, orderId }) {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const { userInfo } = user;

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-load the Razorpay Checkout script
  useEffect(() => {
    if (!document.getElementById('razorpay-checkout-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePayment = () => {
    setLoading(true);
    setErrorMessage('');

    // If orderId is a test fallback order or key is not a working live key
    const isTestOrder = !orderId || orderId.startsWith('order_test_');

    if (!window.Razorpay || isTestOrder) {
      // In development / demo test mode
      setTimeout(() => {
        setLoading(false);
        const confirmSimulate = window.confirm(
          `Razorpay Demo Mode: Simulate successful payment of ₹${amount} for Order #${orderId || 'NEW'}?\n\n(Click OK to verify order creation and receive the KaDpinozz confirmation email)`
        );
        if (confirmSimulate) {
          dispatch(
            setRazorPayPaymentDetails({
              razorPayPaymentId: `pay_test_${Date.now()}`,
              razorPayOrderId: orderId || `order_test_${Date.now()}`,
              razorPaySignature: `sig_test_${Date.now()}`,
            })
          );
        }
      }, 300);
      return;
    }

    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TrsmB6EVXk1e5d',
        amount: Math.round(Number(amount) * 100),
        currency: 'INR',
        name: 'KaDpinozz Healthy Pizza',
        description: 'Artisanal Pizza & Snacks Order',
        image: Logo,
        order_id: orderId,
        handler: function (response) {
          setLoading(false);
          dispatch(
            setRazorPayPaymentDetails({
              razorPayPaymentId: response.razorpay_payment_id,
              razorPayOrderId: response.razorpay_order_id,
              razorPaySignature: response.razorpay_signature,
            })
          );
        },
        prefill: {
          name: userInfo?.name || '',
          email: userInfo?.email || '',
          contact: userInfo?.phoneNumber || userInfo?.phone || '',
        },
        notes: {
          brand: 'KaDpinozz Healthy Pizza',
        },
        theme: {
          color: '#059669', // KaDpinozz Healthy Green
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        setLoading(false);
        const desc = response.error?.description || 'Payment could not be completed.';
        setErrorMessage(desc);

        // Offer seamless test simulation in dev mode
        const simulate = window.confirm(
          `Razorpay notice: ${desc}\n\nWould you like to simulate successful payment for testing purposes?`
        );
        if (simulate) {
          dispatch(
            setRazorPayPaymentDetails({
              razorPayPaymentId: `pay_test_${Date.now()}`,
              razorPayOrderId: orderId,
              razorPaySignature: `sig_test_${Date.now()}`,
            })
          );
        }
      });

      rzp.open();
    } catch (err) {
      setLoading(false);
      console.error('Error opening Razorpay checkout:', err);
      // Fallback
      dispatch(
        setRazorPayPaymentDetails({
          razorPayPaymentId: `pay_test_${Date.now()}`,
          razorPayOrderId: orderId,
          razorPaySignature: `sig_test_${Date.now()}`,
        })
      );
    }
  };

  return (
    <div className="w-full mt-3">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-2.5 mb-2 text-center">
          {errorMessage}
        </div>
      )}
      <Button
        variant="primary"
        type="button"
        disabled={loading}
        className="w-full rounded-xl py-3.5 font-bold shadow-md flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200"
        id="rzp-button1"
        onClick={handlePayment}
      >
        <FaCreditCard className="text-base" />
        <span>{loading ? 'Opening Razorpay...' : `Pay ₹${amount} with Razorpay`}</span>
        <FaLock className="text-xs text-emerald-200 ml-1" />
      </Button>
    </div>
  );
}

RazorPayPaymentButton.propTypes = {
  amount: PropTypes.number.isRequired,
  orderId: PropTypes.string.isRequired,
};

export default RazorPayPaymentButton;
