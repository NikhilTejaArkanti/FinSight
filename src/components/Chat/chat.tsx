import { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Container,
  Chip,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import {
  Send,
  Brightness4,
  Brightness7,
  AttachFile,
  Close,
} from "@mui/icons-material";

export default function DocumentChat({ sessionId }: { sessionId: string }) {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const theme = createTheme({
    palette: {
      mode,
      ...(mode === "dark" && {
        background: { default: "#1a1f2e", paper: "#252b3b" },
        text: { primary: "#f1f5f9", secondary: "#94a3b8" },
      }),
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function queryDocument(sessionId: string, query: string) {
    // Get userId from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const userId = user?._id;

    if (!userId) {
      throw new Error("User authentication failed");
    }

    const res = await fetch(`http://localhost:5000/jobs/query/${sessionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const data = await queryDocument(sessionId, userMessage);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Error fetching answer",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* Header */}
        <Paper sx={{ px: 3, py: 2, borderRadius: 0 }} elevation={1}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight="bold">
                DocuChat
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Document Analysis Assistant
              </Typography>
            </Box>
            <IconButton
              onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            >
              {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Box>
        </Paper>

        {/* Messages */}
        <Box sx={{ flex: 1, overflowY: "auto", py: 4 }}>
          <Container maxWidth="md">
            {messages.length === 0 ? (
              <Box sx={{ textAlign: "center", mt: 15 }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Ask anything about your document
                </Typography>
                <Typography color="text.secondary">
                  Upload a file and start analyzing instantly
                </Typography>
              </Box>
            ) : (
              messages.map((msg, i) => (
                <Box
                  key={i}
                  sx={{
                    mb: 3,
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <Paper
                    sx={{
                      maxWidth: "75%",
                      px: 3,
                      py: 2,
                      borderRadius: 3,
                      ...(msg.role === "user" && {
                        bgcolor: "primary.main",
                        color: "white",
                      }),
                    }}
                    elevation={msg.role === "user" ? 0 : 1}
                  >
                    <Typography>{msg.content}</Typography>
                  </Paper>
                </Box>
              ))
            )}
            {loading && <Typography sx={{ mt: 1 }}>Thinking...</Typography>}
            <div ref={messagesEndRef} />
          </Container>
        </Box>

        {/* Input */}
        <Paper sx={{ p: 2, borderRadius: 0 }} elevation={3}>
          <Container maxWidth="md">
            {file && (
              <Chip
                label={file.name}
                icon={<AttachFile />}
                onDelete={() => setFile(null)}
                deleteIcon={<Close />}
                sx={{ mb: 2 }}
              />
            )}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <input
                type="file"
                id="file-upload"
                hidden
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="file-upload">
                <IconButton component="span">
                  <AttachFile />
                </IconButton>
              </label>
              <TextField
                fullWidth
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask a question about your document..."
                variant="outlined"
                size="small"
              />
              <IconButton
                onClick={handleSend}
                disabled={loading}
                color="primary"
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                <Send />
              </IconButton>
            </Box>
          </Container>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
