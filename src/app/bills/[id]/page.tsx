"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

export default function GroupDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Summary modal state
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
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
    if (id) fetchGroup();
  }, [id]);

  if (loading) return <div className="text-white p-8">Loading...</div>;
  if (!group) return <div className="text-white p-8">Group not found.</div>;

  return (
    <div className="min-h-screen h-[100vh]  overflow-hidden w-full bg-gradient-to-br from-black to-blue-900 text-white flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-md flex flex-col space-y-6 relative">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold mb-2">{group.groupName}</h2>
          <div className="text-xs text-gray-200 ml-4">
            {group.members.map((member) => member.name).join(", ")}
          </div>
        </div>
        <div className="w-full  flex justify-around items-center">
          <button
            className=" bg-blue-500 text-white font-semibold px-2 py-2 !rounded-full hover:bg-blue-400 transition duration-300 text-base shadow"
            onClick={() => setShowSummary(true)}
          >
            Show Expense Summary
          </button>
          <button
            className=" bg-yellow-400 text-black font-semibold px-2 py-2 !rounded-full hover:bg-yellow-300 transition duration-300 text-base shadow"
            onClick={() => {
              router.push(`/bills/${id}/new-bill`);
            }}
          >
            Add New Bill
          </button>
        </div>
        <h3 className="text-xl font-semibold mb-2">Bills</h3>
        {group.bills && group.bills.length === 0 ? (
          <div className="text-gray-300">No bills found.</div>
        ) : (
          <div className="flex flex-col gap-4  overflow-auto h-[70vh] pb-4">
            {group.bills &&
              group.bills.map((bill, idx) => (
                <div
                  key={idx}
                  className="bg-gray-100 text-black px-4 py-3 rounded-lg shadow flex flex-col cursor-pointer hover:bg-yellow-100 transition"
                  onClick={() => {
                    setSelectedBill(bill);
                    setShowModal(true);
                  }}
                >
                  <span className="font-semibold text-lg">
                    {bill.name || "Untitled Bill"}
                  </span>
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
          <div className="bg-white rounded-xl p-3 w-[90%] max-h-[70%] overflow-auto max-w-md text-black shadow-lg flex flex-col">
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
          <div className="bg-white rounded-xl p-8 w-full max-w-md text-black shadow-lg flex flex-col">
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
                    <td className="border p-1">{person.name}</td>
                    <td className="border p-1">₹{person.total.toFixed(2)}</td>
                  </tr>
                ))}
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
    </div>
  );
}
