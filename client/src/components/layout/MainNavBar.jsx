import { useEffect, useRef, useState } from 'react';
import { CgLogIn } from 'react-icons/cg';
import { FaLeaf } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';

// Import Actions
import { clearAdminUserData } from '../../redux/slices/adminSlice';
import { clearCartData } from '../../redux/slices/cartSlice';
import { clearPizzaData } from '../../redux/slices/pizzaSlice';
import { clearUserData } from '../../redux/slices/userSlice';
import { clearOrderData } from '../../redux/slices/orderSlice';
import { clearInventoryData } from '../../redux/slices/inventorySlice';

// Import Images
import Logo from '/logo.svg';

// Import Components
import Button from '../ui/Button';
import CartButton from '../ui/Cart/CartButton';
import CartModal from '../ui/Cart/CartModal/CartModal';
import ProfileBtnAndDropOnNav from '../ui/Profile/ProfileBtnAndDropOnNav';

function MainNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropIsOpen, setDropIsOpen] = useState(false);
  const [cartIsOpen, setCartIsOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropIsOpen(false);
      }
    };

    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownRef]);

  const NavItems = [
    {
      route: '/',
      name: 'Home',
    },
    {
      route: '/menu',
      name: 'Menu',
    },
    {
      route: '/my-orders',
      name: 'My Orders',
    },
    {
      route: '/about',
      name: 'About',
    },
  ];

  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const { userInfo } = user;

  const admin = useSelector((state) => state.admin);
  const { adminUserInfo } = admin;

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const logoutHandler = () => {
    dispatch(clearUserData());
    dispatch(clearPizzaData());
    dispatch(clearAdminUserData());
    dispatch(clearCartData());
    dispatch(clearOrderData());
    dispatch(clearInventoryData());
    setDropIsOpen(!dropIsOpen);
  };

  return (
    <>
      <nav className="fixed bg-white w-screen flex flex-row items-center justify-between px-6 sm:px-16 shadow-sm space-x-3 border-b border-emerald-200">
        <NavLink
          to="/"
          className="flex flex-row justify-center items-center font-bold text-lg sm:text-2xl py-2"
        >
          <img
            src={Logo}
            alt="KaDpinozz Logo"
            className="h-10 w-10 sm:h-12 sm:w-12 mr-2"
          />
          <span className="text-emerald-800 tracking-tight font-extrabold">KaDpinozz</span>
          <FaLeaf className="ml-1 text-emerald-600 text-sm hidden sm:inline" />
        </NavLink>

        {/* Desktop Menu */}
        <div className="items-center justify-center space-x-5 hidden md:inline-flex">
          {NavItems.map((navItem, index) => (
            <NavLink
              key={index}
              to={navItem.route}
              className={({ isActive }) => {
                if (isActive) {
                  return 'text-base font-semibold text-emerald-700 border-b-2 border-emerald-600 pb-0.5';
                }
                return 'text-base font-medium text-gray-700 hover:text-emerald-700 hover:border-b-2 hover:border-emerald-500 pb-0.5 transition-colors';
              }}
            >
              {navItem.name}
            </NavLink>
          ))}
        </div>

        <div className="flex flex-row items-center justify-center space-x-1 sm:space-x-4">
          <CartButton onClick={() => setCartIsOpen(!cartIsOpen)}>
            {cartItems ? cartItems.length : 0}
          </CartButton>

          {userInfo || adminUserInfo ? (
            <ProfileBtnAndDropOnNav
              dropIsOpen={dropIsOpen}
              setDropIsOpen={setDropIsOpen}
              dropdownRef={dropdownRef}
              logoutHandler={logoutHandler}
            />
          ) : (
            <Link to={'/login'}>
              <Button
                variant="primary"
                type="button"
                className="font-medium py-2 px-4 rounded-full hidden md:inline-flex items-center text-base"
              >
                <CgLogIn className="mr-2" />
                Login / Register
              </Button>
            </Link>
          )}
        </div>

        {/* Nav Menu Open Button (Mobile) */}
        <button
          type="button"
          className="text-gray-700 hover:text-emerald-700 focus:outline-none md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed font-semibold inset-0 bg-emerald-950 bg-opacity-95 flex items-center justify-center md:hidden transition-all duration-300 ease-in-out z-50">
          {/* Close Button */}
          <button
            type="button"
            className="absolute top-6 right-6 text-white hover:text-emerald-300 focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="flex flex-col items-center gap-2 mb-6 text-center">
            <img src={Logo} alt="KaDpinozz" className="h-16 w-16" />
            <span className="text-white text-2xl font-extrabold tracking-wide">KaDpinozz</span>
            <span className="text-emerald-300 text-xs font-medium">Healthy Pizza &amp; Snacks</span>
          </div>

          <nav className="flex flex-col items-center justify-center space-y-6">
            {NavItems.map((navItem, index) => (
              <NavLink
                key={index}
                to={navItem.route}
                onClick={() => setIsOpen(!isOpen)}
                className={({ isActive }) => {
                  if (isActive) {
                    return 'text-2xl text-emerald-300 font-bold';
                  }
                  return 'text-2xl text-white hover:text-emerald-300 font-semibold';
                }}
              >
                {navItem.name}
              </NavLink>
            ))}
            {!userInfo && !adminUserInfo && (
              <Link to="/login">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="font-semibold text-xl py-2 px-6 rounded-full inline-flex items-center mt-4 border-white text-white"
                >
                  <CgLogIn className="mr-2" />
                  Login / Register
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}

      {cartIsOpen && (
        <CartModal
          onClose={() => {
            setCartIsOpen(false);
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
}

export default MainNavbar;
