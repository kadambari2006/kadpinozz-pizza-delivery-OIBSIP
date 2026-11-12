const Admin = require('../schemas/adminUserSchema');
const User = require('../schemas/userSchema');
const Pizza = require('../schemas/pizzaSchema');
const { Base, Sauce, Cheese, Veggie } = require('../schemas/inventorySchema');

const { users, admins } = require('../data/users');
const pizzas = require('../data/pizzas');
const { base, sauce, cheese, veggie } = require('../data/inventory');

const seedDefaultsIfEmpty = async () => {
  try {
    const pizzaCount = await Pizza.countDocuments();
    if (pizzaCount === 0) {
      console.log('Seeding initial data into database...'.yellow);

      // 1. Seed users & admins
      await User.insertMany(users).catch(() => {});
      await Admin.insertMany(admins).catch(() => {});

      // 2. Seed inventory
      const insertedBases = await Base.insertMany(base).catch(() => []);
      const insertedSauces = await Sauce.insertMany(sauce).catch(() => []);
      const insertedCheeses = await Cheese.insertMany(cheese).catch(() => []);
      const insertedVeggies = await Veggie.insertMany(veggie).catch(() => []);

      // 3. Seed pizzas referencing the inserted ingredients
      const fallbackBaseId = insertedBases[0]?._id;
      const fallbackSauceId = insertedSauces[0]?._id;
      const fallbackCheeseId = insertedCheeses[0]?._id;
      const fallbackVeggieId = insertedVeggies[0]?._id;

      const formattedPizzas = pizzas.map((p) => ({
        name: p.name,
        description: p.description,
        bases: fallbackBaseId ? [fallbackBaseId] : [],
        sauces: fallbackSauceId ? [fallbackSauceId] : [],
        cheeses: fallbackCheeseId ? [fallbackCheeseId] : [],
        veggies: fallbackVeggieId ? [fallbackVeggieId] : [],
        price: p.price,
        size: p.size || 'medium',
        imageUrl: p.imageUrl || '/images/pizza.png',
        createdBy: 'admin',
      }));

      await Pizza.insertMany(formattedPizzas).catch((err) => {
        console.warn('Pizza seeding error:', err.message);
      });

      console.log('Dummy Data & Pre-configured accounts ready!'.green.bold);
      console.log('Admin login: admin1@pizzapalette.com / Password: 123456'.cyan);
      console.log('User login:  john@example.com / Password: 123456'.cyan);
    } else {
      // Ensure all 5 bases and 5 sauces exist even if already seeded earlier
      for (const b of base) {
        const exists = await Base.findOne({ item: b.item });
        if (!exists) await Base.create(b);
      }
      for (const s of sauce) {
        const exists = await Sauce.findOne({ item: s.item });
        if (!exists) await Sauce.create(s);
      }
    }
  } catch (error) {
    console.error('Initial seeding notice:', error.message);
  }
};

module.exports = seedDefaultsIfEmpty;
