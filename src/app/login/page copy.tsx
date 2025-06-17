"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { isUserInSession } from "../session";
interface AuthForm {
  email: string;
  username?: string;
  password: string;
}

export default function AuthPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AuthForm>();
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const onSubmit = async (data: AuthForm) => {
    try {
      setError(null);
      setLoading(true);

      const url = isSignUp
        ? "https://baakipinnetharam.onrender.com/signup"
        : "https://baakipinnetharam.onrender.com/login";

      const requestData = isSignUp
        ? {
            email: data.email,
            password: data.password,
            username: data.username,
          }
        : { email: data.email, password: data.password };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Authentication failed.");
      }

      // Store the JWT token in localStorage
      localStorage.setItem("jwtToken", result.token);

      setIsLoggedIn(true);
      reset();
      router.push("/main");
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
    try {
      await axios.post(
        "https://baakipinnetharam.onrender.com/logout",
        {},
        { withCredentials: true }
      );
      console.log("Logout successful!");
      setIsLoggedIn(false);
      router.push("/login");
    } catch (err: any) {
      setError("Logout failed.");
    }
  };

  useEffect(() => {
    async function check() {
      const token = localStorage.getItem("jwtToken");
      console.log("Token:", token);

      if (token) {
        try {
          const response = await fetch(
            "https://baakipinnetharam.onrender.com/verify-token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            setIsLoggedIn(true);
            router.push("/main");
          } else {
            localStorage.removeItem("jwtToken");
          }
        } catch (err) {
          console.error("Error verifying token:", err);
          localStorage.removeItem("jwtToken");
        }
      }
    }
    check();
  }, []);

  return (
    <>
      <div
        style={{ background: "linear-gradient(62deg, black, #00206b)" }}
        className="flex flex-col items-center justify-center min-h-screen"
      >
        <h2 className="text-2xl font-bold text-white">
          {isLoggedIn ? "Welcome!" : isSignUp ? "Sign Up" : "Login"}
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 mt-4  p-6 rounded shadow-md w-[300px]"
        >
          <input
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Invalid email format",
              },
            })}
            type="email"
            placeholder="Email"
            className="border p-2 text-white"
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}

          {isSignUp && (
            <>
              <input
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                })}
                placeholder="Username"
                className="border p-2 text-white"
              />
              {errors.username && (
                <p className="text-red-500">{errors.username.message}</p>
              )}
            </>
          )}

          <input
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Minimum length is 6" },
            })}
            type="password"
            placeholder="Password"
            className="border p-2 text-white"
          />
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.372 0 0 5.372 0 12h4z"
                  ></path>
                </svg>
                <span>Loading...</span>
              </>
            ) : (
              <span>{isSignUp ? "Sign Up" : "Login"}</span>
            )}
          </button>
        </form>

        {!isLoggedIn && (
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-300 mt-4 underline"
          >
            {isSignUp
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </button>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </>
  );
}
