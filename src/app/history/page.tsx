"use client";
import ClipLoader from "react-spinners/ClipLoader";
import { Toaster, toast } from "react-hot-toast";
import "boxicons/css/boxicons.min.css";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "../ConfirmModal";
import { useAlert } from "../AlertContext";
import IconCircle from "../IconCircle";

// Define the structure of a log entry
interface LogEntry {
  log: string;
  formattedTime: string;
}

const HistoryLog = () => {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]); // Use LogEntry[] type
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { showAlert, hideAlert } = useAlert();

  const handleclearall = async () => {
    try {
      const token = localStorage.getItem("jwtToken"); // Retrieve the JWT token

      const response = await fetch(
        "https://baakipinnetharam.onrender.com/delete-all",
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
          body: JSON.stringify({
            type: "history",
          }),
        }
      );

      if (response.ok) {
        showAlert({
          status: "success",
          message: "Entry deleted successfully!",
        });
        setLogs([]);
        setModalOpen(false);
      } else {
        showAlert({ status: "error", message: "Failed to delete" });
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      showAlert({
        status: "error",
        message: "An error occurred while deleting.",
      });
    }
  };
  const handleCancel = () => {
    console.log("Action cancelled");
    setModalOpen(false);
  };
  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("jwtToken"); // Retrieve the JWT token
      try {
        const res = await fetch(
          "https://baakipinnetharam.onrender.com/fetch-history",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch history");
        }

        const data = await res.json();
        setLogs(data.history); // Ensure this matches the backend response structure
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div
      className="flex flex-col items-center  w-full px-4 h-[100vh]"
      style={{ background: "linear-gradient(62deg, black, #00206b)" }}
    >
      <div className="relative flex justify-center items-center gap-2 w-full my-4 text-black">
        <div className="bg-gray-300 rounded-full flex items-center justify-center gap-[15px] w-auto h-auto py-[6px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          {[
            "/history",
            "/search",
            "/help",
            "/main",
            "/bills",
            "/messages",
            "/profile",
          ].map((path, i) => (
            <button
              key={path}
              onClick={() => router.push(path)}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                path === "/history" ? "bg-yellow-400" : "bg-gray-200"
              }`}
            >
              <i
                className={`bx ${
                  [
                    "bx-history",
                    "bx-search",
                    "bx bx-help-circle ",
                    "bx-home-alt",
                    "bx bxs-receipt",
                    "bx-envelope",
                    "bx-user",
                  ][i]
                }`}
              ></i>
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-row items-center content-center justify-around mb-4 w-full ">
        <h2 className="text-white text-2xl font-semibold ">Your History</h2>
        <button
          onClick={() => {
            if (logs.length === 0)
              showAlert({ status: "error", message: "nothing to delete" });
            else setModalOpen(true);
          }}
          className="text-white -500 font-bold bg-[red] opacity-90  px-3 py-1   rounded-2xl"
        >
          Clear All
        </button>
      </div>
      {loading ? (
        <p className="text-white text-center">Loading history...</p>
      ) : (
        <div className="overflow-x-auto w-full  rounded-lg max-w-4xl mb-5">
          <table className="w-full table-auto border-collapse rounded-lg overflow-hidden shadow-lg">
            <thead className="    text-lg font-medium text-gray-800 bg-gray-300 p-2 rounded-lg mt-2">
              <tr>
                <th className="px-6 py-3 text-left">Action</th>
                <th className="px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="bg-gradient-to-r bg-gray-300 text-gray-800 divide-y divide-gray-800">
              {logs.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-center" colSpan={3}>
                    No activity logs available
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-200 transition duration-200"
                  >
                    <td className="px-6 py-4">{log.log}</td>
                    <td className="px-6 py-4">{log.formattedTime}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmModal
        isOpen={modalOpen}
        message="Are you sure you want to delete all your History?"
        onConfirm={handleclearall}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default HistoryLog;
