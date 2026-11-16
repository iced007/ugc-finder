export type PlaceholderCreator = {
  name: string;
  category: "Beauty" | "Food" | "Fashion" | "Gadgets" | "Baby";
  price: number;
};

export const placeholderCreators: PlaceholderCreator[] = [
  { name: "Afsana Rahman", category: "Beauty", price: 5000 },
  { name: "Nafis Chowdhury", category: "Food", price: 6500 },
  { name: "Tasnia Islam", category: "Fashion", price: 7000 },
  { name: "Rafi Hasan", category: "Gadgets", price: 8000 },
  { name: "Maliha Noor", category: "Baby", price: 5500 },
  { name: "Sadia Ahmed", category: "Beauty", price: 6000 },
];
