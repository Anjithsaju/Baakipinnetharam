"use client";
import "boxicons/css/boxicons.min.css";
import { useState, useEffect } from "react";
import Addmodal from "./Addmodal";
import { useRouter } from "next/navigation";
import ViewModal from "./ViewModal";
import Alert from "../alert";
import axios from "axios";
import { isUserInSession } from "../session";
interface DebtDueType {
  uid: string;
  name: string;
  amount: number;
}

interface TransactionType {
  uid: string;
  name: string;
  amount: number;
  formattedTime?: string;
}

interface Person {
  uid: string;
  name: string;
}

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State for error message

  useEffect(() => {
    async function check() {
      const token = localStorage.getItem("jwtToken");
      console.log("Token:", token);

      if (token) {
        try {
          const response = await fetch(
            "https://baakipinnetharam.onrender.com/verify-token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            setErrorMessage(
              errorData.message || "Session expired. Please log in again."
            ); // Set error message
            setTimeout(() => {
              router.push("/");
              localStorage.removeItem("jwtToken");
            }, 3000); // Redirect after 3 seconds
          }
        } catch (err) {
          console.error("Error verifying token:", err);
          setErrorMessage(
            "An error occurred while verifying your session. Please log in again."
          );
          setTimeout(() => {
            router.push("/");
            localStorage.removeItem("jwtToken");
          }, 3000); // Redirect after 3 seconds
        }
      } else {
        setErrorMessage("onnu podo apa. Login cheyyu.");
        setTimeout(() => {
          router.push("/");
        }, 3000); // Redirect after 3 seconds
      }
    }
    check();
  }, []);

  const [show, setShow] = useState(false);

  const [dues, setDues] = useState<DebtDueType[]>([]);
  const [debts, setDebts] = useState<DebtDueType[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<DebtDueType[]>([]);
  const [modalTitle, setModalTitle] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);

  const [refreshKey, setRefreshKey] = useState(0);
  const fetchData = () => {
    const token = localStorage.getItem("jwtToken"); // Retrieve the token from localStorage

    fetch("https://baakipinnetharam.onrender.com/UserData", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
        return res.json();
      })
      .then((data) => {
        const formattedDues: DebtDueType[] = Object.entries(data.due).map(
          ([name, amount], index) => ({
            name,
            amount: Number(amount),
            uid: `${name}-${index}-${Date.now()}`,
          })
        );

        const formattedDebts: DebtDueType[] = Object.entries(data.debt).map(
          ([name, amount], index) => ({
            name,
            amount: Number(amount),
            uid: `${name}-${index}-${Date.now()}`,
          })
        );

        setDues(formattedDues);
        setDebts(formattedDebts);
        setPeople(data.friends || []);
        setTransactions(data.transaction || []);
      })
      .catch((error) => console.error("Error fetching data:", error));
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const refreshData = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  const openModal = (data: DebtDueType[], title: string) => {
    setModalData(data);
    setModalTitle(title);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("jwtToken");

      localStorage.removeItem("jwtToken"); // Remove the token from localStorage
      console.log("Logout successful!");
      router.push("/login");
    } catch (err: any) {
      console.error("Logout failed.", err);
    }
  };
  const totalDues = dues.reduce((sum, item) => sum + item.amount, 0);
  const totalDebts = debts.reduce((sum, item) => sum + item.amount, 0);
  const totalTransactions = transactions.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  if (errorMessage) {
    return (
      <div
        style={{ background: "linear-gradient(62deg, black, #00206b)" }}
        className="flex items-center justify-center min-h-screen bg-gray-100"
      >
        <div className="bg-white p-6 rounded shadow-md text-center">
          <h2 className="text-red-500 font-bold text-lg">Error</h2>
          <p className="text-gray-700 mt-2">{errorMessage}</p>
          <p className="text-gray-500 mt-4">Redirecting to the login page...</p>
        </div>
      </div>
    );
  }
  //if (checking) return <p>Checking session...</p>;
  return (
    <div
      style={{ background: "linear-gradient(62deg, black, #00206b)" }}
      className="min-h-screen h-[100vh] flex flex-col items-center p-5 pt-2"
    >
      <h2 className="text-white font-semibold text-[30px]">
        Baaki Pinne Tharam
      </h2>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md h-[40%] pt-4 text-black">
        <div
          className="h-full bg-gray-300 rounded-lg p-4 relative cursor-pointer"
          onClick={() => openModal(dues, "Dues")}
        >
          <h3 className="font-semibold text-lg">
            Dues <span className="absolute right-4">₹{totalDues}</span>
          </h3>
          {dues.length > 0 ? (
            dues.map((due, index) => (
              <p key={index}>
                {due.name}: ₹{due.amount}
              </p>
            ))
          ) : (
            <p className="text-sm text-gray-600 mt-2">No dues to show.</p>
          )}
        </div>

        <div
          className="h-full bg-gray-300 rounded-lg p-4 relative cursor-pointer"
          onClick={() => openModal(debts, "Debts")}
        >
          <h3 className="font-semibold text-lg">
            Debts <span className="absolute right-4">₹{totalDebts}</span>
          </h3>
          {debts.length > 0 ? (
            debts.map((debt, index) => (
              <p key={index}>
                {debt.name}: ₹{debt.amount}
              </p>
            ))
          ) : (
            <p className="text-sm text-gray-600 mt-2">No debts to show.</p>
          )}
        </div>
      </div>

      <div className="relative flex justify-center items-center gap-2 w-full my-4 text-black">
        <div className="bg-gray-300 rounded-full flex items-center justify-center gap-[15px] w-auto h-auto py-[6px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          <button
            onClick={() => router.push("/history")}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
          >
            <i className="bx bx-history"></i>
          </button>
          <button
            onClick={() => router.push("/search")}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
          >
            <i className="bx bx-search"></i>
          </button>
          <button
            onClick={openAddModal}
            className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
          >
            <span className="text-black text-lg font-bold">+</span>
          </button>
          <button
            onClick={() => router.push("/messages")}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
          >
            <i className="bx bx-envelope"></i>
          </button>
          <button
            // onClick={() => router.push("/profile")}
            onClick={handleLogout}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
          >
            <i className="bx bx-user"></i>
          </button>
        </div>
      </div>

      <div className="w-full max-w-md h-[60%] bg-gray-300 rounded-lg text-black p-4 overflow-auto">
        <h3 className="font-semibold text-lg relative">
          Transactions{" "}
          <span className="absolute right-4">₹{totalTransactions}</span>
        </h3>
        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <p
              key={index}
              className="text-lg font-medium text-gray-800 bg-gray-100 p-2 rounded-lg mt-2"
            >
              <span className="text-black">{transaction.name}</span>:
              <span className="text-green-600"> ₹{transaction.amount}</span>
              {transaction.formattedTime && (
                <span className="text-gray-500 text-sm ml-2">
                  [ {transaction.formattedTime} ]
                </span>
              )}
            </p>
          ))
        ) : (
          <p className="text-sm text-gray-600 mt-2">No transactions found.</p>
        )}
      </div>

      {isModalOpen && (
        <ViewModal
          closeModal={() => {
            setIsModalOpen(false);
            refreshData();
          }}
          modalData={modalData}
          people={people}
          modalTitle={modalTitle}
          editAmount={(index, newAmount) => {
            const updatedData = [...modalData];
            updatedData[index].amount = newAmount;
            setModalData(updatedData);
          }}
          deleteEntry={(index) => {
            setModalData(modalData.filter((_, i) => i !== index));
          }}
        />
      )}

      {isAddModalOpen && (
        <Addmodal
          closeModal={() => {
            setIsAddModalOpen(false);
            refreshData();
          }}
          people={people}
        />
      )}
    </div>
  );
}
