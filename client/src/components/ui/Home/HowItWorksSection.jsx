import { FaPizzaSlice, FaCartPlus, FaMoneyCheckAlt, FaHeartbeat } from 'react-icons/fa';

function HowItWorksSection() {
  const StepsToOrderPizza = [
    {
      step: 1,
      icon: <FaPizzaSlice />,
      title: 'Choose Healthy Pizzas & Snacks',
      description:
        'Explore our nutritious menu of gluten-free crusts, cauliflower bases, and organic snack platters.',
    },
    {
      step: 2,
      icon: <FaCartPlus />,
      title: 'Customize Your Wholesome Plate',
      description:
        'Personalize with nutrient-rich veggies, plant-based cheeses, cold-pressed pestos, and toasted seeds.',
    },
    {
      step: 3,
      icon: <FaMoneyCheckAlt />,
      title: 'Quick & Secure Checkout',
      description:
        'Review your dietary selections and complete your order with ease and complete security.',
    },
    {
      step: 4,
      icon: <FaHeartbeat />,
      title: 'Fuel Your Body With Clean Food',
      description:
        'Savor piping hot, guilt-free gourmet slices delivered fresh to your doorstep.',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 px-8 sm:px-16 bg-gradient-to-b from-emerald-100 to-emerald-50 flex flex-col justify-center items-center"
    >
      <div className="text-center max-w-2xl mb-12">
        <span className="text-emerald-600 font-bold uppercase tracking-wider text-sm">Simple &amp; Fresh</span>
        <h2 className="text-3xl sm:text-5xl text-gray-900 font-extrabold mt-2 mb-3">
          How KaDpinozz Works
        </h2>
        <p className="text-lg text-gray-600">
          Getting wholesome food to your table has never been easier or tastier.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-3xl shadow-xl p-8 sm:p-12 max-w-5xl w-full border border-emerald-200">
        {StepsToOrderPizza.map((step) => (
          <div
            key={step.step}
            className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left p-4 rounded-2xl hover:bg-emerald-50/60 transition-colors"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 text-2xl text-emerald-700 rounded-2xl mb-4 sm:mb-0 sm:mr-5 shrink-0 shadow-sm">
              {step.icon}
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-1.5 flex items-center justify-center sm:justify-start gap-2">
                <span className="text-emerald-600 font-black">{step.step}.</span>
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorksSection;
