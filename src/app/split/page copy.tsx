"use client";
import { useState, useRef } from "react";
import "boxicons/css/boxicons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default function Split() {
  const [groups, setGroups] = useState(["Group 1", "Group 2", "Group 3"]);
  const [modalGroupName, setModalGroupName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleModalSave = () => {
    if (modalGroupName.trim() !== "") {
      setGroups([...groups, modalGroupName.trim()]);
      setModalGroupName("");
      // Close the modal programmatically

      //document.getElementById("exampleModal").style.display = "none";
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black to-blue-900 text-white flex flex-col items-center px-6 py-10 space-y-10">
      <div className="w-full max-w-xs flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Groups</h2>
        <button
          type="button"
          className="bg-yellow-400 text-black font-semibold px-4 py-2 !rounded-full hover:bg-yellow-300 transition duration-300 text-sm"
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
            className="bg-gray-100 text-black px-4 py-4 rounded shadow"
          >
            {group}
          </div>
        ))}
      </div>

      <div
        className="modal fade"
        id="exampleModal"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1
                className="modal-title fs-5 text-black"
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
            <div className="modal-body">
              <input
                className="form-control"
                type="text"
                placeholder="Enter Group name"
                id="groupName"
                ref={inputRef}
                value={modalGroupName}
                onChange={(e) => setModalGroupName(e.target.value)}
              />
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
    </div>
  );
}
