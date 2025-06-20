"use client";
import "./login.css";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { isUserInSession } from "../session";
import { useTheme } from "../Theme";

// Add this global declaration for window.google
declare global {
  interface Window {
    google?: any;
  }
}

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
  const { themeClass } = useTheme();

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
      console.log("Login successful:", result);
      // Store the JWT token in localStorage
      localStorage.setItem("jwtToken", result.token);

      setIsLoggedIn(true);
      reset();
      if (isSignUp) router.push("/help");
      else router.push("/main");
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
      setIsLoggedIn(false);
      router.push("/login");
    } catch (err: any) {
      setError("Logout failed.");
    }
  };
  const handleGoogleResponse = async (response: any) => {
    try {
      const credential = response.credential;
      console.log("Google token:", credential);

      // (Optional) decode the JWT
      // const user = jwt_decode(credential);
      // console.log("Decoded user:", user);
      // Send to your backend
      const res = await fetch(
        "https://baakipinnetharam.onrender.com/google-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: credential }),
        }
      );

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);

      localStorage.setItem("jwtToken", result.token1);
      console.log("Login successful:", result.token1);
      setIsLoggedIn(true);
      if (result.signup) router.push("/help");
      else router.push("/main");
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message || "Google login failed.");
    }
  };

  useEffect(() => {
    // Load Google script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id:
            "402890799956-ccogmmeun8uqatndmmt0k3n0hhpm2gha.apps.googleusercontent.com", // ⬅️ Replace with your actual client ID
          callback: handleGoogleResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          {
            theme: "outline",
            size: "large",
            width: "100%",
          }
        );
      }
    };
  }, []);

  useEffect(() => {
    async function check() {
      const token = localStorage.getItem("jwtToken");
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
          localStorage.removeItem("jwtToken");
        }
      }
    }
    check();
  }, []);

  return (
    <div
      style={{ background: "linear-gradient(62deg, black, #00206b)" }}
      className={`flex flex-col items-center justify-center min-h-screen ${themeClass}`}
    >
      <div className="form-container">
        <p className="title">{isSignUp ? "Sign Up" : "Login"}</p>
        <form onSubmit={handleSubmit(onSubmit)} className="form ">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Invalid email format",
                },
              })}
              type="email"
              id="email"
              placeholder="Email"
              className="border p-2"
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>

          {isSignUp && (
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                })}
                id="username"
                placeholder="Username"
                className="border p-2"
              />
              {errors.username && (
                <p className="text-red-500">{errors.username.message}</p>
              )}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum length is 6" },
              })}
              type="password"
              id="password"
              placeholder="Password"
              className="border p-2"
            />
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
            <div className="forgot">
              <a rel="noopener noreferrer" href="#">
                Forgot Password ?
              </a>
            </div>
          </div>

          <button type="submit" className="  sign" disabled={loading}>
            {loading ? (
              <>
                <div className=" flex flex-row items-center justify-center gap-2 ">
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
                </div>
              </>
            ) : (
              <span>{isSignUp ? "Sign Up" : "Login"}</span>
            )}
          </button>
        </form>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <div className="social-message">
          <div className="line"></div>
          <p className="message">Login with social accounts</p>
          <div className="line"></div>
        </div>
        <div className="social-icons">
          <div id="googleSignInDiv" className="icon" />
        </div>

        <p className="signup">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            // className="text-blue-300 mt-4 underline"
          >
            {isSignUp
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
function jwt_decode(credential: any) {
  throw new Error("Function not implemented.");
}
