"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import IconCircle from "./IconCircle";
import { useTheme } from "./Theme";
import { Around } from "@theme-toggles/react";
// Add Boxicons CDN for icons
if (typeof window !== "undefined") {
  const link = document.createElement("link");
  link.href = "https://cdn.boxicons.com/fonts/basic/boxicons.min.css";
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

interface NavProps {
  homePath?: string;
  title?: string;
  icon?: string;
}

export default function Nav({
  homePath,
  title = "Baaki Pinne Tharam",
  icon = "bx bx-arrow-left-stroke text-black",
}: NavProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { theme, themeClass, toggleTheme } = useTheme();

  const handleClick = () => {
    if (homePath) {
      router.push(homePath);
    } else {
      router.back();
    }
  };

  return (
    <div className="w-full m-3 max-w-xl">
      <div
        className={`relative flex justify-between items-center w-full ${themeClass} rounded-full px-3 py-1 gap-2.5`}
      >
        <button
          onClick={handleClick}
          className="w-8 h-8 bg-gray-200 !text-black !rounded-full flex items-center justify-center"
        >
          <i className={icon}></i>
        </button>
        <Around
          duration={750}
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          onToggle={toggleTheme}
        />
        {/* <IconCircle className={icon} text="Home" onClick={handleClick} /> */}
        <h2 className="mb-0 font-semibold">{title}</h2>
      </div>
    </div>
  );
}
