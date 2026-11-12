function FeaturedPizzasSection() {
  const featuredPizzas = [
    {
      id: 1,
      name: 'Avocado & Herb Garden Pizza',
      description: 'Ancient grain crust, creamy avocado slices, garden baby spinach, pesto drizzle, and organic seeds.',
      price: 549,
      badge: 'Bestseller',
      imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      name: 'Keto Cauliflower Supreme',
      description: 'Grain-free cauliflower crust, charred bell peppers, sun-ripened cherry tomatoes, kalamata olives, and fresh basil.',
      price: 599,
      badge: 'Keto Friendly',
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      name: 'Crispy Veggie & Seed Snack Bites',
      description: 'Artisanal baked vegetable crisps served with wholesome garlic-herb hummus and roasted pumpkin seeds.',
      price: 529,
      badge: 'Healthy Snack',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <section
      id="featured-pizzas"
      className="min-h-screen flex flex-col justify-center items-center py-20 px-8 sm:px-16 bg-white"
    >
      <div className="text-center max-w-2xl mb-12">
        <span className="text-emerald-600 font-bold uppercase tracking-wider text-sm">Wholesome &amp; Nutritious</span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mt-2 mb-4">
          Featured Healthy Picks
        </h2>
        <p className="text-gray-600 text-lg">
          Taste the wholesome goodness. 100% natural, nourishing, and crafted for healthy lifestyles.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
        {featuredPizzas.map((pizza) => (
          <div
            key={pizza.id}
            className="bg-emerald-50 border border-emerald-200 rounded-3xl shadow-md hover:shadow-xl overflow-hidden hover:transform hover:-translate-y-2 transition-all duration-300 ease-in-out flex flex-col"
          >
            <div className="relative">
              <img
                src={pizza.imageUrl}
                alt={pizza.name}
                className="w-full h-56 object-cover"
              />
              <span className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                {pizza.badge}
              </span>
            </div>

            <div className="p-6 flex flex-col flex-1 justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {pizza.name}
                  </h3>
                  <span className="text-2xl font-black text-emerald-600">
                    ₹{pizza.price}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {pizza.description}
                </p>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-800 font-semibold">
                <span>🌱 100% Clean Ingredients</span>
                <span>⚡ Rich in Fiber</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedPizzasSection;
