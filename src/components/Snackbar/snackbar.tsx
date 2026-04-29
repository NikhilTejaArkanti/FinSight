import React from "react";
import { Snackbar, Alert } from "@mui/material";

type Severity = "success" | "error" | "info" | "warning";

type Props = {
  open: boolean;
  message: string;
  severity?: Severity;
  onClose: () => void;
};

export default function AppSnackbar({
  open,
  message,
  severity = "info",
  onClose,
}: Props) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
