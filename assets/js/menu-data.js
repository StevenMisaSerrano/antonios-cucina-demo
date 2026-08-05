/* Antonio's Cucina Italiana — menu data
   Edit prices/items here; the menu page renders from this file. */

const MENU = {
  pizza: {
    label: "Pizza",
    icon: "\ud83c\udf55",
    note: null,
    sizePricing: true,
    items: [
      { name: "Classic Cheese Pizza", desc: "Hand-thrown dough, special tomato sauce, creamy mozzarella", prices: { Small: 14.69, Medium: 16.79, Large: 18.89, XL: 23.09 } },
      { name: "Pizza Pepperoni", desc: "The Classic Pizza in America", prices: { Small: 15.74, Medium: 17.84, Large: 20.99, XL: 25.19 } },
      { name: "Pizza Festa", desc: 'The "Everything" Festival Pie', prices: { Small: 17.84, Medium: 23.09, Large: 27.29, XL: 32.54 } },
      { name: "Pizza Carne Amore", desc: "Pepperoni, salami, sausage, linguica, ground beef \u2014 our meat lover's pizza", prices: { Small: 18.79, Medium: 23.09, Large: 27.29, XL: 32.54 } },
      { name: "Creamy Garlic Pizza with Veggies", desc: "Garlic sauce, black olives, tomatoes, bell peppers, mushrooms, red & green onion", prices: { Small: 18.79, Medium: 23.09, Large: 27.29, XL: 32.54 } },
      { name: "Creamy Garlic Pizza with Chicken", desc: "Garlic sauce, chicken, red onion, tomato, mushrooms, green onions", prices: { Small: 18.79, Medium: 23.09, Large: 27.29, XL: 32.54 } },
      { name: "Creamy Garlic Pizza with Meat", desc: "Garlic sauce, pepperoni, Italian sausage, mushrooms, tomato, green onions", prices: { Small: 18.79, Medium: 23.09, Large: 27.29, XL: 32.54 } },
      { name: "Pizza Canadian", desc: "Canadian bacon and pineapple", prices: { Small: 16.79, Medium: 23.09, Large: 27.29, XL: 32.54 } },
      { name: "Pizza Alfredo", desc: "Antonio's famous white sauce, Italian sausage, diced tomato, green onions", prices: { Small: 18.79, Medium: 23.09, Large: 27.29, XL: 32.54 } },
      { name: "Pizza Primavera", desc: "Veggie lover's pizza \u2014 bell peppers, olives, tomatoes, mushrooms", prices: { Small: 18.79, Medium: 23.09, Large: 27.29, XL: 32.54 } },
      { name: "Pizza Ricardo", desc: "Named after Tony's best friend \u2014 pepperoni, Italian sausage, and extra cheese", prices: { Small: 18.79, Medium: 23.09, Large: 27.29, XL: 32.54 } }
    ]
  },

  pasta: {
    label: "Specialty Pasta",
    icon: "\ud83c\udf5d",
    note: "All specialty pasta served with salad and garlic bread",
    sizePricing: false,
    items: [
      { name: "Chicken Parmesan", desc: "Boneless chicken baked in marinara with mozzarella and parmesan, over linguine", prices: { "Regolare (Full)": 20.98, "Meta (Half)": 12.59 } },
      { name: "Chicken Marsala", desc: "Saut\u00e9ed in olive oil and garlic butter with mushrooms and Marsala wine, over linguine", prices: { "Regolare (Full)": 20.98, "Meta (Half)": 12.59 } },
      { name: "Chicken Alfredo", desc: "Boneless chicken baked in alfredo sauce with mushrooms and green onions", prices: { "Regolare (Full)": 20.98, "Meta (Half)": 12.59 } },
      { name: "Meat Lasagna", desc: "Meat and cheese lasagna with marinara and mozzarella, then baked", prices: { "Regolare (Full)": 20.98, "Meta (Half)": 12.59 } },
      { name: "Cheese Tortellini in Creamy Pesto", desc: "Tri-colored cheese stuffed tortellini in cream pesto sauce", prices: { "Regolare (Full)": 20.98, "Meta (Half)": 12.59 } },
      { name: "Ravioli Marinara", desc: "Meat filled ravioli smothered with marinara, w/ baked cheese", prices: { "Regolare (Full)": 20.98, "Meta (Half)": 12.59 }, addOn: "Baked Cheese (Reg +$3.00 / Meta +$2.00)" },
      { name: "Ravioli Alfredo", desc: "Meat filled ravioli with alfredo, w/ baked cheese", prices: { "Regolare (Full)": 20.98, "Meta (Half)": 12.59 }, addOn: "Baked Cheese (Reg +$3.00 / Meta +$2.00)" }
    ]
  },

  marinara: {
    label: "Marinara",
    icon: "\ud83c\udf5b",
    note: "Served with salad and garlic bread",
    sizePricing: false,
    items: [
      { name: "Marinara", desc: "Meatless tomato sauce", prices: { "Regolare (Full)": 16.79, "Meta (Half)": 11.54 } },
      { name: "Meatballs", desc: "Marinara with beef and sausage meatballs", prices: { "Regolare (Full)": 16.79, "Meta (Half)": 11.54 } },
      { name: "Salsiccia", desc: "Marinara with Italian sausage", prices: { "Regolare (Full)": 16.79, "Meta (Half)": 11.54 } },
      { name: "Red Clam", desc: "Marinara with sea clams and green onions", prices: { "Regolare (Full)": 16.79, "Meta (Half)": 11.54 } },
      { name: "Meat Sauce", desc: "Marinara with ground beef", prices: { "Regolare (Full)": 16.79, "Meta (Half)": 11.54 } },
      { name: "Spicy Baked Pasta", desc: "Spicy marinara with sausage and red hot pepper flakes", prices: { "Regolare (Full)": 16.79, "Meta (Half)": 11.54 } }
    ]
  },

  alfredo: {
    label: "Alfredo",
    icon: "\ud83c\udf5d",
    note: "Served with salad and garlic bread",
    sizePricing: false,
    items: [
      { name: "Primavera", desc: "Meatless alfredo sauce", prices: { "Regolare (Full)": 16.79, "Meta (Half)": 11.54 } },
      { name: "Cafe Ala Mer", desc: "Alfredo with vegetables, clams, anchovies, and shrimp", prices: { "Regolare (Full)": 16.79, "Meta (Half)": 11.54 } },
      { name: "Sausage and Peppers", desc: "Alfredo with bell peppers and Italian sausage", prices: { "Regolare (Full)": 16.79, "Meta (Half)": 11.54 } },
      { name: "White Clam", desc: "Alfredo with sea clams and green onions", prices: { "Regolare (Full)": 16.79, "Meta (Half)": 11.54 } },
      { name: "Lobster Alfredo", desc: "Alfredo with lobster", prices: { "Regolare (Full)": 16.79, "Meta (Half)": 11.54 } }
    ]
  },

  salads: {
    label: "Salads",
    icon: "\ud83e\udd57",
    note: null,
    sizePricing: false,
    items: [
      { name: "House Green Salad", desc: "Fresh greens with world-renowned House dressing, honey vinaigrette, buttermilk ranch, house-made blue cheese, Caesar, or olive oil and vinegar", price: 6.59 },
      { name: "Giant Salad", desc: "All-You-Can-Eat double-sized salad served with garlic bread", price: 14.29 },
      { name: "Grilled Chicken Salad", desc: "", price: 16.49 },
      { name: "Crispy Chicken Salad", desc: "", price: 16.49 },
      { name: "Chef Salad", desc: "", price: 16.49 },
      { name: "Warm Lobster Salad", desc: "", price: 16.49 },
      { name: "Shrimp Salad", desc: "", price: 16.49 }
    ]
  },

  appetizers: {
    label: "Appetizers",
    icon: "\ud83c\udf5a",
    note: null,
    sizePricing: false,
    items: [
      { name: "Red Hot Chicken Flappers", desc: "Fried wings smothered in spicy Cajun sauce, served with ranch", price: 8.79 },
      { name: "BBQ Wings", desc: "Fried wings smothered in hickory BBQ sauce, served with ranch", price: 8.79 },
      { name: "Mozzarella Sticks", desc: "Deep-fried breaded mozzarella with marinara dipping sauce", price: 8.79 },
      { name: "Bruschetta with Garlic Bread", desc: "Italian blend of tomatoes, mozzarella, olive oil, salt, pepper, fresh garlic", price: 8.79 },
      { name: "Breadsticks", desc: "Freshly baked, served with ranch or marinara dipping sauce", price: 5.48 },
      { name: "Seasoned Curly Fries", desc: "", price: 6.59 },
      { name: "Chicken Strip Basket", desc: "Lightly breaded deep-fried chicken strips with seasoned curly fries", price: 9.89 }
    ]
  },

  subs: {
    label: "Hot Subs",
    icon: "\ud83e\udd6a",
    note: null,
    sizePricing: false,
    items: [
      { name: "Meatball Sub", desc: "Meatballs in marinara with baked cheese on sourdough, curly fries or salad", prices: { "Regular": 15.39, "Meta (Half)": 13.19 } },
      { name: "Italian Sub", desc: "Pepperoni, salami, Canadian bacon, baked cheese, lettuce, tomato, red onion, pepperoncini, house dressing", prices: { "Regular": 15.39, "Meta (Half)": 13.19 } },
      { name: "Veggie Sub", desc: "Saut\u00e9ed veggies with baked cheese on sourdough, topped with house dressing", prices: { "Regular": 15.39, "Meta (Half)": 13.19 } }
    ]
  },

  burgers: {
    label: "Burgers",
    icon: "\ud83c\udf54",
    note: null,
    sizePricing: false,
    items: [
      { name: "Hamburger Combo", desc: "Ground beef on sourdough with lettuce, tomato, pickles, onions, curly fries or salad", price: 14.29, addOn: "Add Cheese, Bacon, or Saut\u00e9ed Mushrooms" },
      { name: "Chicken Strip Basket", desc: "Lightly breaded deep-fried chicken strips with seasoned curly fries", price: 9.89 }
    ]
  },

  desserts: {
    label: "Desserts",
    icon: "\ud83c\udf70",
    note: null,
    sizePricing: false,
    items: [
      { name: "Cheesecake with Strawberries", desc: "", price: 6.50 },
      { name: "Vanilla Ice Cream", desc: "", price: 3.50 },
      { name: "Spumoni Ice Cream", desc: "", price: 3.50 }
    ]
  },

  drinks: {
    label: "Drinks",
    icon: "\ud83e\udd64",
    note: null,
    sizePricing: false,
    items: [
      { name: "Soft Drinks", desc: "Pepsi, Diet Pepsi, Starry, Root Beer, Lemonade, Iced Tea, Coffee, Hot Tea", prices: { "Cup": 2.50, "Pitcher": 3.99 } },
      { name: "2 Liter Sodas", desc: "", price: 4.99 }
    ]
  }
};

// Also usable from Node (server.js requires this to validate cart prices server-side).
if (typeof module !== "undefined" && module.exports) {
  module.exports = MENU;
}
