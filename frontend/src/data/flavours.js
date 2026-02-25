// Centralized flavour data
export const flavourData = {
  'Ice-Cream': [
    { name: 'Vanilla', price: 150, emoji: '🍦' },
    { name: '21 Love', price: 180, emoji: '💕' },
    { name: 'Strawberry', price: 160, emoji: '🍓' },
    { name: 'Chocolate', price: 170, emoji: '🍫' },
  ],
  'Kulfi': [
    { name: 'Vanilla Kulfi', price: 200, emoji: '🍧' },
    { name: 'Pista Kulfi', price: 220, emoji: '🌿' },
    { name: 'Chocolate Kulfi', price: 210, emoji: '🍫' },
    { name: 'Strawberry Kulfi', price: 200, emoji: '🍓' },
    { name: 'Blueberry Kulfi', price: 220, emoji: '🫐' },
    { name: 'Mango Kulfi', price: 210, emoji: '🥭' },
    { name: 'Orange Kulfi', price: 200, emoji: '🍊' },
  ]
};

export const getAllFlavours = () => {
  const all = [];
  Object.entries(flavourData).forEach(([category, items]) => {
    items.forEach(item => all.push({ ...item, category }));
  });
  return all;
};

export const getPriceByName = (name) => {
  for (const category in flavourData) {
    const found = flavourData[category].find(f => f.name === name);
    if (found) return found.price;
  }
  return 0;
};
