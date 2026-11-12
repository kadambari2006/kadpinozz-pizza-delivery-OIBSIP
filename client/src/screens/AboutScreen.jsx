import React from 'react';
import { FaLeaf, FaSeedling, FaHeart, FaShieldAlt } from 'react-icons/fa';
import Logo from '/logo.svg';

function AboutScreen() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center pt-28 pb-16 px-6 sm:px-16 bg-gradient-to-b from-emerald-100 to-white">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-12 text-center sm:text-left max-w-4xl w-full">
        <img
          src={Logo}
          alt="KaDpinozz Logo"
          className="h-28 w-28 sm:h-36 sm:w-36 drop-shadow-md"
        />
        <div>
          <span className="bg-emerald-100 text-emerald-800 font-bold text-xs uppercase px-3 py-1 rounded-full border border-emerald-300">
            About Our Startup
          </span>
          <h1 className="text-4xl lg:text-5xl text-gray-900 font-black mt-2">
            Welcome to <span className="text-emerald-600">KaDpinozz</span>
          </h1>
          <p className="text-gray-600 text-lg mt-2 font-medium">
            The Healthy Pizza &amp; Wholesome Snacks Revolution.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 max-w-4xl w-full border border-emerald-200">
        <article className="mb-8">
          <h2 className="text-2xl text-gray-900 font-bold mb-3 flex items-center gap-2">
            <FaLeaf className="text-emerald-600" /> Who We Are
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            <strong>KaDpinozz</strong> was born from a simple conviction: fast comfort food doesn&apos;t have to be junk food. We are a health-forward pizza and snacks startup focused on creating delicious, nutrient-dense culinary experiences. From our crispy cauliflower and ancient multigrain crusts to antioxidant-rich pestos and organic vegetable crisps, every bite fuels your wellness.
          </p>
        </article>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 flex flex-col items-center text-center">
            <FaSeedling className="text-3xl text-emerald-700 mb-2" />
            <h3 className="font-bold text-gray-900 mb-1">100% Clean Food</h3>
            <p className="text-xs text-gray-600">Zero artificial preservatives, refined sugars, or unhealthy fillers.</p>
          </div>
          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 flex flex-col items-center text-center">
            <FaHeart className="text-3xl text-red-500 mb-2" />
            <h3 className="font-bold text-gray-900 mb-1">Dietary Friendly</h3>
            <p className="text-xs text-gray-600">Keto, gluten-free, vegan, and protein-packed options made fresh daily.</p>
          </div>
          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 flex flex-col items-center text-center">
            <FaShieldAlt className="text-3xl text-emerald-700 mb-2" />
            <h3 className="font-bold text-gray-900 mb-1">Farm-Fresh Quality</h3>
            <p className="text-xs text-gray-600">Partnered directly with sustainable, organic growers and suppliers.</p>
          </div>
        </div>

        <article className="mb-8">
          <h2 className="text-2xl text-gray-900 font-bold mb-3 flex items-center gap-2">
            <FaHeart className="text-emerald-600" /> Our Mission
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Our mission is to empower healthier lifestyles by making clean, nourishing pizzas and snacks easily accessible, delightfully satisfying, and affordable for everyone.
          </p>
        </article>

        <article className="pt-6 border-t border-emerald-200">
          <h2 className="text-2xl text-gray-900 font-bold mb-2">Connect With Us</h2>
          <p className="text-gray-700 text-base leading-relaxed">
            Have questions about our ingredients, nutritional information, or catering? Reach out anytime at{' '}
            <a
              href="mailto:contact@kadpinozz.com"
              className="text-emerald-700 font-bold hover:underline"
            >
              contact@kadpinozz.com
            </a>
          </p>
        </article>
      </div>
    </section>
  );
}

export default AboutScreen;
