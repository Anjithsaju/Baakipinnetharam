// components/Alert.tsx
import { useEffect, useState } from "react";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  type?: AlertType;
  message: string;
  duration?: number;
}

export default function Alert({
  type = "info",
  message,
  duration = 3000,
}: AlertProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    console.log("hiii"); // Reset visible when message/type changes
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [message, type, duration]);

  if (!visible) return null;

  const baseStyle =
    "fixed top-5 right-5 px-6 py-3 rounded-xl shadow-lg text-sm font-medium transition-all z-50";

  const typeStyles: Record<AlertType, string> = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-black",
    info: "bg-blue-500 text-white",
  };

  return <div className={`${baseStyle} ${typeStyles[type]}`}>{message}</div>;
}
