"use client";
import "boxicons/css/boxicons.min.css";
import { useState, useEffect } from "react";
import axios from "axios";

import { useRouter } from "next/navigation";
type User = {
  username: string;
  _id: string;
  id: string;
  // add other fields if needed
};
export default function Messages() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("find");

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(
        "https://baakipinnetharam.onrender.com/friend-requests",
        {
          withCredentials: true,
        }
      );
      setFriendRequests(response.data);
      console.log(friendRequests);
    } catch (err) {
      setError("Failed to fetch friend requests");
    }
  };

  const respondToRequest = async (requestId: any, action: any) => {
    try {
      await axios.post(
        "https://baakipinnetharam.onrender.com/respond-request",
        { requestId, action },
        { withCredentials: true }
      );
      alert(`Friend request ${action}ed!`);
      fetchFriendRequests(); // Refresh requests after action
    } catch (err) {
      setError("Failed to respond to request");
    }
  };

  return (
    <div
      style={{ background: "linear-gradient(62deg, black, #00206b)" }}
      className="flex flex-col items-center p-6 w-[100vw] h-[100vh] text-white pt-1"
    >
      {/* Title */}

      {/* Middle Section - Add Transaction Button */}
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
            onClick={() => router.push("/main")}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
          >
            <i className="bx bx-home-alt"></i>
          </button>
          <button
            onClick={() => router.push("/messages")}
            className="w-8 h-8  bg-yellow-400 rounded-full flex items-center justify-center"
          >
            <i className="bx bx-envelope"></i>
          </button>
          <button
            onClick={() => router.push("/profile")}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
          >
            <i className="bx bx-user"></i>
          </button>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-4">Messages</h2>

      {/* Tabs */}
      {/* <div className="flex mb-4">
        <button
          className={`px-4 py-2 ml-2 ${
            activeTab === "requests" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("requests")}
        >
          Friend Requests ({friendRequests.length})
        </button>
      </div> */}

      {friendRequests.length === 0 ? (
        <p className="text-gray-500">No friend requests</p>
      ) : (
        <ul className="mt-4 w-80">
          {friendRequests.map((request) => (
            <li
              key={request.id}
              className="flex justify-between p-2 border-black mb-2 bg-gray-300 rounded-[11px] text-lg items-center px-6  text-black
                sm:px-4 md:px-6 lg:px-8"
            >
              <span>Request from {request.username}</span>
              <div className="flex gap-2 justify-start">
                <button
                  onClick={() => respondToRequest(request.id, "accept")}
                  className="w-8 h-8 bg-green-200 rounded-full  flex items-center justify-center"
                >
                  <i className="bx bx-user-check"></i>
                </button>

                <button
                  onClick={() => respondToRequest(request.id, "reject")}
                  className="w-8 h-8 bg-red-200 rounded-full  flex items-center justify-center"
                >
                  <i className="bx bx-x"></i>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
