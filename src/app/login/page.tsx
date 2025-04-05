"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";

interface AuthForm {
  email: string;
  username?: string;
  password: string;
}

export default function AuthPage() {
  const { register, handleSubmit, reset } = useForm<AuthForm>();
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(
          "https://baakipinnetharam.onrender.com/session",
          {
            withCredentials: true,
          }
        );
        if (response.data.isAuthenticated) {
          setIsLoggedIn(true);
        }
      } catch (err) {
        setIsLoggedIn(false);
      }
    };
    checkSession();
  }, []);

  const onSubmit = async (data: AuthForm) => {
    try {
      setError(null);
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

      const response = await axios.post(url, requestData, {
        withCredentials: true,
      });

      console.log(response.data.message);
      setIsLoggedIn(true);
      reset();
      router.push("/main");
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication failed.");
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

  return (
    <div
      style={{ background: "linear-gradient(62deg, black, #00206b)" }}
      className="flex flex-col items-center justify-center min-h-screen"
    >
      {/* Title */}
      {/* <h2 className="text-white font-semibold text-[30px] absolute top-10">
        Baaki Pinne Tharam
      </h2> */}

      <h2 className="text-2xl font-bold">
        {isLoggedIn ? "Welcome!" : isSignUp ? "Sign Up" : "Login"}
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 mt-4"
      >
        <input
          {...register("email", { required: "Email is required" })}
          type="email"
          placeholder="Email"
          className="border p-2"
        />
        {isSignUp && (
          <input
            {...register("username", { required: "Username is required" })}
            placeholder="Username"
            className="border p-2"
          />
        )}
        <input
          {...register("password", {
            required: "Password is required",
            minLength: { value: 6, message: "Minimum length is 6" },
          })}
          type="password"
          placeholder="Password"
          className="border p-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2">
          {isSignUp ? "Sign Up" : "Login"}
        </button>
      </form>

      {/* <button onClick={handleLogout} className="bg-red-500 text-white p-2 mt-4">
        Logout
      </button> */}

      {!isLoggedIn && (
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-blue-500 mt-4"
        >
          {isSignUp
            ? "Already have an account? Login"
            : "Don't have an account? Sign Up"}
        </button>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
