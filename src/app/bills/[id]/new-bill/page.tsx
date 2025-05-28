"use client";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import "boxicons/css/boxicons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/navigation";
export default function Split() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([""]);
  const [modalGroupName, setModalGroupName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedPeople, setSelectedPeople] = useState<string[][]>(
    Array.from({ length: 3 }, () => [])
  );
  const [amounts, setAmounts] = useState<string[]>(
    Array.from({ length: 3 }, () => "")
  );
  const [quantities, setQuantities] = useState<string[]>(
    Array.from({ length: 3 }, () => "1")
  );
  const [people, setPeople] = useState([
    { uid: "1", name: "Person1", money: 0 },
    { uid: "2", name: "Person2", money: 0 },
    { uid: "3", name: "Person3", money: 0 },
  ]);
  const [itemNames, setItemNames] = useState<string[]>(
    Array.from({ length: 3 }, () => "")
  );
  const [showBillNameModal, setShowBillNameModal] = useState(false);
  const [billName, setBillName] = useState("");
  const [paidBy, setPaidBy] = useState(""); // <-- New state for "Paid By"

  // Fetch group members on mount
  useEffect(() => {
    const fetchGroupMembers = async () => {
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
        if (
          data &&
          data.groupdetails &&
          Array.isArray(data.groupdetails.members)
        ) {
          setPeople(
            data.groupdetails.members.map((m: any) => ({
              uid: m.uid,
              name: m.name,
              money: 0,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch group members:", err);
      }
    };
    if (id) fetchGroupMembers();
  }, [id]);

  // Helper to recalculate all splits
  const recalculateSplits = (
    newSelectedPeople: string[][],
    newAmounts: string[],
    newQuantities: string[]
  ) => {
    // Reset everyone's money
    let moneyMap: { [uid: string]: number } = {};
    people.forEach((p) => (moneyMap[p.uid] = 0));

    newSelectedPeople.forEach((uids, groupIdx) => {
      const amt = parseFloat(newAmounts[groupIdx]);
      const qty = parseFloat(newQuantities[groupIdx]);
      const total = !isNaN(amt) && !isNaN(qty) ? amt * qty : 0;
      if (uids.length > 0 && total > 0) {
        const share = total / uids.length;
        uids.forEach((uid) => {
          moneyMap[uid] += share;
        });
      }
    });

    setPeople((prev) =>
      prev.map((p) => ({
        ...p,
        money: parseFloat(moneyMap[p.uid].toFixed(2)),
      }))
    );
  };
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [newMembers, setNewMembers] = useState("");
  const handleExtractBill = async (file: File) => {
    setLoading(true); // Start loading
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(
        "https://baakipinnetharam.onrender.com/extract-bill",
        {
          method: "POST",
          body: formData,
        }
      );
      if (!res.ok) {
        const err = await res.json();
        alert("Error: " + err.error);
        setLoading(false);
        return;
      }
      const data = await res.json();
      // data.items contains the structured items from the bill
      console.log("Extracted items:", data.items);

      // Fill the UI with extracted items
      setGroups(
        data.items.map(
          (item: any, idx: number) => item.name || `Item ${idx + 1}`
        )
      );
      setQuantities(data.items.map((item: any) => item.qty?.toString() || "1"));
      setAmounts(
        data.items.map((item: any) =>
          (item.price && Number(item.price) !== 0
            ? item.price
            : item.amount && Number(item.amount) !== 0
            ? item.amount
            : ""
          ).toString()
        )
      );
      setSelectedPeople(data.items.map(() => [])); // Reset selected people for new items
      setItemNames(
        data.items.map(
          (item: any, idx: number) => item.item || `Item ${idx + 1}`
        )
      );
    } catch (err) {
      alert("Failed to extract bill: " + (err as Error).message);
    }
    setLoading(false); // Stop loading
  };
  // Handler to update members from modal
  const handleSaveMembers = () => {
    // Example: comma separated names
    const names = newMembers
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    setPeople(
      names.map((name, idx) => ({
        uid: (idx + 1).toString(),
        name,
        money: 0,
      }))
    );
    setShowMembersModal(false);
  };

  // Add person to selectedPeople for a specific group
  const handlePersonSelect = (
    groupIdx: number,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const uid = e.target.value;
    setSelectedPeople((prev) => {
      if (uid && !prev[groupIdx].includes(uid)) {
        const updated = prev.map((arr, idx) =>
          idx === groupIdx ? [...arr, uid] : arr
        );
        recalculateSplits(updated, amounts, quantities);
        return updated;
      }
      return prev;
    });
    e.target.selectedIndex = 0;
  };

  // Remove person from selectedPeople for a specific group
  const handleRemovePerson = (groupIdx: number, uid: string) => {
    setSelectedPeople((prev) => {
      const updated = prev.map((arr, idx) =>
        idx === groupIdx ? arr.filter((id) => id !== uid) : arr
      );
      recalculateSplits(updated, amounts, quantities);
      return updated;
    });
  };

  // Handle amount change for a group
  const handleAmountChange = (groupIdx: number, value: string) => {
    setAmounts((prev) => {
      const updated = prev.map((amt, idx) => (idx === groupIdx ? value : amt));
      recalculateSplits(selectedPeople, updated, quantities);
      return updated;
    });
  };

  // Handle quantity change for a group
  const handleQuantityChange = (groupIdx: number, value: string) => {
    setQuantities((prev) => {
      const updated = prev.map((qty, idx) => (idx === groupIdx ? value : qty));
      recalculateSplits(selectedPeople, amounts, updated);
      return updated;
    });
  };
  // Add this handler inside your component
  const handleDeleteItem = (groupIdx: number) => {
    setGroups((prev) => {
      const updatedGroups = prev.filter((_, idx) => idx !== groupIdx);
      setSelectedPeople((prevSel) => {
        const updatedSel = prevSel.filter((_, idx) => idx !== groupIdx);
        setAmounts((prevAmt) => {
          const updatedAmt = prevAmt.filter((_, idx) => idx !== groupIdx);
          setQuantities((prevQty) => {
            const updatedQty = prevQty.filter((_, idx) => idx !== groupIdx);
            // Recalculate after all updates
            recalculateSplits(updatedSel, updatedAmt, updatedQty);
            return updatedQty;
          });
          return updatedAmt;
        });
        return updatedSel;
      });
      return updatedGroups;
    });
  };
  const handleAddNewItem = () => {
    setGroups((prev) => [...prev, `Item ${prev.length + 1}`]);
    setSelectedPeople((prev) => [...prev, []]);
    setAmounts((prev) => [...prev, ""]);
    setModalGroupName("");
    setQuantities((prev) => [...prev, "1"]);
    setItemNames((prev) => [...prev, ""]);
  };

  // Handler for item name change
  const handleItemNameChange = (groupIdx: number, value: string) => {
    setItemNames((prev) =>
      prev.map((name, idx) => (idx === groupIdx ? value : name))
    );
  };
  const router = useRouter();
  // Modified save handler
  const handleSaveBill = () => {
    setShowBillNameModal(true);
  };

  const handleConfirmSave = async () => {
    setLoading(true);
    setShowBillNameModal(false);
    try {
      // Prepare the structured data
      const items = groups.map((group, idx) => ({
        itemName: itemNames[idx] || group || `Item ${idx + 1}`,
        quantity: quantities[idx],
        amount: amounts[idx],
        splitBetween: selectedPeople[idx]
          .map((uid) => {
            const person = people.find((p) => p.uid === uid);
            return person ? { uid: person.uid, name: person.name } : null;
          })
          .filter(Boolean),
      }));

      const summary = people.map((person) => ({
        uid: person.uid,
        name: person.name,
        money: person.money,
      }));
      const total = items.reduce((sum, item) => {
        const qty = parseFloat(item.quantity) || 1;
        const amt = parseFloat(item.amount) || 0;
        return sum + qty * amt;
      }, 0);
      const payload = {
        groupId: id,
        billName, // include bill name
        items,
        summary,
        paidBy,
        total,
      };
      console.log("Payload to save:", payload);
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(
        "https://baakipinnetharam.onrender.com/bills/save",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        alert("Error saving bill: " + err.error);
        setLoading(false);
        return;
      }

      router.back();
      // Optionally, redirect or reset state here
    } catch (err) {
      alert("Failed to save bill: " + (err as Error).message);
    }
    setLoading(false);
  };

  // Add this computed variable inside your component, before the return:
  const isAnyItemFilled = groups.some(
    (_, idx) =>
      (itemNames[idx] && itemNames[idx].trim() !== "") ||
      (amounts[idx] && amounts[idx].trim() !== "")
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br  from-black to-blue-900 text-white flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-2xl flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">#Bill</h2>
        <div className="flex gap-3">
          <button
            type="button"
            className="bg-yellow-400 text-black font-semibold p-2 !pl-3 !pr-3 !rounded-full hover:bg-yellow-300 transition duration-300 text-base shadow"
            onClick={handleAddNewItem}
          >
            Add New Item
          </button>
        </div>
      </div>
      <div className="flex flex-row justify-between items-center mb-4">
        <h5 className="">Upload Bill image:</h5>
        <label className="flex cursor-pointer bg-gray-200 rounded px-1 py-1 text-black text-center mr-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleExtractBill(e.target.files[0]);
              }
            }}
          />
          Upload
        </label>
        {/* Take a picture */}
        <label className="flex cursor-pointer bg-gray-200 rounded px-1 py-1 text-black text-center">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleExtractBill(e.target.files[0]);
              }
            }}
          />
          Capture
        </label>
      </div>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <span className="text-lg text-black font-semibold">
              Proccessing, please wait...
            </span>
          </div>
        </div>
      )}

      {/* Bill Name Modal */}
      {showBillNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-8 w-full max-w-sm text-black shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">Enter Bill Name</h2>
            <input
              type="text"
              className="border rounded px-3 py-2 w-full mb-4"
              placeholder="Bill Name"
              value={billName}
              onChange={(e) => setBillName(e.target.value)}
              autoFocus
            />{" "}
            <div className="input-group flex-nowrap">
              <span className="input-group-text" id="addon-wrapping">
                Paid By
              </span>
              <select
                className="form-select border px-3 py-2 w-40 focus:outline-none focus:ring-2 focus:ring-pink-400"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
              >
                <option value="" disabled>
                  Select person
                </option>
                {people.map((person) => (
                  <option key={person.uid} value={person.uid}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>
            {paidBy && (
              <div className="mt-2 text-sm text-gray-700">
                Selected: {people.find((p) => p.uid === paidBy)?.name}
              </div>
            )}
            <div className="mt-3 flex justify-end gap-2 w-full">
              <button
                className="px-4 py-2 rounded bg-gray-200"
                onClick={() => {
                  setShowBillNameModal(false);
                  setPaidBy("");
                  setBillName("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-green-500 text-white"
                onClick={handleConfirmSave}
                disabled={!billName.trim() || loading || !paidBy}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      <div className=" bg-gray-100 p-4 !pl-4 !pr-4 rounded-2xl w-full max-w-2xl flex flex-col space-y-8">
        {groups.map((group, groupIdx) => (
          <div
            key={groupIdx}
            className="bg-white text-black px-4 py-3 rounded-2xl shadow-lg flex flex-col items-center space-y-4"
          >
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-lg font-bold text-gray-800">
                {group || `Item ${groupIdx + 1}`}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">#{groupIdx + 1}</span>
                <button
                  className="ml-2 text-red-500 hover:text-red-700 rounded-full p-1 transition"
                  title="Delete Item"
                  onClick={() => handleDeleteItem(groupIdx)}
                >
                  <i className="bx bx-trash text-xl"></i>
                </button>
              </div>
            </div>
            <div className="w-full flex flex-col md:flex-row md:items-center gap-2">
              <div className="input-group flex-nowrap">
                <span className="input-group-text" id="addon-wrapping">
                  Item Name
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Itemname"
                  aria-label="Itemname"
                  aria-describedby="addon-wrapping"
                  value={itemNames[groupIdx] || ""}
                  onChange={(e) =>
                    handleItemNameChange(groupIdx, e.target.value)
                  }
                />
              </div>
              <div className="flex flex-row gap-1 ">
                <div className="input-group flex-nowrap">
                  <span className="input-group-text" id="addon-wrapping">
                    Qty
                  </span>
                  <input
                    type="number"
                    min={1}
                    className=" form-control border  px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={quantities[groupIdx]}
                    onChange={(e) =>
                      handleQuantityChange(groupIdx, e.target.value)
                    }
                  />
                </div>
                <div className="input-group flex-nowrap">
                  <span className="input-group-text" id="addon-wrapping">
                    Amt
                  </span>
                  <input
                    type="number"
                    min={0}
                    className=" form-control border  px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    value={amounts[groupIdx]}
                    onChange={(e) =>
                      handleAmountChange(groupIdx, e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="input-group flex-nowrap">
                <span className="input-group-text" id="addon-wrapping">
                  Split Between
                </span>
                <select
                  className=" form-select border  px-3 py-2 w-40 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  value=""
                  onChange={(e) => handlePersonSelect(groupIdx, e)}
                >
                  <option value="" disabled>
                    Select person
                  </option>
                  {people
                    .filter(
                      (person) =>
                        !selectedPeople[groupIdx]?.includes(person.uid)
                    )
                    .map((person) => (
                      <option key={person.uid} value={person.uid}>
                        {person.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Show selected people as chips */}
              <div className="flex flex-wrap gap-2">
                {selectedPeople[groupIdx] &&
                selectedPeople[groupIdx].length > 0 ? (
                  selectedPeople[groupIdx].map((uid) => {
                    const person = people.find((p) => p.uid === uid);
                    return (
                      <span
                        key={uid}
                        className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full flex items-center shadow"
                      >
                        {person?.name}
                        <button
                          type="button"
                          className="ml-2 text-red-500 hover:text-red-700"
                          onClick={() => handleRemovePerson(groupIdx, uid)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "1em",
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })
                ) : (
                  <span className="text-gray-400 text-sm">No one selected</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* People summary */}
        <div className="bg-white/90 rounded-2xl shadow-lg px-8 py-6  flex flex-col items-center">
          <h3 className="text-2xl font-bold !text-gray-900 mb-4">Summary</h3>
          <div className="flex flex-row flex-wrap gap-3 justify-center w-full">
            {people.map((person) => (
              <div key={person.uid}>
                <span className="text-lg font-semibold text-gray-800 mb-2">
                  {person.name}
                </span>
                <span
                  className={`text-xl font-bold ${
                    person.money > 0
                      ? "text-green-600"
                      : person.money < 0
                      ? "text-red-600"
                      : "text-gray-700"
                  }`}
                >
                  ₹ {person.money}
                </span>
              </div>
            ))}
          </div>
        </div>
        <button
          className="mt-8 bg-green-500 text-white font-semibold px-8 py-3 !rounded-full hover:bg-green-400 transition duration-300 text-lg shadow"
          onClick={handleSaveBill}
          disabled={loading || !isAnyItemFilled}
        >
          {loading ? "Saving..." : "Save Bill"}
        </button>
      </div>
    </div>
  );
}
