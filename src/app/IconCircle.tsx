import React, { useState, useEffect } from "react";

export default function IconCircle(props: {
  className?: string;
  text?: string;
  onClick?: () => void;
}) {
  const [showIcon, setShowIcon] = useState(true);
  const iconclassName: string = props.className || "text-gray-700 text-lg";
  const textname: string = props.text || "Search";

  useEffect(() => {
    const timer = setInterval(() => {
      setShowIcon((prev) => !prev);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <button
      onClick={props.onClick}
      className={`w-8 h-8 !rounded-full flex items-center justify-center relative text-[inherit]  transition-colors duration-500 ${
        showIcon ? "bg-gray-200" : "bg-none"
      }`}
    >
      {/* Icon Layer */}
      <span
        className={`absolute flex items-center justify-center !text-black transition-all duration-700 ease-in-out transform ${
          showIcon
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-50 -rotate-45"
        }`}
      >
        <i className={iconclassName}></i>
      </span>

      {/* Text Layer */}
      <span
        className={`flex items-center absolute transition-all duration-700 ease-in-out transform ${
          !showIcon
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-50 rotate-45 -translate-y-2"
        }`}
      >
        <span className="text-[70%] font-semibold text-[inherit] tracking-tight">
          {textname}
        </span>
      </span>
    </button>
  );
}
