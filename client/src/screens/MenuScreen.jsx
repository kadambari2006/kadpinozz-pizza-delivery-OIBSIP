import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

// Import Thunks
import { listPizzas } from '../redux/asyncThunks/pizzaThunks';
import { getUserDetails } from '../redux/asyncThunks/userThunks';

// Import Components
import VerficationModal from '../components/ui/Auth/VerficationModal';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Message from '../components/ui/Message';
import PizzaList from '../components/ui/PizzaMenu/PizzaList';

function MenuScreen() {
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false);

  const user = useSelector((state) => state.user);
  const { userDetails } = user;

  const pizza = useSelector((state) => state.pizza);
  const { loading, pizzaList, pizzaListError } = pizza;

  const cart = useSelector((state) => state.cart);
  const { cartAddItemError } = cart;

  useEffect(() => {
    if (!userDetails) {
      dispatch(getUserDetails({}));
    }
    if (!pizzaList || pizzaList.length < 1) {
      dispatch(listPizzas({}));
    }
  }, [dispatch, userDetails, pizzaList]);

  useEffect(() => {
    if (userDetails && !userDetails.isVerified) {
      setModalVisible(true);
    }
  }, [userDetails]);

  return (
    <>
      <section className="min-h-screen flex flex-col justify-center items-center pt-24 pb-12 px-6 sm:px-16 bg-gradient-to-b from-emerald-100 to-white">
        {loading ? (
          <Loader />
        ) : pizzaListError || cartAddItemError ? (
          <Message>{pizzaListError || cartAddItemError}</Message>
        ) : pizzaList.length > 0 ? (
          <>
            <div className="w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between my-6 gap-4">
              <div>
                <span className="text-emerald-700 font-bold uppercase tracking-wider text-xs">Fresh &amp; Wholesome</span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  KaDpinozz Healthy Menu
                </h1>
              </div>
              {userDetails && (
                <Link to="/custom-pizza">
                  <Button variant="primary" className="rounded-full font-bold shadow-md">
                    + Build Custom Healthy Pizza
                  </Button>
                </Link>
              )}
            </div>
            <PizzaList
              pizzaList={pizzaList.filter(
                (pizza) => pizza.createdBy === 'admin'
              )}
            />
          </>
        ) : (
          <div className="text-3xl font-bold text-emerald-700">
            No Healthy Pizzas Found!
          </div>
        )}
      </section>
      {modalVisible && (
        <VerficationModal onClose={() => setModalVisible(false)} />
      )}
    </>
  );
}

export default MenuScreen;
