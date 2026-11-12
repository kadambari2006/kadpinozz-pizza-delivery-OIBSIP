import { BsChevronDoubleDown } from 'react-icons/bs';
import { FaLeaf } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';

import BGImage from '/images/pizza-jumbo-bg.jpg';

function Jumbotron() {
  return (
    <section
      style={{
        backgroundImage: `linear-gradient(rgba(5, 46, 22, 0.65), rgba(20, 83, 45, 0.6)), url(${BGImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }}
      className="min-h-screen flex flex-col justify-center items-center py-12 px-10 sm:px-16 text-white text-center"
    >
      <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-400/30 text-emerald-200 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 shadow-sm">
        <FaLeaf className="text-emerald-400" />
        <span>Wholesome Nutrition • Organic Goodness • Zero Guilt</span>
      </div>
      <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 tracking-tight drop-shadow-md">
        Healthy Pizza &amp; Artisanal Snacks
      </h1>
      <p className="text-lg sm:text-2xl mb-10 max-w-2xl text-emerald-50 font-light leading-relaxed">
        Crafted with organic grains, cauliflower crusts, farm-fresh herbs, and nutritious wholesome toppings.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Link
          to="/menu"
          className="bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 text-white font-bold text-lg px-8 py-3.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transform"
        >
          Explore Healthy Menu
        </Link>
        <Link
          to="/about"
          className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 transition-all duration-200 text-white font-semibold text-lg px-8 py-3.5 rounded-full shadow-lg"
        >
          Our Story
        </Link>
      </div>

      <ScrollLink
        to="featured-pizzas"
        smooth={true}
        spy={true}
        duration={1000}
        className="text-white absolute bottom-0 mb-10 hover:text-emerald-300 transition-all duration-200 cursor-pointer"
      >
        <BsChevronDoubleDown className="text-4xl animate-bounce" />
      </ScrollLink>
    </section>
  );
}

export default Jumbotron;
