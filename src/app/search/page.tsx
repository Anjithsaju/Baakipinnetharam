"use client";
import "boxicons/css/boxicons.min.css";
import { useState, useEffect } from "react";
import axios from "axios";

import { useRouter } from "next/navigation";
type User = {
  username: string;
  _id: string;
  // add other fields if needed
};
export default function FindFriends() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("find");

  useEffect(() => {
    if (search.length > 2) {
      fetchUsers();
    } else {
      setUsers([]);
    }
  }, [search]);

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://baakipinnetharam.onrender.com/users?search=${search}`,
        {
          withCredentials: true,
        }
      );
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

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

  const sendFriendRequest = async (userId: any) => {
    try {
      await axios.post(
        "https://baakipinnetharam.onrender.com/friend-request",
        { userId },
        { withCredentials: true }
      );
      alert("Friend request sent!");
    } catch (err) {
      setError("Failed to send friend request");
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
      className="flex flex-col items-center p-6 pt-1 w-[100vw] h-[100vh] text-white"
    >
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
            className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
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
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
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
      <h2 className="text-2xl font-bold mb-4">Find Friends</h2>

      <input
        type="text"
        placeholder="Search by name or email..."
        className="border p-2 w-80 rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading && <p className="mt-2 text-gray-500">Loading...</p>}
      {error && <p className="mt-2 text-red-500">{error}</p>}
      <ul className="mt-4 w-80">
        {users.map((user) => (
          <li
            key={user._id}
            className="flex justify-between p-2 border-black mb-2 bg-gray-300 rounded-[11px] text-lg items-center px-6 text-black
                sm:px-4 md:px-6 lg:px-8"
          >
            <span>{user.username}</span>
            <button
              onClick={() => sendFriendRequest(user._id)}
              className="bg-blue-500 text-white px-2 py-1 rounded"
            >
              Add Friend
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
