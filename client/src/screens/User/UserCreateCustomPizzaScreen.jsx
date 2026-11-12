import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FaCheck,
  FaArrowRight,
  FaArrowLeft,
  FaShoppingCart,
  FaPizzaSlice,
  FaLeaf,
  FaSeedling,
} from 'react-icons/fa';

// Import Thunks
import { createPizza } from '../../redux/asyncThunks/pizzaThunks';
import { listInventory } from '../../redux/asyncThunks/inventoryThunks';
import { addToCart } from '../../redux/slices/cartSlice';

// Import Components
import Loader from '../../components/ui/Loader';
import Message from '../../components/ui/Message';

function UserCreateCustomPizzaScreen() {
  const [currentStep, setCurrentStep] = useState(1); // 1: Base, 2: Sauce, 3: Cheese, 4: Veggies, 5: Review

  const [name, setName] = useState('My Custom KaDpinozz Pizza');
  const [description, setDescription] = useState(
    'Handcrafted custom pizza with farm-fresh organic toppings and wholesome artisanal ingredients.'
  );
  const [imageUrl] = useState(
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80'
  );
  const [size, setSize] = useState('medium');
  const [qty, setQty] = useState(1);

  const [selectedBase, setSelectedBase] = useState('');
  const [selectedSauce, setSelectedSauce] = useState('');
  const [selectedCheese, setSelectedCheese] = useState('');
  const [selectedVeggies, setSelectedVeggies] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const pizza = useSelector((state) => state.pizza);
  const {
    loading: pizzaLoading,
    pizzaInfo,
    pizzaCreateError,
    pizzaCreateSuccess,
  } = pizza;

  const inventory = useSelector((state) => state.inventory);
  const {
    loading: inventoryLoading,
    inventoryList,
    inventoryListError,
  } = inventory;

  const cart = useSelector((state) => state.cart);
  const { loading: cartLoading, cartAddItemError, cartAddItemSuccess } = cart;

  useEffect(() => {
    dispatch(listInventory());
  }, [dispatch]);

  // Pricing calculation based on size tier (all above ₹500)
  const sizePrices = {
    small: 549,
    medium: 649,
    large: 749,
    'extra-large': 799,
  };

  const currentPrice = sizePrices[size] || 649;

  // Auto-select first item when inventory loads if none selected
  useEffect(() => {
    if (inventoryList?.bases?.length > 0 && !selectedBase) {
      setSelectedBase(inventoryList.bases[0]._id);
    }
    if (inventoryList?.sauces?.length > 0 && !selectedSauce) {
      setSelectedSauce(inventoryList.sauces[0]._id);
    }
    if (inventoryList?.cheeses?.length > 0 && !selectedCheese) {
      setSelectedCheese(inventoryList.cheeses[0]._id);
    }
  }, [inventoryList, selectedBase, selectedSauce, selectedCheese]);

  const handleToggleVeggie = (veggieId) => {
    if (selectedVeggies.includes(veggieId)) {
      setSelectedVeggies(selectedVeggies.filter((id) => id !== veggieId));
    } else {
      setSelectedVeggies([...selectedVeggies, veggieId]);
    }
  };

  const handleCreateCustomPizza = (e) => {
    if (e) e.preventDefault();

    if (!selectedBase) {
      alert('Please complete Step 1: Choose a pizza base!');
      setCurrentStep(1);
      return;
    }
    if (!selectedSauce) {
      alert('Please complete Step 2: Choose a sauce!');
      setCurrentStep(2);
      return;
    }
    if (!selectedCheese) {
      alert('Please complete Step 3: Choose a cheese type!');
      setCurrentStep(3);
      return;
    }

    const pizzaData = {
      name: name.trim() || 'My Custom KaDpinozz Pizza',
      description,
      bases: [selectedBase],
      sauces: [selectedSauce],
      cheeses: [selectedCheese],
      veggies: selectedVeggies,
      price: currentPrice,
      size,
      imageUrl,
    };

    dispatch(createPizza(pizzaData));
  };

  useEffect(() => {
    if (pizzaCreateSuccess && pizzaInfo && pizzaInfo._id) {
      dispatch(addToCart({ id: pizzaInfo._id, qty: Number(qty) || 1 }));
    }
  }, [dispatch, pizzaCreateSuccess, pizzaInfo, qty]);

  useEffect(() => {
    if (cartAddItemSuccess) {
      navigate('/checkout');
    }
  }, [cartAddItemSuccess, navigate]);

  // Lookup helpers
  const getBaseObj = () =>
    inventoryList?.bases?.find((b) => b._id === selectedBase);
  const getSauceObj = () =>
    inventoryList?.sauces?.find((s) => s._id === selectedSauce);
  const getCheeseObj = () =>
    inventoryList?.cheeses?.find((c) => c._id === selectedCheese);
  const getSelectedVeggieObjs = () =>
    inventoryList?.veggies?.filter((v) => selectedVeggies.includes(v._id)) || [];

  const steps = [
    { num: 1, title: 'Pizza Base', label: 'Step 1: Choose Base (5 Options)' },
    { num: 2, title: 'Sauce', label: 'Step 2: Choose Sauce (5 Options)' },
    { num: 3, title: 'Cheese', label: 'Step 3: Choose Cheese Type' },
    { num: 4, title: 'Vegetables', label: 'Step 4: Choose Vegetables (Multiple Select)' },
    { num: 5, title: 'Finalize', label: 'Step 5: Review & Add to Cart' },
  ];

  return (
    <section className="min-h-screen flex flex-col justify-center items-center pt-24 pb-16 px-4 sm:px-12 bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-3 border border-emerald-300">
            <FaSeedling className="text-emerald-600" />
            <span>Interactive Custom Pizza Builder</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Craft Your <span className="text-emerald-600">KaDpinozz</span> Pizza
          </h1>
          <p className="text-gray-600 mt-2 text-base sm:text-lg max-w-2xl mx-auto">
            Build your personalized, healthy pizza step-by-step from fresh, organic ingredients.
          </p>
        </div>

        {/* Step Progress Tracker */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-4 mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-100 w-full z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-300 z-0"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((s) => {
              const isCompleted = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    // Allow navigating back or forward if earlier steps chosen
                    if (s.num <= currentStep || (s.num === 2 && selectedBase) || (s.num === 3 && selectedSauce) || (s.num === 4 && selectedCheese)) {
                      setCurrentStep(s.num);
                    }
                  }}
                  className={`relative z-10 flex flex-col items-center group focus:outline-none`}
                >
                  <div
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-200 shadow-sm ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-200'
                        : 'bg-white text-gray-400 border-2 border-gray-200'
                    }`}
                  >
                    {isCompleted ? <FaCheck className="text-xs sm:text-sm" /> : s.num}
                  </div>
                  <span
                    className={`mt-1.5 text-xs font-semibold hidden md:inline-block ${
                      isCurrent
                        ? 'text-emerald-700'
                        : isCompleted
                        ? 'text-gray-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        {(pizzaCreateError || inventoryListError || cartAddItemError) && (
          <div className="mb-4">
            <Message>
              {pizzaCreateError || inventoryListError || cartAddItemError}
            </Message>
          </div>
        )}

        {/* Main Builder Card */}
        {inventoryLoading ? (
          <div className="p-12 bg-white rounded-3xl shadow-sm border border-emerald-200 flex justify-center">
            <Loader />
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-lg border border-emerald-200 overflow-hidden">
            {/* Step Heading */}
            <div className="bg-emerald-600 text-white px-6 sm:px-8 py-4 flex items-center justify-between">
              <div>
                <span className="text-emerald-100 text-xs font-bold uppercase tracking-wider">
                  Step {currentStep} of {steps.length}
                </span>
                <h2 className="text-xl sm:text-2xl font-black">
                  {steps[currentStep - 1].label}
                </h2>
              </div>
              <FaPizzaSlice className="text-2xl sm:text-3xl text-emerald-200 opacity-80" />
            </div>

            <div className="p-6 sm:p-8">
              {/* STEP 1: CHOOSE A PIZZA BASE (5 OPTIONS) */}
              {currentStep === 1 && (
                <div>
                  <p className="text-gray-600 text-sm mb-6">
                    Select your handcrafted crust. All crusts are prepared fresh daily using wholesome grains and nutritious ingredients.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {inventoryList?.bases?.map((baseItem) => {
                      const isSelected = selectedBase === baseItem._id;
                      return (
                        <div
                          key={baseItem._id}
                          onClick={() => setSelectedBase(baseItem._id)}
                          className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 flex flex-col justify-between relative ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 shadow-md ring-2 ring-emerald-200'
                              : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="font-bold text-gray-900 text-lg">
                              {baseItem.item}
                            </span>
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isSelected && <FaCheck className="text-xs" />}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-emerald-100 text-xs text-gray-500">
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <FaLeaf className="text-xs" /> Healthy Crust
                            </span>
                            <span className="font-bold text-emerald-800">Included</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: CHOOSE A SAUCE (5 OPTIONS) */}
              {currentStep === 2 && (
                <div>
                  <p className="text-gray-600 text-sm mb-6">
                    Choose your artisan sauce layer, made with sun-ripened tomatoes, cold-pressed herbs, and natural spices.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {inventoryList?.sauces?.map((sauceItem) => {
                      const isSelected = selectedSauce === sauceItem._id;
                      return (
                        <div
                          key={sauceItem._id}
                          onClick={() => setSelectedSauce(sauceItem._id)}
                          className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 flex flex-col justify-between relative ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 shadow-md ring-2 ring-emerald-200'
                              : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="font-bold text-gray-900 text-lg">
                              {sauceItem.item}
                            </span>
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isSelected && <FaCheck className="text-xs" />}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-emerald-100 text-xs text-gray-500">
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <FaLeaf className="text-xs" /> 100% Natural
                            </span>
                            <span className="font-bold text-emerald-800">Included</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: CHOOSE A CHEESE TYPE */}
              {currentStep === 3 && (
                <div>
                  <p className="text-gray-600 text-sm mb-6">
                    Pick your cheese base — crafted from organic dairy or clean plant-based alternatives.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {inventoryList?.cheeses?.map((cheeseItem) => {
                      const isSelected = selectedCheese === cheeseItem._id;
                      return (
                        <div
                          key={cheeseItem._id}
                          onClick={() => setSelectedCheese(cheeseItem._id)}
                          className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 flex flex-col justify-between relative ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 shadow-md ring-2 ring-emerald-200'
                              : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="font-bold text-gray-900 text-base">
                              {cheeseItem.item}
                            </span>
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors shrink-0 ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isSelected && <FaCheck className="text-xs" />}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-emerald-100 text-xs text-gray-500">
                            <span className="text-emerald-700 font-semibold">Wholesome</span>
                            <span className="font-bold text-emerald-800">Included</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: CHOOSE VEGETABLES (MULTIPLE SELECT) */}
              {currentStep === 4 && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                    <p className="text-gray-600 text-sm">
                      Select multiple vegetables and seed garnishes to load your pizza with antioxidants and clean crunch.
                    </p>
                    <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full border border-emerald-300 self-start sm:self-auto">
                      {selectedVeggies.length} Selected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {inventoryList?.veggies?.map((veggieItem) => {
                      const isSelected = selectedVeggies.includes(veggieItem._id);
                      return (
                        <div
                          key={veggieItem._id}
                          onClick={() => handleToggleVeggie(veggieItem._id)}
                          className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 flex flex-col justify-between relative ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 shadow-md ring-2 ring-emerald-200'
                              : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="font-bold text-gray-900 text-base">
                              {veggieItem.item}
                            </span>
                            <div
                              className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-colors shrink-0 ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isSelected && <FaCheck className="text-xs" />}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-emerald-100 text-xs text-gray-500">
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <FaLeaf className="text-xs" /> Antioxidant
                            </span>
                            <span className="font-bold text-emerald-800">Fresh Pick</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW, SIZE SELECTION & ADD TO CART */}
              {currentStep === 5 && (
                <div>
                  <p className="text-gray-600 text-sm mb-6">
                    Review your custom recipe, choose your size and quantity, and add directly to your order.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ingredients Review Card */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                      <h3 className="font-bold text-emerald-900 text-lg mb-4 flex items-center gap-2">
                        <FaLeaf className="text-emerald-600" /> Your Custom Recipe
                      </h3>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-2 border-b border-emerald-200/60">
                          <span className="text-gray-600 font-medium">Pizza Base:</span>
                          <span className="font-bold text-emerald-800">
                            {getBaseObj()?.item || 'None selected'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-emerald-200/60">
                          <span className="text-gray-600 font-medium">Sauce:</span>
                          <span className="font-bold text-emerald-800">
                            {getSauceObj()?.item || 'None selected'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-emerald-200/60">
                          <span className="text-gray-600 font-medium">Cheese:</span>
                          <span className="font-bold text-emerald-800">
                            {getCheeseObj()?.item || 'None selected'}
                          </span>
                        </div>
                        <div className="py-2">
                          <span className="text-gray-600 font-medium block mb-1">
                            Vegetables &amp; Toppings ({selectedVeggies.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {getSelectedVeggieObjs().length > 0 ? (
                              getSelectedVeggieObjs().map((v) => (
                                <span
                                  key={v._id}
                                  className="bg-white border border-emerald-300 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold shadow-xs"
                                >
                                  {v.item}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 italic text-xs">
                                No extra vegetables selected (plain cheese pizza)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Size & Quantity Selector Card */}
                    <div className="bg-white border border-emerald-200 rounded-2xl p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-4">
                          Size &amp; Quantity
                        </h3>

                        {/* Pizza Name */}
                        <div className="mb-4">
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                            Custom Pizza Name
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Name your pizza"
                            className="w-full text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        {/* Size Buttons */}
                        <div className="mb-4">
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                            Select Size
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(sizePrices).map(([sKey, sPrice]) => (
                              <button
                                key={sKey}
                                type="button"
                                onClick={() => setSize(sKey)}
                                className={`p-3 rounded-xl border text-center transition-all ${
                                  size === sKey
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold ring-2 ring-emerald-300'
                                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                }`}
                              >
                                <span className="block capitalize text-sm">{sKey}</span>
                                <span className="block text-xs text-emerald-700 font-black">
                                  ₹{sPrice}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="mb-4">
                          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                            Quantity
                          </label>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg flex items-center justify-center transition-colors"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={qty}
                              onChange={(e) =>
                                setQty(Math.max(1, parseInt(e.target.value) || 1))
                              }
                              className="w-16 h-10 text-center font-bold text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => setQty((prev) => prev + 1)}
                              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg flex items-center justify-center transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Total Price & Add Button */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-gray-600 font-medium text-sm">
                            Total Price:
                          </span>
                          <span className="text-3xl font-black text-emerald-700">
                            ₹{currentPrice * qty}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={pizzaLoading || cartLoading}
                          onClick={handleCreateCustomPizza}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 text-base disabled:opacity-50"
                        >
                          <FaShoppingCart className="text-lg" />
                          <span>
                            {pizzaLoading || cartLoading
                              ? 'Adding to Order...'
                              : 'Add Custom Pizza to Cart'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Step Navigation Bar */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => prev - 1)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                    >
                      <FaArrowLeft className="text-xs" />
                      <span>Back</span>
                    </button>
                  )}
                </div>

                <div>
                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (currentStep === 1 && !selectedBase) {
                          alert('Please choose a pizza base to continue!');
                          return;
                        }
                        if (currentStep === 2 && !selectedSauce) {
                          alert('Please choose a sauce to continue!');
                          return;
                        }
                        if (currentStep === 3 && !selectedCheese) {
                          alert('Please choose a cheese type to continue!');
                          return;
                        }
                        setCurrentStep((prev) => prev + 1);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
                    >
                      <span>
                        {currentStep === 4
                          ? 'Review Pizza'
                          : `Next: ${steps[currentStep].title}`}
                      </span>
                      <FaArrowRight className="text-xs" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default UserCreateCustomPizzaScreen;
