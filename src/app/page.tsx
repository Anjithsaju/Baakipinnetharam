"use client";
import { useRouter } from "next/navigation";
import "boxicons/css/boxicons.min.css";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black to-blue-900 text-white flex flex-col items-center px-6 py-10 space-y-20">
      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-wide">Baakipinnetharam</h1>
        <button
          onClick={() => router.push("/main")}
          className="bg-yellow-400 text-black font-semibold px-5 py-2.5 rounded-full hover:bg-yellow-300 transition duration-300"
        >
          Enter App
        </button>
      </header>

      {/* Hero Section */}
      <section className="text-center max-w-4xl w-full space-y-12">
        <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          Never lose track of{" "}
          <span className="text-yellow-400">who owes what</span>
        </h2>

        <div className="flex flex-col lg:flex-row items-center gap-10 text-lg text-gray-300">
          {/* Text Section */}
          <div className="flex-1 text-left">
            <p>
              <strong>“Baakipinnetharam”</strong> — bet you’ve heard your
              friends say this after splitting a bill, right? But let’s be
              honest, you never really remember who owes what. I’ve been there —
              too many times. Not anymore!
            </p>
          </div>

          {/* Image with speech bubble */}
          <div className="relative flex-shrink-0 w-52 h-52 rounded-xl overflow shadow-lg border-2 border-yellow-400">
            <img
              src="https://in.bmscdn.com/iedb/artist/images/website/poster/large/suresh-krishna-1080679-1684480088.jpg"
              alt="Suresh Krishna"
              className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute -top-6 -right-8 bg-white text-black text-sm font-semibold px-3 py-2 rounded-full shadow-md rotate-4">
              Baakipinnetharam!
            </div>
          </div>
        </div>

        <div className="text-left text-gray-300">
          <p>
            Introducing <strong>Baakipinnetharam</strong> — your personal
            “kanakku” keeper. Because let’s face it,{" "}
            <em>“boolokathinte sthapanam thanne kanakkil alle!”</em>
            <br />
            <br />
            So next time your friend says <strong>baakipinnetharam</strong>,
            just smile. We’ve got your back. 😎
          </p>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="mt-6 px-6 py-3 bg-yellow-400 text-black rounded-full font-semibold hover:bg-yellow-300 transition duration-300"
        >
          Get Started
        </button>
      </section>

      {/* Features Intro */}
      <section className="text-center max-w-2xl w-full space-y-4">
        <h2 className="text-3xl font-bold text-yellow-400">Our Features</h2>
        <p className="text-lg text-gray-300">
          Whether it's splitting rent, dinner, or a coffee — Baakipinnetharam
          has your back. Manage friends, track expenses, and chat your way
          through it.
        </p>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-6xl text-center">
        {[
          {
            icon: "bx-wallet",
            title: "Split Expenses",
            desc: "Track who paid what and settle up easily in groups.",
          },
          {
            icon: "bx-user-plus",
            title: "Manage Friends",
            desc: "Send & accept friend requests to keep your expense circle tight.",
          },
          {
            icon: "bx-chat",
            title: "Chat Instantly",
            desc: "Discuss expenses, plans, and reimbursements right in-app.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-2xl p-6 shadow-lg hover:scale-105 hover:shadow-yellow-300/30 transition-all duration-300"
          >
            <i className={`bx ${item.icon} text-5xl text-yellow-400 mb-4`}></i>
            <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
            <p className="text-gray-400">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="mt-20 text-gray-500 text-sm text-center space-y-2">
        <p>
          © 2025 <strong>Baakipinnetharam</strong>. Built for those who always
          say <em>“baaki pinne tharam.”</em> 😎
        </p>
        <p>
          Created by{" "}
          <a
            href="https://anjithsaju.github.io/Portfolio/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 hover:underline"
          >
            Anjith Saju
          </a>
        </p>
      </footer>
    </div>
  );
}
