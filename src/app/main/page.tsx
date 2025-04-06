"use client";
import "boxicons/css/boxicons.min.css";
import { useState, useEffect } from "react";
import Addmodal from "./Addmodal";
import { useRouter } from "next/navigation";
import ViewModal from "./ViewModal";
import Alert from "../alert";
import axios from "axios";
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
    fetch("https://baakipinnetharam.onrender.com/UserData", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
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
      await axios.post(
        "https://baakipinnetharam.onrender.com/logout",
        {},
        { withCredentials: true }
      );
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
