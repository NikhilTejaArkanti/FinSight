import { Navigate } from "react-router-dom";
import type { JSX } from "react/jsx-runtime";
import { useState } from "react";
import AppSnackbar from "../Snackbar/snackbar";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error" as "error" | "success" | "info" | "warning",
  });

  let user = null;
  let errorMessage = "";

  try {
    const userData = localStorage.getItem("user");

    if (!userData) {
      errorMessage =
        "Session expired. User data not found. Please login again.";
    } else {
      user = JSON.parse(userData);

      if (!user || !user._id) {
        errorMessage =
          "Invalid user data. User ID is missing. Please login again.";
      } else {
        console.log("User data loaded successfully:", user);
      }
    }
  } catch (err) {
    errorMessage = `Failed to parse user data: ${err instanceof Error ? err.message : "Unknown error"}`;
  }

  if (errorMessage) {
    if (!snackbar.open) {
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
    return (
      <>
        <AppSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        />
        <Navigate to="/login" replace />
      </>
    );
  }

  return children;
};

export default ProtectedRoute;
