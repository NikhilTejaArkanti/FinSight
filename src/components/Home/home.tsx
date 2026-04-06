import { Box, Typography, Paper, Button, IconButton } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

import { useRef, useMemo, useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

export default function HomeWrapper() {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                background: {
                  default: "#f9fafb",
                  paper: "#ffffff",
                },
                text: {
                  primary: "#111",
                  secondary: "#555",
                },
              }
            : {
                background: {
                  default: "#0f172a",
                  paper: "#1e293b",
                },
                text: {
                  primary: "#f1f5f9",
                  secondary: "#94a3b8",
                },
              }),
        },
        shape: {
          borderRadius: 12,
        },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Home mode={mode} setMode={setMode} />
    </ThemeProvider>
  );
}

function Home({
  mode,
  setMode,
}: {
  mode: "light" | "dark";
  setMode: (m: "light" | "dark") => void;
}) {
  const leftRef = useRef<HTMLInputElement>(null);
  const rightRef = useRef<HTMLInputElement>(null);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 900,
          width: "100%",
          p: 4,
          textAlign: "center",
        }}
      >
        {/* 🌙 Toggle */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <IconButton
            onClick={() => setMode(mode === "light" ? "dark" : "light")}
          >
            {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Box>

        {/* 🔝 Title */}
        <Typography variant="h4" fontWeight={700}>
          FinSight
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mt: 1,
            maxWidth: 600,
            mx: "auto",
            lineHeight: 1.6,
          }}
        >
          Upload your financial documents and let AI extract, clean, and
          structure your data instantly accoridng to your desired file format.
        </Typography>

        {/* 📦 Upload Section */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            mt: 5,
            flexWrap: "wrap",
          }}
        >
          <UploadCard title="Primary Document" inputRef={leftRef} />
          <UploadCard title="Supporting Document" inputRef={rightRef} />
        </Box>

        {/* 🚀 Submit */}
        <Box sx={{ mt: 5 }}>
          <Button
            variant="contained"
            size="large"
            sx={{
              px: 5,
              py: 1.5,
              fontWeight: 600,
            }}
          >
            Process Files
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

type UploadCardProps = {
  title: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

function UploadCard({ title, inputRef }: UploadCardProps) {
  return (
    <Paper
      elevation={3}
      sx={{
        flex: 1,
        minWidth: 300,
        p: 4,
        textAlign: "center",
        borderRadius: 3,
        border: "2px dashed",
        borderColor: "divider",
        cursor: "pointer",
        transition: "all 0.25s ease",
        "&:hover": {
          borderColor: "primary.main",
          transform: "translateY(-4px)",
        },
      }}
      onClick={() => inputRef.current?.click()}
    >
      <UploadFileIcon
        sx={{
          fontSize: 42,
          mb: 1.5,
          color: "primary.main",
        }}
      />

      <Typography variant="h6" fontWeight={600}>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Click to upload or drag & drop
      </Typography>

      <input type="file" hidden ref={inputRef} />
    </Paper>
  );
}
