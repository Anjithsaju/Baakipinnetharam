import { useState } from "react";
import Alert from "../alert"; // Ensure this exists and supports type & message

interface AddModalProps {
  closeModal: () => void;
  modalData: { name: string; amount: number; uid: string; gpayid?: string }[];
  modalTitle: string;
  people: { uid: string; name: string; gpayid?: string }[];
  editAmount: (index: number, newAmount: number) => void;
  deleteEntry: (index: number) => void;
}

export default function ViewModal({
  closeModal,
  modalData,
  modalTitle,
  editAmount,
  people,
  deleteEntry,
}: AddModalProps) {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [tempAmount, setTempAmount] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isVisible: boolean;
    gpayid: string | null;
    name: string;
    amount: number;
  }>({ isVisible: false, gpayid: null, name: "", amount: 0 });

  const handleSave = async (index: number) => {
    if (tempAmount !== null) {
      setLoadingIndex(index);
      try {
        const token = localStorage.getItem("jwtToken"); // Retrieve the JWT token

        const response = await fetch(
          "https://baakipinnetharam.onrender.com/update-entry",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
            body: JSON.stringify({
              name: modalData[index].name,
              amount: tempAmount,
            }),
          }
        );

        if (response.ok) {
          editAmount(index, tempAmount);
          setAlert({
            type: "success",
            message: "Amount updated successfully!",
          });
        } else {
          setAlert({ type: "error", message: "Failed to update entry." });
        }
      } catch (error) {
        console.error("Error updating entry:", error);
        setAlert({
          type: "error",
          message: "An error occurred while updating.",
        });
      }
      setEditIndex(null);
      setTempAmount(null);
      setLoadingIndex(null);
    }
  };

  const getgpayid = async (uid: string) => {
    try {
      const token = localStorage.getItem("jwtToken"); // Retrieve the JWT token

      const response = await fetch(
        "https://baakipinnetharam.onrender.com/getgpayid",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
          body: JSON.stringify({ uid }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.gpayId;
      }
      throw new Error("Failed to fetch GPay ID");
    } catch (error) {
      console.error("Error fetching GPay ID:", error);
      return null;
    }
  };

  const handleDelete = async (index: number) => {
    setLoadingIndex(index);
    try {
      const token = localStorage.getItem("jwtToken"); // Retrieve the JWT token

      const response = await fetch(
        "https://baakipinnetharam.onrender.com/delete-entry",
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
          body: JSON.stringify({ name: modalData[index].name }),
        }
      );

      if (response.ok) {
        deleteEntry(index);
        setAlert({ type: "success", message: "Entry deleted successfully!" });
      } else {
        setAlert({ type: "error", message: "Failed to delete entry." });
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      setAlert({ type: "error", message: "An error occurred while deleting." });
    }
    setLoadingIndex(null);
  };

  const handlePayNow = async (index: number, item: any) => {
    setLoadingIndex(index);
    try {
      const person = people.find((person) => person.name === item.name);
      if (person?.uid) {
        const gpayid = await getgpayid(person?.uid);
        console.log("GPay ID:", gpayid);
        if (gpayid != null) {
          setConfirmModal({
            isVisible: true,
            gpayid,
            name: item.name,
            amount: Number(item.amount),
          });
        } else {
          console.log("GPay ID not available for this person.");
          setAlert({
            type: "error",
            message: "GPay ID not available for this person.",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching GPay ID:", error);
      setAlert({
        type: "error",
        message: "An error occurred while fetching GPay ID.",
      });
    } finally {
      setLoadingIndex(null);
    }
  };

  const proceedToPayment = () => {
    if (confirmModal.gpayid) {
      window.open(
        `upi://pay?pa=${confirmModal.gpayid}&pn=${
          confirmModal.name
        }&am=${Number(confirmModal.amount)}&cu=INR&tn=Baakipinnetharam`,
        "_blank"
      );
    }
    setConfirmModal({ isVisible: false, gpayid: null, name: "", amount: 0 });
  };

  return (
    <div className="fixed inset-0 text-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-80">
        <h3 className="text-lg font-semibold mb-4">{modalTitle}</h3>
        <ul>
          {modalData.map((item, index) => (
            <li key={index} className="flex justify-between items-center mb-2">
              <span>{item.name}</span>
              {editIndex === index ? (
                <input
                  type="number"
                  value={tempAmount !== null ? tempAmount : item.amount}
                  onChange={(e) => setTempAmount(parseFloat(e.target.value))}
                  className="border rounded w-16 p-1"
                />
              ) : (
                <span>₹{item.amount}</span>
              )}

              {modalTitle === "Dues" && (
                <div className="flex gap-2">
                  {editIndex === index ? (
                    <>
                      <button
                        onClick={() => {
                          setEditIndex(null);
                          setTempAmount(null);
                        }}
                        className="text-red-500 ml-2"
                      >
                        <i className="bx bx-x"></i>
                      </button>
                      <button
                        onClick={() => handleSave(index)}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                        disabled={loadingIndex === index}
                      >
                        {loadingIndex === index ? (
                          "⏳"
                        ) : (
                          <i className="bx bx-check"></i>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setEditIndex(index);
                        setTempAmount(item.amount);
                      }}
                    >
                      <i className="bx bx-edit-alt"></i>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(index)}
                    className="text-black ml-2 bg-red-200 px-2 py-1 rounded"
                    disabled={loadingIndex === index}
                  >
                    {loadingIndex === index ? (
                      "⏳"
                    ) : (
                      <i className="bx bx-trash"></i>
                    )}
                  </button>
                </div>
              )}

              {modalTitle === "Debts" && (
                <button
                  onClick={() => handlePayNow(index, item)}
                  className={`bg-blue-500 text-white px-2 py-1 rounded ${
                    loadingIndex === index
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={loadingIndex === index}
                >
                  {loadingIndex === index ? "⏳Loading..." : "Pay Now"}
                </button>
              )}
            </li>
          ))}
        </ul>

        <button
          onClick={closeModal}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} />}
      {confirmModal.isVisible && (
        <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-80">
            <h3 className="text-lg font-semibold mb-4">Confirm Payment</h3>
            <p>
              GPay ID found for <strong>{confirmModal.name}</strong>. Proceed to
              payment of ₹{confirmModal.amount}?
            </p>
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() =>
                  setConfirmModal({
                    isVisible: false,
                    gpayid: null,
                    name: "",
                    amount: 0,
                  })
                }
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={proceedToPayment}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
