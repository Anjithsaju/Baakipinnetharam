"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import "boxicons/css/boxicons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Split() {
  type Group = {
    _id: string;
    groupName: string;
    members: { uid: string; name: string }[];
  };
  const [groups, setGroups] = useState<Group[]>([]);
  const [modalGroupName, setModalGroupName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [people, setPeople] = useState<{ uid: string; name: string }[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<
    { uid: string; name: string }[]
  >([]);
  const router = useRouter();
  // const [people] = useState([
  //   { uid: "1", name: "Person1" },
  //   { uid: "2", name: "Person2" },
  //   { uid: "3", name: "Person3" },
  // ]);
  useEffect(() => {
    // Fetch people
    const fetchPeople = async () => {
      try {
        console.log("Fetching people...");
        const token = localStorage.getItem("jwtToken");
        const res = await fetch(
          "https://baakipinnetharam.onrender.com/UserData",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (data && Array.isArray(data.friends)) {
          setPeople(data.friends); // Use the friends array from your response
          console.log("Fetched people:", data.friends);
        }
      } catch (err) {
        console.error("Failed to fetch people:", err);
      }
    };

    fetchPeople();
  }, []);
  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const res = await fetch(
          "https://baakipinnetharam.onrender.com/my-groups",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.groups)) {
          console.log("Fetched groups:", data.groups);
          setGroups(data.groups);
        }
      } catch (err) {
        console.error("Failed to fetch user groups:", err);
      }
    };
    fetchUserGroups();
  }, []);

  const handleModalSave = () => {
    if (modalGroupName.trim() !== "") {
      //setGroups([...groups, modalGroupName.trim()]);
      console.log(selectedPeople, modalGroupName);
      try {
        const token = localStorage.getItem("jwtToken"); // Retrieve the JWT token
        fetch("https://baakipinnetharam.onrender.com/create-group", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            groupName: modalGroupName.trim(),
            members: selectedPeople,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              console.log("Group created successfully");
            } else {
              console.error("Failed to create group:", data.message);
            }
          });
      } catch (error) {
        console.error("Error creating group:", error);
      }
      setModalGroupName("");
      setSelectedPeople([]);
      window.location.reload();
    }
  };
  const handlePersonSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const uid = e.target.value;
    const person = people.find((p) => p.uid === uid);
    if (person) {
      setSelectedPeople([...selectedPeople, { uid, name: person.name }]);
      console.log("Selected people:", selectedPeople);
    }
    e.target.selectedIndex = 0;
  };
  const handleRemovePerson = (uid: string) => {
    setSelectedPeople(selectedPeople.filter((person) => person.uid !== uid));
  };
  useEffect(() => {
    // @ts-ignore
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black to-blue-900 text-white flex flex-col items-center px-6 py-10 space-y-10">
      <div className="w-full max-w-xs flex justify-between items-center">
        <div className="bg-gray-300 rounded-full flex items-center justify-center gap-[15px] w-auto h-auto px-2 py-1">
          <button
            key="/main"
            onClick={() => router.push("/main")}
            // onClick={() => router.push(path)}
            // className={`w-8 h-8 rounded-full flex items-center justify-center ${
            //   path === "/search" ? "bg-yellow-400" : "bg-gray-200"
            // }`}
          >
            <i className="bx bx-home-alt text-black"></i>
          </button>
        </div>
        <h2 className="text-2xl font-bold mr-4">Groups</h2>
        <button
          type="button"
          className="bg-yellow-400 text-black font-semibold px-2 py-2 !rounded-full hover:bg-yellow-300 transition duration-300 text-sm"
          data-bs-toggle="modal"
          data-bs-target="#exampleModal"
        >
          Create new Group
        </button>
      </div>

      <div className="w-full max-w-xs flex flex-col space-y-4">
        {groups.map((group, index) => (
          <div
            key={index}
            className="bg-gray-100 text-black px-4 py-4 rounded shadow cursor-pointer  transition"
            onClick={() => router.push(`/bills/${group._id}`)}
          >
            <div className="font-bold">{group.groupName}</div>
            <div className="text-gray-600 text-sm">
              {group.members.length} members :
              {group.members.map((member) => member.name).join(", ")}
            </div>
          </div>
        ))}
      </div>

      <div
        className="modal fade "
        id="exampleModal"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1
                className="modal-title fs-5 text-black "
                id="exampleModalLabel"
              >
                Enter Group name
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body text-black ">
              <input
                className="form-control mb-2"
                type="text"
                placeholder="Enter Group name"
                id="groupName"
                ref={inputRef}
                value={modalGroupName}
                onChange={(e) => setModalGroupName(e.target.value)}
              />
              <div className="input-group flex-nowrap">
                <span className="input-group-text" id="addon-wrapping">
                  Select Members
                </span>
                <select
                  className=" form-select border  px-3 py-2 w-40 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  value=""
                  onChange={(e) => handlePersonSelect(e)}
                >
                  <option value="" disabled>
                    Select person
                  </option>
                  {people
                    .filter(
                      (person) =>
                        !selectedPeople.some((p) => p.uid === person.uid)
                    )
                    .map((person) => (
                      <option key={person.uid} value={person.uid}>
                        {person.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-wrap gap-2">
                  {selectedPeople.length > 0 ? (
                    selectedPeople.map((member) => {
                      const person = people.find((p) => p.uid === member.uid);
                      return (
                        <span
                          key={member.uid}
                          className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full flex items-center shadow"
                        >
                          {person?.name}
                          <button
                            type="button"
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={() => handleRemovePerson(member.uid)}
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
                    <span className="text-gray-400 text-sm">
                      No one selected
                    </span>
                  )}
                </div>
              </div>
            </div>
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
                onClick={handleModalSave}
                className="btn btn-primary"
                data-bs-dismiss="modal"
                disabled={modalGroupName.trim() === ""}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* <BillsPage
        bills={[
          { id: "1", name: "Dinner", amount: 1200, group: "Friends" },
          { id: "2", name: "Groceries", amount: 800, group: "Family" },
        ]}
      /> */}
    </div>
  );
}
