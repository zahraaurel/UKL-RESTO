export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
}

export const INITIAL_MENU: MenuItem[] = [
  { id: 1, name: "Foie Gras Torchon", price: 380000, category: "Appetizer" },
  { id: 2, name: "Truffle Bisque", price: 290000, category: "Appetizer" },
  { id: 3, name: "Wagyu Tenderloin A5", price: 950000, category: "Main" },
  { id: 4, name: "Lobster Thermidor", price: 780000, category: "Main" },
  { id: 5, name: "Duck à l'Orange", price: 520000, category: "Main" },
  { id: 6, name: "Soufflé au Chocolat", price: 195000, category: "Dessert" },
  { id: 7, name: "Crème Brûlée", price: 145000, category: "Dessert" },
  { id: 8, name: "Champagne Billecart", price: 185000, category: "Drinks" },
  { id: 9, name: "Espresso d'Or", price: 75000, category: "Drinks" },
];