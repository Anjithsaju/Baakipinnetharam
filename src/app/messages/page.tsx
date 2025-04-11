"use client";
import "boxicons/css/boxicons.min.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ClipLoader from "react-spinners/ClipLoader";
import { Toaster, toast } from "react-hot-toast";
import { isUserInSession } from "../session";
type User = {
  username: string;
  _id: string;
  id: string;
};

export default function Messages() {
  const [checking, setChecking] = useState(true);

  const router = useRouter();
  const [friendRequests, setFriendRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const fetchFriendRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken"); // Retrieve the JWT token

      const response = await axios.get(
        "https://baakipinnetharam.onrender.com/friend-requests",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
          withCredentials: true,
        }
      );

      setFriendRequests(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch friend requests");
      toast.error("Failed to fetch friend requests");
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId: string, action: string) => {
    const token = localStorage.getItem("jwtToken"); // Retrieve the JWT token

    const promise = toast.promise(
      axios.post(
        "https://baakipinnetharam.onrender.com/respond-request",
        { requestId, action },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
          withCredentials: true,
        }
      ),
      {
        loading: `Processing...`,
        success: `Friend request ${action}ed!`,
        error: "Failed to respond to request",
      }
    );
    await promise;
    fetchFriendRequests(); // Refresh after action
  };
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

  //if (checking) return <p>Checking session...</p>;
  return (
    <div
      style={{ background: "linear-gradient(62deg, black, #00206b)" }}
      className="flex flex-col items-center p-6 w-[100vw] h-[100vh] text-white pt-1"
    >
      <Toaster position="top-right" />

      {/* Nav Icons */}
      <div className="relative flex justify-center items-center gap-2 w-full my-4 text-black">
        <div className="bg-gray-300 rounded-full flex items-center justify-center gap-[15px] w-auto h-auto py-[6px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          {["/history", "/search", "/main", "/messages", "/profile"].map(
            (path, i) => (
              <button
                key={path}
                onClick={() => router.push(path)}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  path === "/messages" ? "bg-yellow-400" : "bg-gray-200"
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

      <h2 className="text-2xl font-bold mb-4">Messages</h2>

      {loading ? (
        <div className="mt-4">
          <ClipLoader color="#ffffff" loading={loading} size={30} />
        </div>
      ) : friendRequests.length === 0 ? (
        <p className="text-gray-400">No friend requests</p>
      ) : (
        <ul className="mt-4 w-80">
          {friendRequests.map((request) => (
            <li
              key={request.id}
              className="flex justify-between p-2 border-black mb-2 bg-gray-300 rounded-[11px] text-lg items-center px-6 text-black sm:px-4 md:px-6 lg:px-8"
            >
              <span>Request from {request.username}</span>
              <div className="flex gap-2 justify-start">
                <button
                  onClick={() => respondToRequest(request.id, "accept")}
                  className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center"
                >
                  <i className="bx bx-user-check"></i>
                </button>
                <button
                  onClick={() => respondToRequest(request.id, "reject")}
                  className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center"
                >
                  <i className="bx bx-x"></i>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
}
