"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type AlertStatus = "idle" | "loading" | "success" | "error";
type AlertConfig = {
  status: AlertStatus;
  message: string;
};

type AlertContextType = {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertConfig | null>(null);

  const showAlert = (config: AlertConfig) => setAlert(config);
  const hideAlert = () => setAlert(null);

  // Automatically close alert after 3 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AlertComponent alert={alert} onClose={hideAlert} />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used within AlertProvider");
  return ctx;
}

// The actual alert UI
function AlertComponent({
  alert,
  onClose,
}: {
  alert: AlertConfig | null;
  onClose: () => void;
}) {
  if (!alert) return null;

  let color = "bg-blue-500";
  if (alert.status === "success") color = "bg-green-500";
  if (alert.status === "error") color = "bg-red-500";
  if (alert.status === "loading") color = "bg-yellow-500";

  return (
    <div
      className={`${color} fixed top-5 right-5 px-6 py-3 rounded-xl shadow-lg text-sm font-medium text-white z-50 flex items-center gap-2`}
    >
      {alert.status === "loading" && (
        <span className="animate-spin mr-2">⏳</span>
      )}
      {alert.message}
    </div>
  );
}
