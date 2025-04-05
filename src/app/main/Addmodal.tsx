import React, { useState } from "react";

interface Person {
  uid: string;
  name: string;
}

interface AddModalProps {
  closeModal: () => void;
  people: Person[];
}

export default function AddModal({ closeModal, people }: AddModalProps) {
  const [addType, setAddType] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("");
  const [transactionName, setTransactionName] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async () => {
    const payload =
      addType === "transaction"
        ? {
            type: "transaction",
            name: transactionName,
            amount: parseFloat(amount),
          }
        : {
            type: "debt_due",
            person: selectedPerson,
            amount: parseFloat(amount),
          };

    try {
      const response = await fetch(
        "https://baakipinnetharam.onrender.com/api/add-entry",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (response.ok) {
        //alert("Entry added successfully!");
        closeModal(); // Close modal on success
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit. Try again!");
    }
  };

  return (
    <div className="fixed inset-0 text-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-80">
        <h3 className="text-lg font-semibold mb-4">Add Entry</h3>

        {/* Radio Buttons for Selection */}
        <div className="mb-4 flex justify-between">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="entryType"
              value="transaction"
              checked={addType === "transaction"}
              onChange={() => setAddType("transaction")}
              className="mr-2"
            />
            Add Transaction
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="entryType"
              value="debt_due"
              checked={addType === "debt_due"}
              onChange={() => setAddType("debt_due")}
              className="mr-2"
            />
            Add Due
          </label>
        </div>

        {/* Transaction Form */}
        {addType === "transaction" && (
          <div className="mt-4">
            <input
              type="text"
              placeholder="Transaction Name"
              value={transactionName}
              onChange={(e) => setTransactionName(e.target.value)}
              className="border p-2 w-full mb-2"
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border p-2 w-full mb-2"
            />
            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white px-4 py-2 rounded w-full"
            >
              Submit
            </button>
          </div>
        )}

        {/* Debt/Due Form */}
        {addType === "debt_due" && (
          <div className="mt-4">
            <select
              className="border p-2 w-full mb-2"
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
            >
              <option value="" disabled>
                Select a person
              </option>
              {people.map((person) => (
                <option key={person.uid} value={person.uid}>
                  {person.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border p-2 w-full mb-2"
            />
            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white px-4 py-2 rounded w-full"
            >
              Submit
            </button>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={closeModal}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
}
