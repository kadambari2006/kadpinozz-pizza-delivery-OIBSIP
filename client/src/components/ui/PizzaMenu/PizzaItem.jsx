import Proptypes from 'prop-types';
import { useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';

// Import Components
import AddtoCartButton from '../Cart/AddToCartButton';

function PizzaItem({ pizza }) {
  const [qty, setQty] = useState(1);
  return (
    <div
      key={pizza._id}
      className="bg-emerald-50 border border-emerald-200 rounded-2xl shadow-lg overflow-hidden hover:transform hover:scale-105 transition-transform duration-500 ease-in-out flex flex-col justify-between"
    >
      <img
        src={pizza.imageUrl}
        alt={pizza.name}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/images/pizza.png';
        }}
        className="w-full h-48 object-cover p-2 border-b border-emerald-200 bg-white"
      />

      <div className="p-4 flex flex-col justify-between items-start flex-1 w-full">
        <div className="flex justify-between items-center w-full">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{pizza.name}</h3>
          <span className="text-2xl font-black text-emerald-600">
            ₹{pizza.price}
          </span>
        </div>
        <p className="text-sm text-gray-700 mb-2">{pizza.description}</p>
        <p className="text-sm text-emerald-800 font-semibold mb-3">
          <span>Size: </span>
          {pizza.size.charAt(0).toUpperCase() + pizza.size.slice(1)}
        </p>
        <div className="flex justify-between items-center w-full space-x-1 mt-auto pt-2 border-t border-emerald-200/60">
          <AddtoCartButton id={pizza._id} qty={qty} />
          <div className="flex justify-between items-center space-x-2 text-sm font-semibold">
            <button
              className="text-red-500 hover:text-red-700 p-1"
              onClick={() => {
                if (qty > 1) {
                  setQty(qty - 1);
                }
              }}
            >
              <FaMinus />
            </button>
            <p className="text-gray-800">Qty: {qty}</p>
            <button
              className="text-emerald-600 hover:text-emerald-800 p-1"
              onClick={() => {
                if (qty < 10) {
                  setQty(qty + 1);
                }
              }}
            >
              <FaPlus />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

PizzaItem.propTypes = {
  pizza: Proptypes.object.isRequired,
};

export default PizzaItem;
