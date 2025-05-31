"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import "boxicons/css/boxicons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Alert from "../alert";
import { useAlert } from "../AlertContext";
import Nav from "../nav";
export default function Split() {
  type Group = {
    _id: string;
    groupName: string;
    members: { uid: string; name: string }[];
  };
  const [groups, setGroups] = useState<Group[]>([]);
  const [modalGroupName, setModalGroupName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedGroupname, setSelectedGroup] = useState<string>("");
  const [people, setPeople] = useState<{ uid: string; name: string }[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<
    { uid: string; name: string }[]
  >([]);
  const router = useRouter();
  const { showAlert, hideAlert } = useAlert();
  const [loading, setLoading] = useState(true);
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
  // Move fetchUserGroups to component scope so it can be reused
  const fetchUserGroups = async () => {
    setLoading(true);
    console.log("Fetching user groups...");
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGroups();
  }, []);

  const handleModalSave = () => {
    if (modalGroupName.trim() !== "") {
      //setGroups([...groups, modalGroupName.trim()]);
      console.log(selectedPeople, modalGroupName);
      showAlert({ status: "loading", message: "Processing..." });
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
              showAlert({
                status: "success",
                message: "Group created successfully",
              });
              fetchUserGroups();
            } else {
              showAlert({
                status: "error",
                message: data.message,
              });
            }
          });
      } catch (error) {
        console.error("Error creating group:", error);
      } finally {
        setModalGroupName("");
        setSelectedPeople([]);
      }
      //window.location.reload();
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
  const handleDeleteGroup = async () => {
    showAlert({ status: "loading", message: "Processing..." });
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(
        `https://baakipinnetharam.onrender.com/delete-group/${selectedGroupname}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (data.success) {
        showAlert({
          status: "success",
          message: "Group deleted successfully",
        });
        fetchUserGroups();
      } else {
        showAlert({
          status: "error",
          message: data.message,
        });
      }
    } catch (error) {
      showAlert({
        status: "error",
        message: "Failed to delete group",
      });
    } finally {
      setSelectedGroup(""); // Clear the selected group after deletion
      // Optionally, you can close the modal here if needed
    }
  };
  useEffect(() => {
    // @ts-ignore
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black to-blue-900 text-white flex flex-col items-center px-6 py-10 !pt-2 space-y-10">
      <Nav homePath="/main" icon="bx bx-home-alt" title="Baaki Pinne Tharam" />
      <div className="w-full max-w-xs flex justify-between items-center">
        <h2 className="text-2xl font-bold mr-4">Your Groups</h2>
        <button
          type="button"
          className="bg-yellow-400 text-black font-semibold px-2 py-2 !rounded-full hover:bg-yellow-300 transition duration-300 text-sm"
          data-bs-toggle="modal"
          data-bs-target="#exampleModal"
        >
          Create new Group
        </button>
      </div>

      <div className="w-full  flex flex-col space-y-4 max-w-xl">
        {loading ? (
          <div className="text-center text-gray-300 py-8">Loading...</div>
        ) : groups.length === 0 ? (
          <div className="text-center text-gray-300 py-8">No groups found.</div>
        ) : (
          groups.map((group, index) => (
            <div
              key={index}
              className="bg-gray-100 text-black px-3 py-3 rounded  shadow cursor-pointer transition select-none"
              onClick={() => router.push(`/bills/${group._id}`)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold">{group.groupName}</div>
                <button
                  className="btn btn-primary !text-black ml-2 !bg-transparent px-2 py-1 rounded !border-none"
                  type="button"
                  data-bs-toggle="modal"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGroup(group._id);
                  }}
                  data-bs-target="#deleteModal"
                >
                  <i className="bx bx-trash"></i>
                </button>
              </div>
              <div className="text-gray-600 text-sm">
                {group.members.length} members :
                {group.members.map((member) => member.name).join(", ")}
              </div>
            </div>
          ))
        )}
      </div>

      <div
        className="modal fade "
        id="exampleModal"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog  top-[30%]">
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

      <div
        className="modal fade  !text-black"
        id="deleteModal"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog top-[30%]">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Delete Group
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">Are you sure to delete this Group?</div>
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
                  handleDeleteGroup();
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
