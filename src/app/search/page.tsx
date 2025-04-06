"use client";
import "boxicons/css/boxicons.min.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ClipLoader from "react-spinners/ClipLoader";
import { Toaster, toast } from "react-hot-toast";

type User = {
  username: string;
  _id: string;
  uid: string;
};

export default function FindFriends() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null); // Current user can be of any type initially
  const [friendsList, setFriendsList] = useState<string[]>([]); // Friend names
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the current user and their friends
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(
        "https://baakipinnetharam.onrender.com/UserData",
        {
          withCredentials: true,
        }
      );
      const { user, friends } = response.data;

      // Set current user data
      setCurrentUser(user);

      // Set friends list (using uid to filter them out later)
      const friendsUids = friends.map((friend: any) => friend.uid);
      setFriendsList(friendsUids);
    } catch (err) {
      toast.error("Failed to fetch current user");
      setError("Failed to fetch current user");
    }
  };

  // Fetch users based on search query
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://baakipinnetharam.onrender.com/users?search=${search}`,
        { withCredentials: true }
      );

      // Filter out the current user and their friends based on uid
      const allUsers: User[] = response.data;
      const filteredUsers = allUsers.filter(
        (user) =>
          user.uid !== currentUser?.uid && !friendsList.includes(user.uid) // Filter by uid
      );

      setUsers(filteredUsers);
      setError(null);
    } catch (err) {
      toast.error("Failed to fetch users");
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    const promise = toast.promise(
      axios.post(
        "https://baakipinnetharam.onrender.com/friend-request",
        { userId },
        { withCredentials: true }
      ),
      {
        loading: "Sending request...",
        success: "Friend request sent!",
        error: "Failed to send request",
      }
    );
    await promise;
  };

  useEffect(() => {
    fetchCurrentUser(); // Fetch current user and their friends when component mounts
  }, []);

  useEffect(() => {
    if (search.length > 2)
      fetchUsers(); // Fetch users when search query changes
    else setUsers([]);
  }, [search, currentUser, friendsList]); // Re-run when current user or friends list changes

  return (
    <div
      style={{ background: "linear-gradient(62deg, black, #00206b)" }}
      className="flex flex-col items-center p-6 pt-1 w-[100vw] h-[100vh] text-white"
    >
      <Toaster position="top-right" />

      {/* Nav Buttons */}
      <div className="relative flex justify-center items-center gap-2 w-full my-4 text-black">
        <div className="bg-gray-300 rounded-full flex items-center justify-center gap-[15px] w-auto h-auto py-[6px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          {["/history", "/search", "/main", "/messages", "/profile"].map(
            (path, i) => (
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
                      "bx-home-alt",
                      "bx-envelope",
                      "bx-user",
                    ][i]
                  }`}
                ></i>
              </button>
            )
          )}
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
              key={user._id}
              className="flex justify-between p-2 border-black mb-2 bg-gray-300 rounded-[11px] text-lg items-center px-6 text-black sm:px-4 md:px-6 lg:px-8"
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
      )}

      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
}
