import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Chip,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import LightModeIcon from "@mui/icons-material/LightMode";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import { useRef, useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import AppSnackbar from "../Snackbar/snackbar";
import DocumentChat from "../Chat/chat";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

export default function HomeWrapper() {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    try {
      return (localStorage.getItem("mode") as "light" | "dark") ?? "dark";
    } catch {
      return "dark";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("mode", mode);
    } catch {
      // Ignore storage errors
    }
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                background: { default: "#f9fafb", paper: "#ffffff" },
                text: { primary: "#111", secondary: "#555" },
              }
            : {
                background: { default: "#0a0f1e", paper: "#0f1829" },
                text: { primary: "#f1f5f9", secondary: "#94a3b8" },
              }),
        },
        shape: { borderRadius: 12 },
      }),
    [mode],
  );

  const user = JSON.parse(localStorage.getItem("user") || "null");
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Home mode={mode} setMode={setMode} userId={user?._id} />
    </ThemeProvider>
  );
}

function Home({
  mode,
  setMode,
}: {
  mode: "light" | "dark";
  setMode: (m: "light" | "dark") => void;
  userId?: string;
}) {
  const leftRef = useRef<HTMLInputElement>(null);
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "info" | "warning",
  });
  const [showChat, setShowChat] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [existingSession, setExistingSession] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("lastSessionId");
    if (saved) {
      setExistingSession(saved);
    }
    setExistingSession(saved);
  }, [showChat]);

  if (showChat && sessionId)
    return (
      <DocumentChat
        sessionId={sessionId}
        setShowChat={setShowChat}
        setSessionId={setSessionId}
      />
    );

  const isDark = mode === "dark";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isDark ? "#0a0f1e" : "#f9fafb",
        px: 2,
        position: "relative",
        overflow: "hidden",
        "@keyframes driftA": {
          from: { transform: "translate(0,0)" },
          to: { transform: "translate(40px,30px)" },
        },
        "@keyframes driftB": {
          from: { transform: "translate(0,0)" },
          to: { transform: "translate(-30px,-40px)" },
        },
      }}
    >
      {/* Background orbs — dark only */}
      {isDark && (
        <>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
              backgroundSize: "60px 60px",
              pointerEvents: "none",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              width: 600,
              height: 600,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(30,100,180,0.18) 0%,transparent 70%)",
              top: -150,
              left: -100,
              animation: "driftA 12s ease-in-out infinite alternate",
              pointerEvents: "none",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              width: 500,
              height: 500,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(14,165,233,0.1) 0%,transparent 70%)",
              bottom: -100,
              right: -80,
              animation: "driftB 15s ease-in-out infinite alternate",
              pointerEvents: "none",
            }}
          />
        </>
      )}

      <Box
        sx={{ maxWidth: 760, width: "100%", position: "relative", zIndex: 1 }}
      >
        {/* Top bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "10px",
                background: "linear-gradient(135deg,#0ea5e9,#3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isDark ? "0 0 18px rgba(14,165,233,0.35)" : "none",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3L20 7.5V12C20 16.5 16.5 20.5 12 21C7.5 20.5 4 16.5 4 12V7.5L12 3Z"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 12L11 14L15 10"
                  stroke="white"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Box>
            <Typography
              sx={{
                fontFamily: "'Sora',sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: isDark ? "#f0f6ff" : "#0f172a",
              }}
            >
              DocuChat
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {["AI-Powered", "PDF Only"].map((l) => (
              <Chip
                key={l}
                label={l}
                size="small"
                sx={{
                  background: "rgba(14,165,233,0.08)",
                  border: "1px solid rgba(14,165,233,0.15)",
                  color: "#60c2f7",
                  fontSize: 11,
                  fontWeight: 500,
                  height: 24,
                }}
              />
            ))}
            <IconButton
              size="small"
              onClick={() => setMode(mode === "light" ? "dark" : "light")}
              sx={{ ml: 1, color: isDark ? "#7a93b2" : "#555" }}
            >
              <LightModeIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            sx={{
              fontFamily: "'Sora',sans-serif",
              fontSize: { xs: 28, md: 38 },
              fontWeight: 700,
              color: isDark ? "#f0f6ff" : "#0f172a",
              letterSpacing: "-0.5px",
              lineHeight: 1.2,
              mb: 1.5,
              textAlign: "center",
            }}
          >
            Ask anything about your{" "}
            <Box
              component="span"
              sx={{
                background: "linear-gradient(90deg,#60c2f7,#818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              documents
            </Box>
          </Typography>
          <Typography
            sx={{
              fontSize: 15,
              color: isDark ? "#7a93b2" : "#555",
              lineHeight: 1.7,
              textAlign: "center",
              maxWidth: 560,
              mx: "auto",
              mb: 5,
            }}
          >
            Upload a PDF and start chatting with it. AI understands your
            document, finds relevant context, and gives precise answers in
            seconds.
          </Typography>
        </motion.div>

        {/* Upload card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <UploadCard
            title="Primary Document"
            inputRef={leftRef}
            file={primaryFile}
            onFileChange={setPrimaryFile}
            isDark={isDark}
          />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              disabled={!primaryFile || loading}
              sx={{
                px: 6,
                py: 1.6,
                fontWeight: 600,
                fontSize: 15,
                borderRadius: "14px",
                background: "linear-gradient(135deg,#0ea5e9,#3b82f6)",
                boxShadow: isDark ? "0 4px 20px rgba(14,165,233,0.3)" : "none",
                textTransform: "none",
                "&:hover": {
                  background: "linear-gradient(135deg,#38bdf8,#6366f1)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 8px 28px rgba(14,165,233,0.38)",
                },
                "&:disabled": {
                  background: isDark ? "rgba(255,255,255,0.06)" : undefined,
                  color: isDark ? "#3d5570" : undefined,
                },
                transition: "all 0.25s",
              }}
              onClick={async () => {
                if (!primaryFile) return;
                setLoading(true);
                try {
                  const formData = new FormData();
                  const newSessionId = crypto.randomUUID();

                  // Get userId from localStorage
                  const user = JSON.parse(
                    localStorage.getItem("user") || "null",
                  );
                  const userId = user?._id;

                  if (!userId) {
                    setSnack({
                      open: true,
                      message: "User authentication failed",
                      severity: "error",
                    });
                    setLoading(false);
                    return;
                  }

                  formData.append("sessionId", newSessionId);
                  formData.append("userId", userId);
                  formData.append("inputFile", primaryFile);

                  const res = await fetch("http://localhost:5000/jobs/upload", {
                    method: "POST",
                    body: formData,
                  });

                  if (res.ok) {
                    setSnack({
                      open: true,
                      message: "Upload successful",
                      severity: "success",
                    });

                    // Process the job
                    const processRes = await fetch(
                      `http://localhost:5000/jobs/process/${newSessionId}`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ userId }),
                      },
                    );

                    if (!processRes.ok) {
                      throw new Error("Processing failed");
                    }

                    await new Promise((r) => setTimeout(r, 2500));
                    localStorage.setItem("lastSessionId", newSessionId);
                    setExistingSession(newSessionId);

                    setSessionId(newSessionId);
                    setShowChat(true);
                  } else {
                    const error = await res.json();
                    setSnack({
                      open: true,
                      message: error.message || "Upload failed",
                      severity: "error",
                    });
                  }
                } catch (err) {
                  console.error("Upload error:", err);
                  setSnack({
                    open: true,
                    message:
                      err instanceof Error ? err.message : "Upload failed",
                    severity: "error",
                  });
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "Processing…" : "Process Files →"}
            </Button>
          </Box>
          {existingSession && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="outlined"
                sx={{
                  px: 4,
                  py: 1.2,
                  borderRadius: "12px",
                  textTransform: "none",
                  borderColor: "rgba(14,165,233,0.4)",
                  color: "#60c2f7",
                  "&:hover": {
                    borderColor: "#60c2f7",
                    background: "rgba(14,165,233,0.08)",
                  },
                }}
                onClick={() => {
                  setSessionId(existingSession);
                  setShowChat(true);
                }}
              >
                Continue previous chat
              </Button>
            </Box>
          )}

          {/* Trust row */}
          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 3 }}
          >
            {["PDF supported", "Data never stored", "Instant results"].map(
              (t) => (
                <Typography
                  key={t}
                  sx={{
                    fontSize: 12,
                    color: isDark ? "#3d5570" : "#999",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.7,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: isDark ? "#1e4a6e" : "#ccc",
                      display: "inline-block",
                    }}
                  />
                  {t}
                </Typography>
              ),
            )}
          </Box>
        </motion.div>
      </Box>

      <AppSnackbar
        open={snack.open}
        message={snack.message}
        severity={snack.severity}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      />
    </Box>
  );
}

type UploadCardProps = {
  title: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  file: File | null;
  onFileChange: (f: File | null) => void;
  isDark: boolean;
};

function UploadCard({
  title,
  inputRef,
  file,
  onFileChange,
  isDark,
}: UploadCardProps) {
  const [dragging, setDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.type !== "application/pdf") {
      onFileChange(null);
      e.target.value = "";
      return;
    }
    onFileChange(selected);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type === "application/pdf") onFileChange(f);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        p: 5,
        textAlign: "center",
        borderRadius: "20px",
        border: `1px dashed ${file ? "rgba(34,197,94,0.5)" : dragging ? "rgba(14,165,233,0.6)" : "rgba(99,179,237,0.18)"}`,
        background: isDark
          ? file
            ? "rgba(34,197,94,0.05)"
            : dragging
              ? "rgba(14,165,233,0.06)"
              : "rgba(15,22,40,0.6)"
          : file
            ? "rgba(34,197,94,0.04)"
            : "#fff",
        backdropFilter: isDark ? "blur(16px)" : "none",
        cursor: file ? "default" : "pointer",
        boxShadow: isDark
          ? "0 0 0 1px rgba(255,255,255,0.03) inset, 0 20px 60px rgba(0,0,0,0.4)"
          : "0 4px 24px rgba(0,0,0,0.06)",
        transition: "all 0.25s ease",
        "&:hover": !file
          ? {
              borderColor: "rgba(14,165,233,0.5)",
              transform: "translateY(-2px)",
              boxShadow: isDark
                ? "0 12px 40px rgba(14,165,233,0.1)"
                : "0 8px 32px rgba(0,0,0,0.1)",
            }
          : {},
      }}
      onClick={() => !file && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {file ? (
        <>
          <InsertDriveFileIcon
            sx={{ fontSize: 44, mb: 1.5, color: "success.main" }}
          />
          <Typography
            variant="h6"
            fontWeight={600}
            noWrap
            sx={{ color: isDark ? "#f0f6ff" : "#111" }}
          >
            {file.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: isDark ? "#7a93b2" : "#666", mt: 0.5 }}
          >
            {(file.size / 1024).toFixed(1)} KB
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onFileChange(null);
            }}
            sx={{
              mt: 1.5,
              color: "error.main",
              background: "rgba(239,68,68,0.08)",
              "&:hover": { background: "rgba(239,68,68,0.15)" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </>
      ) : (
        <>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "16px",
              background: isDark
                ? "rgba(14,165,233,0.1)"
                : "rgba(14,165,233,0.08)",
              border: "1px solid rgba(14,165,233,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2.5,
            }}
          >
            <UploadFileIcon sx={{ fontSize: 30, color: "#0ea5e9" }} />
          </Box>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              color: isDark ? "#f0f6ff" : "#111",
              fontFamily: "'Sora',sans-serif",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: isDark ? "#7a93b2" : "#777", mt: 1 }}
          >
            Click to upload or drag & drop
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: isDark ? "#3d5570" : "#aaa",
              display: "block",
              mt: 0.5,
            }}
          >
            PDF files only
          </Typography>
        </>
      )}
      <input
        type="file"
        accept="application/pdf"
        hidden
        ref={inputRef}
        onChange={handleChange}
      />
    </Paper>
  );
}
