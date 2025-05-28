"use client";
import React from "react";

type Bill = {
  id: string;
  name: string;
  amount: number;
  group: string;
};

interface BillsPageProps {
  bills: Bill[];
}

export default function BillsPage({ bills }: BillsPageProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black to-blue-900 text-white flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-md flex flex-col space-y-6">
        <h2 className="text-2xl font-bold mb-4">My Bills</h2>
        {bills.length === 0 ? (
          <div className="text-gray-300">No bills found.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="bg-gray-100 text-black px-4 py-3 rounded-lg shadow flex flex-col"
              >
                <span className="font-semibold">{bill.name}</span>
                <span className="text-sm text-gray-600">
                  Amount: ₹{bill.amount} | Group: {bill.group}
                </span>
              </div>
            ))}
          </div>
        )}
        <button
          className="mt-6 bg-yellow-400 text-black font-semibold px-6 py-2 rounded-full hover:bg-yellow-300 transition duration-300 text-base shadow"
          onClick={() => {
            // Add bill logic can go here in the future
          }}
        >
          + Add New Bill
        </button>
      </div>
    </div>
  );
}
