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

  // Animation variants for smooth staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // const messagesVariants = {
  //   hidden: { opacity: 0, y: 20 },
  //   visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.15 } },
  // };

  const inputVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.25 } },
  };

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

      {/* Main container orchestrates staggered child animations */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        onAnimationComplete={() => setIsAnimating(false)}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            justifyContent: "space-between",
            overflowY: "auto",
            scrollbarGutter: "stable overlay",
          }}
        >
          {/* HEADER - Animates first */}
          <motion.div variants={headerVariants}>
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
                      {Object.keys(promptMap).map((label, i) => (
                        <motion.div
                          key={label}
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                        >
                          <Chip
                            label={label}
                            onClick={() => setInput(promptMap[label])}
                          />
                        </motion.div>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <AnimatePresence>
                    {messages.map((msg, i) => (
                      <motion.div
                        key={`${msg.role}-${i}`} // Stable key prevents glitches
                        initial={{
                          opacity: 0,
                          x: msg.role === "user" ? 20 : -20,
                        }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                        transition={{ duration: 0.3 }}
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
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => copy(msg.content, i)}
                                  sx={{
                                    position: "absolute",
                                    right: -36,
                                    top: 4,
                                  }}
                                >
                                  <ContentCopy fontSize="small" />
                                </IconButton>
                              </motion.div>
                            )}

                            {copied === i && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                              >
                                <Typography fontSize={12}>Copied!</Typography>
                              </motion.div>
                            )}
                          </Box>
                        </Box>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Typography>Thinking...</Typography>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </Container>
            </Box>
          </motion.div>

          {/* INPUT - Animates last */}
          <motion.div variants={inputVariants}>
            <Box sx={{ p: 2 }}>
              <Container maxWidth="md">
                {file && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Chip
                      label={file.name}
                      onDelete={() => setFile(null)}
                      deleteIcon={<Close />}
                      icon={<AttachFile />}
                      sx={{ mb: 1 }}
                    />
                  </motion.div>
                )}

                <Box sx={{ display: "flex", gap: 1 }}>
                  <input
                    type="file"
                    hidden
                    id="file-upload"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />

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
                    disabled={loading}
                  />

                  <IconButton
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                  >
                    <Send />
                  </IconButton>
                </Box>
              </Container>
            </Box>
          </motion.div>
        </Box>
      </motion.div>
    </ThemeProvider>
  );
}
