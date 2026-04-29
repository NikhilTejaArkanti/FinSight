import { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Container,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Chip,
} from "@mui/material";
import {
  Send,
  LightMode,
  DarkMode,
  ContentCopy,
  AttachFile,
  Close,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function DocumentChat({
  sessionId,
  setShowChat,
  setSessionId,
}: {
  sessionId: string;
  setShowChat: (v: boolean) => void;
  setSessionId: (v: string | null) => void;
}) {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDark = mode === "dark";

  const theme = createTheme({
    palette: {
      mode,
      ...(isDark
        ? {
            background: { default: "#0a0f1e", paper: "#0f1829" },
            text: { primary: "#f1f5f9", secondary: "#94a3b8" },
          }
        : {
            background: { default: "#f9fafb", paper: "#ffffff" },
            text: { primary: "#111", secondary: "#555" },
          }),
    },
    shape: { borderRadius: 12 },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isAnimating) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isAnimating]);

  // CORRECT LOGIC (with userId)
  async function queryDocument(sessionId: string, query: string) {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const userId = user?._id;

    if (!userId) {
      throw new Error("User authentication failed");
    }

    const res = await fetch(`http://localhost:5000/jobs/query/${sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, userId }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Query failed");
    }

    return res.json();
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;

    setMessages((p) => [...p, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const data = await queryDocument(sessionId, userMessage);

      setMessages((p) => [...p, { role: "assistant", content: data.answer }]);
    } catch {
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "Error fetching answer" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };
  const promptMap: Record<string, string> = {
    Summarize: "Provide a concise and clear summary of this document.",
    "Key points":
      "List the key points and important insights from this document in a structured format.",
    Dates:
      "Extract all important dates mentioned in this document along with their context or events.",
  };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onAnimationComplete={() => setIsAnimating(false)}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
          {/* HEADER */}
          <Box
            sx={{
              px: 3,
              py: 2,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  onClick={() => {
                    if (messages.length > 0) {
                      const confirmLeave = window.confirm("Leave chat?");
                      if (!confirmLeave) return;
                    }
                    setShowChat(false);
                    setSessionId(null);
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Box>
              <Typography
                fontWeight="bold"
                sx={{
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                DocuChat
              </Typography>
            </Box>

            <IconButton
              disableRipple
              onClick={() => setMode(mode === "dark" ? "light" : "dark")}
              sx={{
                p: 1,
                background: "transparent",
                "&:hover": { background: "transparent" },
              }}
            >
              {isDark ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Box>

          {/* MESSAGES */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
            <Container maxWidth="md">
              {messages.length === 0 ? (
                <Box textAlign="center" mt={10}>
                  <Typography variant="h5">
                    Ask anything about your document
                  </Typography>

                  <Box
                    mt={3}
                    display="flex"
                    gap={1}
                    flexWrap="wrap"
                    justifyContent="center"
                  >
                    {Object.keys(promptMap).map((label) => (
                      <Chip
                        key={label}
                        label={label}
                        onClick={() => setInput(promptMap[label])}
                      />
                    ))}
                  </Box>
                </Box>
              ) : (
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent:
                            msg.role === "user" ? "flex-end" : "flex-start",
                          mb: 2,
                        }}
                      >
                        <Box sx={{ maxWidth: "75%", position: "relative" }}>
                          <Paper sx={{ p: 2 }}>
                            <Typography>{msg.content}</Typography>
                          </Paper>

                          {msg.role === "assistant" && (
                            <IconButton
                              size="small"
                              onClick={() => copy(msg.content, i)}
                              sx={{ position: "absolute", right: -36, top: 4 }}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          )}

                          {copied === i && (
                            <Typography fontSize={12}>Copied!</Typography>
                          )}
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {loading && <Typography>Thinking...</Typography>}

              <div ref={messagesEndRef} />
            </Container>
          </Box>

          {/* INPUT */}
          <Box sx={{ p: 2 }}>
            <Container maxWidth="md">
              {file && (
                <Chip
                  label={file.name}
                  onDelete={() => setFile(null)}
                  deleteIcon={<Close />}
                  icon={<AttachFile />}
                  sx={{ mb: 1 }}
                />
              )}

              <Box sx={{ display: "flex", gap: 1 }}>
                <input
                  type="file"
                  hidden
                  id="file-upload"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />

                {/* <label htmlFor="file-upload">
                  <IconButton component="span">
                    <AttachFile />
                  </IconButton>
                </label> */}

                <TextField
                  fullWidth
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />

                <IconButton onClick={handleSend}>
                  <Send />
                </IconButton>
              </Box>
            </Container>
          </Box>
        </Box>
      </motion.div>
    </ThemeProvider>
  );
}
