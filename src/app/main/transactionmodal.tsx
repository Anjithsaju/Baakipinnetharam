import { useEffect, useRef, useState } from "react";
import { format, subMonths } from "date-fns"; // for formatting month names

type TransactionType = {
  uid: string;
  name: string;
  amount: number;
  formattedTime?: string;
  date?: string;
};
type TransactionsCardProps = {
  transactions: TransactionType[];
  theme: string;
  themeClass: string;
  editIndex: number | null;
  setEditIndex: (index: number | null) => void;
  tempName: string | null;
  setTempName: (name: string | null) => void;
  tempAmount: number | null;
  setTempAmount: (amount: number | null) => void;
  loadingIndex: number | null;
  setLoadingIndex: (index: number | null) => void;
  handleSave: (index: number) => void;
  handleDelete: (index: number) => void;
  isTransactionModalOpen: boolean;
  setIsTransactionModalOpen: (open: boolean) => void;
  transactionModalData: TransactionType[];
  setTransactionModalData: React.Dispatch<
    React.SetStateAction<TransactionType[]>
  >;
  alert: { type: "success" | "error" | "info"; message: string } | null;
  setAlert: (
    alert: { type: "success" | "error" | "info"; message: string } | null
  ) => void;
};

const TransactionsCard = ({
  transactions,
  theme,
  themeClass,
  editIndex,
  setEditIndex,
  tempName,
  setTempName,
  tempAmount,
  setTempAmount,
  loadingIndex,
  setLoadingIndex,
  handleSave,
  handleDelete,
  isTransactionModalOpen,
  setIsTransactionModalOpen,
  transactionModalData,
  setTransactionModalData,
  alert,
  setAlert,
}: TransactionsCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowMonthDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  // Generate previous months (e.g., last 12 months)
  const monthsList = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      label: format(date, "MMMM yyyy"),
      value: date,
    };
  });

  // Filter transactions for selected month
  const filteredTransactions = transactions.filter(
    (t) =>
      t.date &&
      new Date(t.date).getMonth() === selectedMonth.getMonth() &&
      new Date(t.date).getFullYear() === selectedMonth.getFullYear()
  );

  const totalTransactions = filteredTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  // Modal open state for "Clear All" confirmation
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  function setModalOpen(open: boolean) {
    setIsClearAllModalOpen(open);
  }

  const handleDownloadDoc = () => {
    // Create table rows
    const rows = transactions
      .map(
        (t) =>
          `<tr>
        <td>${t.name}</td>
        <td>₹${t.amount}</td>
        <td>${t.formattedTime || ""}</td>
      </tr>`
      )
      .join("");

    // Create table HTML
    const table = `
    <table border="1" style="border-collapse:collapse;width:100%;">
      <thead>
        <tr>
          <th>Name</th>
          <th>Amount</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;

    // Document content
    const html = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>Transactions</title>
      </head>
      <body>
        <h2>Transactions (${format(new Date(), "yyyy-MM-dd")})</h2>
        ${table}
      </body>
    </html>
  `;

    // Create Blob and download
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Transactions_${format(new Date(), "yyyy-MM-dd")}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`w-full max-w-md h-[60%] rounded-lg ${themeClass} p-4 overflow-auto cursor-pointer relative`}
      //   onClick={() => {
      //     setTransactionModalData(filteredTransactions);
      //     setIsTransactionModalOpen(true);
      //   }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {/* Hamburger menu */}
        {/* Title + Month */}
        <h3 className="font-semibold text-lg text-left flex-1">
          Transactions {"   "}
          <span className="text-sm font-light">
            {format(selectedMonth, "MMMM yyyy")}
          </span>
        </h3>

        {/* Total */}
        <span className="font-semibold text-lg">₹{totalTransactions}</span>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 hover:bg-gray-200 rounded-full"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute right-0 top-10 bg-white shadow-lg rounded-xl w-56 z-20 transition-all duration-200">
              <div className="relative">
                <button
                  className="w-full text-left p-3 hover:bg-blue-50 rounded-t-lg flex justify-between items-center font-medium text-gray-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMonthDropdown((prev) => !prev);
                  }}
                >
                  Select Month
                  <svg
                    className={`w-4 h-4 ml-2 transform transition-transform ${
                      showMonthDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showMonthDropdown && (
                  <div className="absolute left-0 top-full bg-white shadow-lg rounded-b-lg w-full z-30 max-h-64 overflow-auto border-t border-gray-200">
                    {monthsList.map((month) => (
                      <button
                        key={month.label}
                        className={`w-full text-left p-3 hover:bg-blue-100 transition-colors ${
                          selectedMonth.getMonth() === month.value.getMonth() &&
                          selectedMonth.getFullYear() ===
                            month.value.getFullYear()
                            ? "bg-blue-200 font-semibold text-blue-800"
                            : "text-gray-700"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMonth(month.value);
                          setShowMonthDropdown(false);
                          setShowMenu(false);
                        }}
                      >
                        {month.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="w-full text-left p-3 hover:bg-gray-100 transition-colors rounded-b-lg font-medium text-gray-700"
                onClick={() => {
                  setTransactionModalData(filteredTransactions); // set data for modal
                  setIsTransactionModalOpen(true); // open modal
                  setShowMenu(false); // close dropdown menu
                }}
              >
                Edit
              </button>
              <button
                className="w-full text-left p-3 hover:bg-gray-100 transition-colors rounded-b-lg font-medium text-gray-700"
                onClick={handleDownloadDoc}
              >
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transaction list */}
      {filteredTransactions.length > 0 ? (
        filteredTransactions.map((transaction, index) => (
          <p
            key={index}
            className={`text-lg font-medium ${
              theme === "light" ? "!text-gray-800 !bg-gray-100" : themeClass
            } p-2 rounded-lg mt-2`}
          >
            <span className="text-[inherit]">{transaction.name}</span>:
            <span className="text-green-600"> ₹{transaction.amount}</span>
            {transaction.formattedTime && (
              <span className="text-sm text-gray-600 mt-2">
                <span className="text-gray-500 text-sm ml-2">
                  {transaction.formattedTime}
                </span>
              </span>
            )}
          </p>
        ))
      ) : (
        <p className="text-sm text-gray-600 mt-2">
          No transactions found for {format(selectedMonth, "MMMM yyyy")}.
        </p>
      )}

      {isTransactionModalOpen && (
        <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center">
          <div
            className={` ${
              theme === "light" ? " !bg-white text-black" : themeClass
            } p-6 rounded-lg w-[85%] max-w-xs `}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[inherit]">
                Edit Transactions
              </h3>
              {/* <button
                onClick={() => {
                  if (transactionModalData.length > 0) {
                    setModalOpen(true);
                  } else
                    setAlert({ type: "error", message: "Nothing to delete" });
                }}
                className="text-red-500 font-bold"
              >
                Clear All
              </button> */}
            </div>
            <div className="overflow-auto max-h-[50vh]">
              <ul className="space-y-4">
                {transactionModalData.map((transaction, index) => (
                  <li
                    key={index}
                    className={` ${
                      theme === "light" ? " !bg-black/5 text-black" : themeClass
                    } flex justify-between items-center p-3 rounded-lg`}
                  >
                    <div className="text-[inherit]">
                      {editIndex === index ? (
                        <>
                          <input
                            type="text"
                            value={
                              tempName !== null ? tempName : transaction.name
                            }
                            onChange={(e) => setTempName(e.target.value)}
                            className="border p-1 rounded w-40"
                          />
                          <input
                            type="number"
                            value={
                              tempAmount !== null
                                ? tempAmount
                                : transaction.amount
                            }
                            onChange={(e) =>
                              setTempAmount(parseFloat(e.target.value))
                            }
                            className="border p-1 rounded w-20 ml-2"
                          />
                        </>
                      ) : (
                        <>
                          <span>{transaction.name}</span>:{" "}
                          <span className="text-green-600">
                            ₹{transaction.amount}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {editIndex === index ? (
                        <>
                          <button
                            onClick={() => {
                              setEditIndex(null);
                              setTempName(null);
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
                            setTempName(transaction.name);
                            setTempAmount(transaction.amount);
                          }}
                        >
                          <i className="bx bx-edit-alt text-[inherit]"></i>
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
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsTransactionModalOpen(false)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsCard;
