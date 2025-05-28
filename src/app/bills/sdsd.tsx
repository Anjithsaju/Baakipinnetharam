"use client";
import BillsPage from "./bills";

// Example bills data (replace with your real data or fetch as needed)
const bills = [
  { id: "1", name: "Dinner", amount: 1200, group: "Friends" },
  { id: "2", name: "Groceries", amount: 800, group: "Family" },
];

export default function Page() {
  return <BillsPage bills={bills} />;
}
