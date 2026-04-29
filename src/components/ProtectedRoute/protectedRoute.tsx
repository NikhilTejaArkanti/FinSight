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
    console.log("[PROTECTED_ROUTE] Checking authentication...");
    const userData = localStorage.getItem("user");
    console.log("[PROTECTED_ROUTE] Raw userData from storage:", userData);

    if (!userData) {
      errorMessage =
        "Session expired. User data not found. Please login again.";
      console.log("[PROTECTED_ROUTE] No user data in storage");
    } else {
      user = JSON.parse(userData);
      console.log("[PROTECTED_ROUTE] Parsed user object:", user);
      console.log("[PROTECTED_ROUTE] User _id:", user?._id);

      if (!user || !user._id) {
        errorMessage =
          "Invalid user data. User ID is missing. Please login again.";
        console.log("[PROTECTED_ROUTE] User or _id is missing");
      } else {
        console.log("[PROTECTED_ROUTE] Authentication passed ✓");
      }
    }
  } catch (err) {
    errorMessage = `Failed to parse user data: ${err instanceof Error ? err.message : "Unknown error"}`;
    console.error("[PROTECTED_ROUTE] Error parsing user data:", err);
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
