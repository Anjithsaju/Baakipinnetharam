"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import "boxicons/css/boxicons.min.css";

interface Friend {
  uid: string;
  name: string;
}

interface UserProfileData {
  name: string;
  friends: Friend[];
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const router = useRouter();
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("jwtToken");

      localStorage.removeItem("jwtToken"); // Remove the token from localStorage
      console.log("Logout successful!");
      router.push("/login");
    } catch (err: any) {
      console.error("Logout failed.", err);
    }
  };
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("jwtToken");

        const response = await axios.get(
          "https://baakipinnetharam.onrender.com/UserData",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { name, friends } = response.data;
        setUser({ name, friends });
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div
      className="h-screen  text-white p-6"
      style={{ background: "linear-gradient(62deg, black, #00206b)" }}
    >
      <div className="relative flex justify-center items-center gap-2 w-full mb-5 text-black">
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
                path === "/profile" ? "bg-yellow-400" : "bg-gray-200"
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
      <div className="flex justify-center items-center">
        {!user ? (
          <div className=" flex justify-center items-center bg-transparent text-white">
            <p>Loading profile...</p>
          </div>
        ) : (
          <>
            <div className="bg-white/10 backdrop-blur-md rounded-xl w-full max-w-md p-6 shadow-lg">
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-semibold text-yellow-400">
                  {user.name}
                </h1>
              </div>

              <div className="mb-6">
                <div className="flex gap-3 mb-2 items-center">
                  <h2 className="text-xl font-semibold ">Friends</h2>
                  <button
                    className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center"
                    onClick={() => router.push("/search")}
                  >
                    <span className=" font-bold">+</span>
                  </button>
                </div>
                <ul className="space-y-2 max-h-[60vh] overflow-auto">
                  {user.friends.length > 0 ? (
                    user.friends.map((friend) => (
                      <li
                        key={friend.uid}
                        className="bg-white/10 p-2 rounded-md border border-white/20"
                      >
                        {friend.name}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-300 italic">No friends listed</li>
                  )}
                </ul>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg shadow"
                >
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
