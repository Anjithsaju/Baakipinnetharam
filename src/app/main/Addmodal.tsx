import React, { useState } from "react";
import Alert from "../alert";
interface Person {
  uid: string;
  name: string;
}

interface AddModalProps {
  closeModal: () => void;
  people: Person[];
}

export default function AddModal({ closeModal, people }: AddModalProps) {
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
  } | null>(null);
  const [addType, setAddType] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("");
  const [Description, setDescription] = useState("");
  const [transactionName, setTransactionName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation: Ensure required fields are filled
    if (addType === "debt_due" && (!selectedPerson || !amount)) {
      setAlert({
        type: "error",
        message: "Please fill in all required fields (Person and Amount).",
      });
      return;
    }
    if (addType === "transaction" && !amount) {
      setAlert({
        type: "error",
        message: "Please fill in all required fields .",
      });
      return;
    }
    setLoading(true); // Start loading

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
            desc: Description,
          };

    try {
      const token = localStorage.getItem("jwtToken"); // Retrieve the JWT token from localStorage

      const response = await fetch(
        "https://baakipinnetharam.onrender.com/api/add-entry",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setAlert({ type: "success", message: "Entry added successfully!" });
        closeModal();
      } else {
        setAlert({
          type: "error",
          message: data.message || "Something went wrong.",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setAlert({ type: "error", message: "Failed to submit. Try again!" });
    } finally {
      setLoading(false); // Stop loading
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
              className="bg-green-500 text-white px-4 py-2 rounded w-full flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 00-8 8h4z"
                  ></path>
                </svg>
              ) : (
                "Submit"
              )}
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
            <input
              type="text"
              placeholder="Description"
              value={Description}
              onChange={(e) => setDescription(e.target.value)}
              className="border p-2 w-full mb-2"
            />
            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white px-4 py-2 rounded w-full flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 00-8 8h4z"
                  ></path>
                </svg>
              ) : (
                "Submit"
              )}
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
      {alert && <Alert type={alert.type} message={alert.message} />}
    </div>
  );
}
