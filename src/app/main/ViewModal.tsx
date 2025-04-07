import { useState } from "react";
import Alert from "../alert"; // Ensure this exists and supports type & message

interface AddModalProps {
  closeModal: () => void;
  modalData: { name: string; amount: number; uid: string }[];
  modalTitle: string;
  editAmount: (index: number, newAmount: number) => void;
  deleteEntry: (index: number) => void;
}

export default function ViewModal({
  closeModal,
  modalData,
  modalTitle,
  editAmount,
  deleteEntry,
}: AddModalProps) {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [tempAmount, setTempAmount] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const handleSave = async (index: number) => {
    if (tempAmount !== null) {
      setLoadingIndex(index);
      try {
        const response = await fetch(
          "https://baakipinnetharam.onrender.com/update-entry",
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
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

  const handleDelete = async (index: number) => {
    setLoadingIndex(index);
    try {
      const response = await fetch(
        "https://baakipinnetharam.onrender.com/delete-entry",
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
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
    </div>
  );
}
