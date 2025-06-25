"use client";
import "boxicons/css/boxicons.min.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ClipLoader from "react-spinners/ClipLoader";
import { Toaster, toast } from "react-hot-toast";
import { isUserInSession } from "../session";
type User = {
  name: string;
  uid: string;
};

export default function FindFriends() {
  const [checking, setChecking] = useState(true);

  const router = useRouter();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken"); // Retrieve the JWT token

      const response = await axios.get(
        `https://baakipinnetharam.onrender.com/users?search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
          withCredentials: true,
        }
      );
      setUsers(response.data);
      setError(null);
    } catch (err) {
      toast.error("Failed to fetch users");
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    const token = localStorage.getItem("jwtToken"); // Retrieve the JWT token

    const promise = toast.promise(
      axios.post(
        "https://baakipinnetharam.onrender.com/friend-request",
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
          withCredentials: true,
        }
      ),
      {
        loading: "Sending request...",
        success: "Friend request sent!",
        error: "Failed to send request",
      }
    );
    await promise;
  };

  const respondToRequest = async (requestId: string, action: string) => {
    const token = localStorage.getItem("jwtToken"); // Retrieve the JWT token

    try {
      await axios.post(
        "https://baakipinnetharam.onrender.com/respond-request",
        { requestId, action },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
          withCredentials: true,
        }
      );
      toast.success(`Friend request ${action}ed`);
    } catch {
      toast.error("Failed to respond to request");
    }
  };

  useEffect(() => {
    if (search.length > 2) fetchUsers();
    else setUsers([]);
  }, [search]);

  // useEffect(() => {
  //   async function check() {
  //     const isLoggedIn = await isUserInSession();
  //     if (!isLoggedIn) {
  //       router.push("/");
  //     } else {
  //       setChecking(false);
  //     }
  //   }

  //   check();
  // }, []);

  return (
    <div
      style={{ background: "linear-gradient(62deg, black, #00206b)" }}
      className="flex flex-col items-center p-6 pt-1 w-[100vw] h-[100vh] text-white"
    >
      <Toaster position="top-right" />

      <div className="relative flex justify-center items-center gap-2 w-full my-4 text-black">
        <div className="bg-gray-300 rounded-full flex items-center justify-center gap-[15px] w-auto h-auto py-[6px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          {[
            "/history",
            "/search",
            "/help",
            "/main",
            "/bills",
            "/messages",
            "/profile",
          ].map((path, i) => (
            <button
              key={path}
              onClick={() => router.push(path)}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                path === "/search" ? "bg-yellow-400" : "bg-gray-200"
              }`}
            >
              <i
                className={`bx ${
                  [
                    "bx-history",
                    "bx-search",
                    "bx bx-help-circle ",
                    "bx-home-alt",
                    "bx bxs-receipt",
                    "bx-envelope",
                    "bx-user",
                  ][i]
                }`}
              ></i>
            </button>
          ))}
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Find Friends</h2>

      <input
        type="text"
        placeholder="Search by name or email..."
        className="border p-2 w-80 rounded text-white"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="mt-4">
          <ClipLoader color="#ffffff" loading={loading} size={30} />
        </div>
      ) : (
        <ul className="mt-4 w-80">
          {users.map((user) => (
            <li
              key={user.uid}
              className="flex justify-between p-2 border-black mb-2 bg-gray-300 rounded-[11px] text-lg items-center px-6 text-black sm:px-4 md:px-6 lg:px-8"
            >
              <span>{user.name}</span>
              <button
                onClick={() => sendFriendRequest(user.uid)}
                className="bg-blue-500 text-white px-2 py-1 rounded"
              >
                Add Friend
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
}
