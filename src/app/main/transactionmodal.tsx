import { useEffect, useRef, useState } from "react";
import { format, subMonths } from "date-fns"; // for formatting month names

interface TransactionType {
  uid?: string;
  name: string;
  amount: number;
  date?: string;
  formattedTime?: string;
}

interface TransactionModalProps {
  transactions: TransactionType[];
  theme: string;
  themeClass: string;
  setTransactionModalData: (data: TransactionType[]) => void;
  setIsTransactionModalOpen: (open: boolean) => void;
}

const TransactionsCard: React.FC<TransactionModalProps> = ({
  transactions,
  theme,
  themeClass,
  setTransactionModalData,
  setIsTransactionModalOpen,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [groupMode, setGroupMode] = useState<"default" | "day" | "week">(
    "default"
  );

  // Track expanded groups (day or week)
  const [expandedGroups, setExpandedGroups] = useState<{
    [key: string]: boolean;
  }>({});
  // Track expanded days inside each week
  const [expandedDaysByWeek, setExpandedDaysByWeek] = useState<{
    [weekKey: string]: { [dayKey: string]: boolean };
  }>({});

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

  // Group transactions by day or week
  let grouped: { [key: string]: TransactionType[] } = {};
  if (groupMode === "day") {
    filteredTransactions.forEach((t) => {
      if (t.date) {
        const day = format(new Date(t.date), "yyyy-MM-dd");
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push(t);
      }
    });
  } else if (groupMode === "week") {
    filteredTransactions.forEach((t) => {
      if (t.date) {
        const d = new Date(t.date);
        // Get week start (Monday)
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when Sunday
        const weekStart = new Date(d.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);
        const weekKey = format(weekStart, "yyyy-MM-dd");
        if (!grouped[weekKey]) grouped[weekKey] = [];
        grouped[weekKey].push(t);
      }
    });
  }

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
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
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

              {/* Grouping toggles */}
              <button
                className={`w-full text-left p-3 transition-colors font-medium flex items-center gap-2 ${
                  groupMode === "default"
                    ? "bg-blue-100 text-blue-800"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => {
                  setGroupMode("default");
                  setShowMenu(false);
                }}
                title="Show all transactions"
              >
                Default View
              </button>
              <button
                className={`w-full text-left p-3 transition-colors font-medium flex items-center gap-2 ${
                  groupMode === "day"
                    ? "bg-blue-100 text-blue-800"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => {
                  setGroupMode("day");
                  setShowMenu(false);
                }}
                title="Group by day"
              >
                Group by Day
              </button>
              <button
                className={`w-full text-left p-3 transition-colors font-medium flex items-center gap-2 ${
                  groupMode === "week"
                    ? "bg-blue-100 text-blue-800"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => {
                  setGroupMode("week");
                  setShowMenu(false);
                }}
                title="Group by week"
              >
                Group by Week
              </button>

              <button
                className="w-full text-left p-3 hover:bg-gray-100 transition-colors font-medium text-gray-700"
                onClick={() => {
                  setTransactionModalData(filteredTransactions);
                  setIsTransactionModalOpen(true);
                  setShowMenu(false);
                }}
              >
                Edit
              </button>
              <button
                className="w-full text-left p-3 hover:bg-gray-100 transition-colors font-medium text-gray-700"
                onClick={handleDownloadDoc}
              >
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transaction list */}
      {groupMode === "default" ? (
        filteredTransactions.length > 0 ? (
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
        )
      ) : Object.keys(grouped).length > 0 ? (
        // Compute week numbers for the selected month
        (() => {
          // Get all week keys sorted
          const weekKeys = Object.keys(grouped).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
          );
          // Map weekKey to week number (1-based)
          const weekNumberMap: { [key: string]: number } = {};
          let weekNum = 1;
          for (const wk of weekKeys) {
            weekNumberMap[wk] = weekNum++;
          }
          return Object.entries(grouped).map(([key, txns]) => {
            const groupTotal = txns.reduce(
              (sum: number, t: TransactionType) => sum + t.amount,
              0
            );
            const isExpanded = expandedGroups[key] || false;
            return (
              <div key={key} className="mt-2">
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 rounded-lg ${
                    theme === "light"
                      ? "!bg-gray-100 !text-gray-800 border border-gray-200"
                      : themeClass
                  } transition-colors hover:bg-blue-50`}
                  onClick={() =>
                    setExpandedGroups((prev) => ({
                      ...prev,
                      [key]: !prev[key],
                    }))
                  }
                >
                  <div className="flex items-center">
                    <span className="mr-2">
                      <svg
                        className={`w-4 h-4 inline transition-transform ${
                          isExpanded ? "rotate-90" : "rotate-0"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                    <span className="font-semibold">
                      {groupMode === "day"
                        ? `${format(new Date(key), "dd MMM")} ${format(
                            new Date(key),
                            "EEEE"
                          )}`
                        : `Week ${weekNumberMap[key]}`}
                    </span>
                  </div>
                  <span className="font-bold text-green-700">
                    ₹{groupTotal}
                  </span>
                </div>
                {isExpanded && (
                  <div className="ml-6 mt-1">
                    {groupMode === "week"
                      ? (() => {
                          const daysInWeek: {
                            [day: string]: TransactionType[];
                          } = {};
                          txns.forEach((t) => {
                            if (t.date) {
                              const dayKey = format(
                                new Date(t.date),
                                "yyyy-MM-dd"
                              );
                              if (!daysInWeek[dayKey]) daysInWeek[dayKey] = [];
                              daysInWeek[dayKey].push(t);
                            }
                          });
                          const sortedDays = Object.keys(daysInWeek).sort(
                            (a, b) =>
                              new Date(a).getTime() - new Date(b).getTime()
                          );
                          return sortedDays.map((dayKey) => {
                            const dayTxns = daysInWeek[dayKey];
                            const dayTotal = dayTxns.reduce(
                              (sum, t) => sum + t.amount,
                              0
                            );
                            const isDayExpanded =
                              expandedDaysByWeek[key]?.[dayKey] || false;
                            return (
                              <div key={dayKey} className="mb-2">
                                <div
                                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                                    theme === "light"
                                      ? "!bg-gray-50 !text-gray-800 border border-gray-100"
                                      : themeClass
                                  }`}
                                  onClick={() => {
                                    setExpandedDaysByWeek((prev) => ({
                                      ...prev,
                                      [key]: {
                                        ...prev[key],
                                        [dayKey]: !isDayExpanded,
                                      },
                                    }));
                                  }}
                                >
                                  <div className="flex items-center">
                                    <span className="mr-2">
                                      <svg
                                        className={`w-4 h-4 inline transition-transform ${
                                          isDayExpanded
                                            ? "rotate-90"
                                            : "rotate-0"
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9 5l7 7-7 7"
                                        />
                                      </svg>
                                    </span>
                                    <span className="font-semibold">
                                      {format(new Date(dayKey), "dd MMM")}{" "}
                                      {format(new Date(dayKey), "EEEE")}
                                    </span>
                                  </div>
                                  <span className="font-bold text-blue-700">
                                    ₹{dayTotal}
                                  </span>
                                </div>
                                {isDayExpanded && (
                                  <div className="ml-4 mt-1">
                                    {dayTxns.map((t, idx) => (
                                      <div
                                        key={t.uid || idx}
                                        className={`text-lg font-medium ${
                                          theme === "light"
                                            ? "!text-gray-800 !bg-white"
                                            : themeClass
                                        } p-2 rounded-lg mt-2 flex items-center`}
                                      >
                                        <span className="text-[inherit]">
                                          {t.name}
                                        </span>
                                        :
                                        <span className="text-green-600 ml-1">
                                          ₹{t.amount}
                                        </span>
                                        {t.formattedTime && (
                                          <span className="text-gray-500 text-xs ml-2">
                                            {t.formattedTime}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()
                      : txns.map((t, idx) => (
                          <div
                            key={t.uid || idx}
                            className={`text-lg font-medium ${
                              theme === "light"
                                ? "!text-gray-800 !bg-gray-50 border border-gray-100"
                                : themeClass
                            } p-2 rounded-lg mt-2 flex items-center`}
                          >
                            <span className="text-[inherit]">{t.name}</span>:
                            <span className="text-green-600 ml-1">
                              ₹{t.amount}
                            </span>
                            {t.formattedTime && (
                              <span className="text-gray-500 text-xs ml-2">
                                {t.formattedTime}
                              </span>
                            )}
                          </div>
                        ))}
                  </div>
                )}
              </div>
            );
          });
        })()
      ) : (
        <p className="text-sm text-gray-600 mt-2">
          No transactions found for {format(selectedMonth, "MMMM yyyy")}.
        </p>
      )}
    </div>
  );
};

export default TransactionsCard;
