"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAlert } from "../../AlertContext";
import "boxicons/css/boxicons.min.css";
//import "bootstrap/dist/css/bootstrap.min.css";
import Nav from "../../nav";
type Member = { uid: string; name: string };

type Bill = {
  name: string;
  total: number;
  addedname?: string;
  addedBy?: string;
  addedAt?: string;
  paidBy?: string;
  items: any[];
  summary: any[];
};

type Group = {
  groupName: string;
  members: Member[];
  _id: string;
  createdAt?: string;
  createdBy?: string;
  bills?: Bill[];
};

// Helper to calculate total expense per person from all bills
function getPersonTotals(bills: Bill[], members: Member[]) {
  const totals: Record<string, { name: string; total: number }> = {};
  members.forEach((m) => {
    totals[m.uid] = { name: m.name, total: 0 };
  });
  bills.forEach((bill) => {
    if (Array.isArray(bill.summary)) {
      bill.summary.forEach((s: any) => {
        if (s.uid && typeof s.money === "number" && totals[s.uid]) {
          totals[s.uid].total += s.money;
        }
      });
    }
  });
  return Object.values(totals);
}

function getSettlements(balances: [string, number][]) {
  // Clone and sort
  const creditors = balances
    .filter(([_, amt]) => amt > 0)
    .sort((a, b) => b[1] - a[1]);
  const debtors = balances
    .filter(([_, amt]) => amt < 0)
    .sort((a, b) => a[1] - b[1]);
  const settlements: { from: string; to: string; amount: number }[] = [];

  let i = 0,
    j = 0;
  while (i < creditors.length && j < debtors.length) {
    let [creditorName, creditorAmt] = creditors[i];
    let [debtorName, debtorAmt] = debtors[j];

    const settleAmt = Math.min(creditorAmt, -debtorAmt);

    if (settleAmt > 0) {
      settlements.push({
        from: debtorName.replace(/"/g, "").trim(),
        to: creditorName.replace(/"/g, "").trim(),
        amount: settleAmt,
      });
      creditors[i][1] -= settleAmt;
      debtors[j][1] += settleAmt;
    }

    if (Math.abs(creditors[i][1]) < 0.01) i++;
    if (Math.abs(debtors[j][1]) < 0.01) j++;
  }
  return settlements;
}
function getTally(bills: Bill[], members: Member[]) {
  const balances: Record<string, number> = {};
  members.forEach((m) => (balances[m.name] = 0));

  bills.forEach((bill) => {
    // console.log("Processing bill:", bill);
    var paidby = bill.paidBy;
    var summary = bill.summary;
    // console.log("Bill summary:", summary);
    // console.log("Paid by:", paidby);
    if (paidby && summary) {
      summary.forEach((s: any) => {
        if (s.uid && typeof s.money === "number") {
          if (paidby !== undefined && balances[paidby] !== undefined) {
            balances[paidby] += s.money;
          }
          if (s.name !== undefined && balances[s.name] !== undefined) {
            balances[s.name] -= s.money;
          }
        }
      });
    }
    // console.log("Current balances:", balances);
  });

  const sortedBalances = Object.entries(balances).sort(([, a], [, b]) => b - a);
  // console.log("Sorted balances:", sortedBalances);
  const settlements = getSettlements(sortedBalances);
  // console.log("Settlements:", settlements);
  return settlements;
}

export default function GroupDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "info";
    message: string;
    key?: number;
  } | null>(null);
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedBillname, setSelectedBillName] = useState<string>("");
  // Summary modal state
  const [showSummary, setShowSummary] = useState(false);

  // Tally modal state
  const [showTally, setShowTally] = useState(false);
  // Move fetchGroup to component scope so it can be reused
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css";
    link.id = "bootstrap-css";
    document.head.appendChild(link);

    return () => {
      document.getElementById("bootstrap-css")?.remove();
    };
  }, []);
  const fetchGroup = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(
        `https://baakipinnetharam.onrender.com/bills/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (data && data.groupdetails) {
        setGroup(data.groupdetails);
      }
    } catch (err) {
      console.error("Failed to fetch group details:", err);
    } finally {
      setLoading(false);
    }
  };

  const { showAlert, hideAlert } = useAlert();

  const handledeletebill = async () => {
    showAlert({ status: "loading", message: "Processing..." });

    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(
        "https://baakipinnetharam.onrender.com/delete-bill",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            billName: selectedBillname,
            groupId: id,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        showAlert({
          status: "success",
          message: "Bill deleted successfully",
        });
        fetchGroup();
      } else {
        showAlert({
          status: "error",
          message: data.message,
        });
      }
    } catch (error) {
      showAlert({
        status: "error",
        message: "Failed to delete Bill",
      });
    } finally {
      setSelectedBillName("");
    }
  };

  useEffect(() => {
    if (id) fetchGroup();
  }, [id]);
  useEffect(() => {
    // @ts-ignore
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <div className="min-h-screen h-[100vh]  overflow-hidden w-full bg-gradient-to-br from-black to-blue-900 text-white flex flex-col items-center  px-6 !pt-2 py-10">
      <Nav />
      <div className="w-full max-w-md flex flex-col space-y-6 relative">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold mb-2">
            {group?.groupName || "loading.."}
          </h2>
          <div className="text-xs text-gray-200 ml-4">
            {group?.members.map((member) => member.name).join(", ")}
          </div>
        </div>
        <div className="w-full flex justify-around items-center">
          <button
            className="bg-blue-500 text-white font-semibold px-3 py-1.5 !rounded-full hover:bg-blue-400 transition duration-300 text-base shadow"
            onClick={() => setShowSummary(true)}
          >
            Show Expense Summary
          </button>
          <button
            className="bg-yellow-400 text-black font-semibold px-3 py-1.5 !rounded-full hover:bg-yellow-300 transition duration-300 text-base shadow"
            onClick={() => {
              router.push(`/bills/${id}/new-bill`);
            }}
          >
            Add New Bill
          </button>
        </div>
        <h3 className="text-xl font-semibold mb-2">Bills</h3>
        {group && group.bills && group.bills.length === 0 ? (
          <div className="text-gray-300">No bills found.</div>
        ) : (
          <div className="flex flex-col gap-4  overflow-auto h-[70vh] pb-4">
            {group &&
              group.bills &&
              group.bills.map((bill, idx) => (
                <div
                  key={idx}
                  className="bg-gray-100 text-black px-4 py-3 rounded-lg shadow flex flex-col cursor-pointer  transition select-none"
                  onClick={() => {
                    setSelectedBill(bill);
                    setShowModal(true);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg">
                      {bill.name || "Untitled Bill"}
                    </span>
                    <button
                      //onClick={() => handleDelete(index)}
                      className="btn btn-primary !text-black ml-2 !bg-transparent px-2 py-1 rounded !border-none"
                      type="button"
                      data-bs-toggle="modal"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent parent onClick
                        setSelectedBillName(bill.addedAt ?? ""); // Set selected bill
                      }}
                      data-bs-target="#deleteModal"
                    >
                      <i className="bx bx-trash"></i>
                    </button>
                  </div>
                  <span className="text-sm text-gray-700">
                    Total: ₹{bill.total ?? 0}
                  </span>
                  <span className="text-xs text-gray-600">
                    Added by: {bill.addedname || "Unknown"}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
      {/* Bill Details Modal */}
      {showModal && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-3 w-[90%] max-h-[80%] overflow-auto max-w-md text-black shadow-lg flex flex-col">
            <h2 className="text-xl font-bold mb-4">
              {selectedBill.name || "Untitled Bill"}
            </h2>
            <div className="mb-2">
              <span className="font-semibold">Total:</span> ₹
              {selectedBill.total !== undefined
                ? selectedBill.total.toFixed(2)
                : "0.00"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Added by:</span>{" "}
              {selectedBill.addedname || "Unknown"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Added at:</span>{" "}
              {selectedBill.addedAt
                ? new Date(selectedBill.addedAt).toLocaleString()
                : "Unknown"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Paid By:</span>{" "}
              {selectedBill.paidBy || "Unknown"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Items:</span>
              <table className="w-full text-sm mt-2 border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-1 border">Name</th>
                    <th className="p-1 border">Qty</th>
                    <th className="p-1 border">Price</th>
                    <th className="p-1 border">Split Among</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items && selectedBill.items.length > 0 ? (
                    selectedBill.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="border p-1">
                          {item.itemName || item.name || "-"}
                        </td>
                        <td className="border p-1">
                          {item.quantity || item.qty || "-"}
                        </td>
                        <td className="border p-1">
                          {item.amount || item.price || "-"}
                        </td>
                        <td className="border p-1">
                          {item.splitBetween && item.splitBetween.length > 0
                            ? item.splitBetween
                                .map((p: any) => p.name)
                                .join(", ")
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center border p-2">
                        No items
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Bill Summary Section */}
            <div className="mb-2 mt-4">
              <span className="font-semibold">Summary:</span>
              <table className="w-full text-sm mt-2 border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-1 border">Name</th>
                    <th className="p-1 border">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.summary && selectedBill.summary.length > 0 ? (
                    selectedBill.summary.map((s, idx) => (
                      <tr key={idx}>
                        <td className="border p-1">{s.name || "-"}</td>
                        <td className="border p-1">
                          ₹
                          {typeof s.money === "number"
                            ? s.money.toFixed(2)
                            : s.money || "0.00"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="text-center border p-2">
                        No summary
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <button
              className="mt-4 px-4 py-2 rounded bg-yellow-400 text-black font-semibold"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showSummary && group && group.bills && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-8 w-[90%] max-w-md text-black shadow-lg flex flex-col">
            <h2 className="text-xl font-bold mb-4">Expense Summary</h2>
            <table className="w-full text-sm mt-2 border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-1 border">Name</th>
                  <th className="p-1 border">Total Expense</th>
                </tr>
              </thead>
              <tbody>
                {getPersonTotals(group.bills, group.members).map((person) => (
                  <tr key={person.name}>
                    <td className="border p-1">
                      {person.name.replace(/"/g, "").trim()}
                    </td>
                    <td className="border p-1">₹{person.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Settlements Table */}
            <h3 className="text-lg font-semibold mt-6 mb-2">Who Owes Whom</h3>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-1 border">From</th>
                  <th className="p-1 border">To</th>
                  <th className="p-1 border">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Calculate balances for settlements
                  const totals = getPersonTotals(group.bills, group.members);

                  const settlements = getTally(
                    group.bills ?? [],
                    group.members
                  );
                  return settlements.length > 0 ? (
                    settlements.map((s, idx) => (
                      <tr key={idx}>
                        <td className="border p-1">{s.from}</td>
                        <td className="border p-1">{s.to}</td>
                        <td className="border p-1">₹{s.amount.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center border p-2">
                        No one owes anything!
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
            <button
              className="mt-4 px-4 py-2 rounded bg-yellow-400 text-black font-semibold"
              onClick={() => setShowSummary(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showTally && group && group.bills && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-8 w-full max-w-md text-black shadow-lg flex flex-col max-h-[80%] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Tally (Who Owes Whom)</h2>
            {/* <div className="text-sm">
              {(() => {
                const settlements = getTally(group.bills, group.members);
                return settlements.length > 0 ? (
                  settlements.map((s, idx) => (
                    <div key={idx} className="mb-2">
                      <span className="font-semibold">{s.from}</span> owes{" "}
                      <span className="font-semibold">{s.to}</span>: ₹
                      {s.amount.toFixed(2)}
                    </div>
                  ))
                ) : (
                  <div>No one owes anything!</div>
                );
              })()}
            </div> */}
            <button
              className="mt-4 px-4 py-2 rounded bg-yellow-400 text-black font-semibold"
              // onClick={() => }
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div
        className="modal fade !text-black"
        id="deleteModal"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog  top-[30%]">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Delete Bill
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">Are you sure to delete this Bill?</div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  handledeletebill();
                }}
                data-bs-dismiss="modal"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
