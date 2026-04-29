import { Box, Button, Typography, Chip } from "@mui/material";
import { motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AppSnackbar from "../Snackbar/snackbar";

const orb = (
  size: number,
  top: string,
  left: string,
  color: string,
  delay: number,
) => ({
  position: "absolute" as const,
  width: size,
  height: size,
  borderRadius: "50%",
  background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
  top,
  left,
  animation: `drift${delay} ${10 + delay * 2}s ease-in-out infinite alternate`,
  pointerEvents: "none" as const,
});

const LoginPage = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error" as "error" | "success" | "info" | "warning",
  });

  // Google login
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch("http://localhost:5000/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: tokenResponse.access_token,
          }),
        });

        if (!res.ok) {
          throw new Error("Authentication failed");
        }

        const data = await res.json();
        console.log("[LOGIN] Google auth response:", data);
        console.log("[LOGIN] User object to store:", data.user);

        // Store user data
        const userString = JSON.stringify(data.user);
        console.log("[LOGIN] Storing user string:", userString);
        localStorage.setItem("user", userString);
        localStorage.setItem("userId", data.user._id);

        // Verify storage
        const storedUser = localStorage.getItem("user");
        console.log("[LOGIN] Verified stored user:", storedUser);
        console.log("[LOGIN] About to navigate to /home");

        // Navigate to home with userId
        navigate(`/home`);
        console.log("[LOGIN] Navigation called");
      } catch (err) {
        console.error(err);
        setSnackbar({
          open: true,
          message: "Login failed. Please try again.",
          severity: "error",
        });
      }
    },

    onError: () => {
      setSnackbar({
        open: true,
        message: "Google login failed",
        severity: "error",
      });
    },
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0f1e",
        overflow: "hidden",
        position: "relative",
        p: 2,
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
      {/* Background */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <Box
        sx={{
          ...orb(600, "-150px", "-100px", "rgba(30,100,180,0.18)", 0),
          animation: "driftA 12s ease-in-out infinite alternate",
        }}
      />
      <Box
        sx={{
          ...orb(500, "auto", "auto", "rgba(14,165,233,0.12)", 1),
          bottom: "-100px",
          right: "-80px",
          background:
            "radial-gradient(circle,rgba(14,165,233,0.12) 0%,transparent 70%)",
          animation: "driftB 15s ease-in-out infinite alternate",
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <Box
          sx={{
            width: 440,
            maxWidth: "100%",
            background: "rgba(15,22,40,0.75)",
            border: "1px solid rgba(99,179,237,0.12)",
            borderRadius: "24px",
            p: "48px 44px 44px",
            backdropFilter: "blur(24px)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.03) inset, 0 32px 80px rgba(0,0,0,0.6)",
          }}
        >
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 4 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: "linear-gradient(135deg,#0ea5e9,#3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(14,165,233,0.35)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
                fontSize: 20,
                fontWeight: 700,
                color: "#f0f6ff",
                letterSpacing: "-0.3px",
              }}
            >
              DocuChat
            </Typography>
          </Box>

          <Box
            sx={{
              height: 1,
              background:
                "linear-gradient(90deg,transparent,rgba(99,179,237,0.2),transparent)",
              mb: 4,
            }}
          />

          {/* Badges */}
          <Box sx={{ display: "flex", gap: 1, mb: 3.5 }}>
            {["AI-Powered", "SOC 2 Secure"].map((label) => (
              <Chip
                key={label}
                label={label}
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
          </Box>

          {/* Heading */}
          <Typography
            sx={{
              fontFamily: "'Sora',sans-serif",
              fontSize: 24,
              fontWeight: 700,
              color: "#f0f6ff",
              letterSpacing: "-0.5px",
              lineHeight: 1.2,
              mb: 1.2,
            }}
          >
            {/* Chat with your documents */}
            <br />
            Understand any document{" "}
            <Box
              component="span"
              sx={{
                background: "linear-gradient(90deg,#60c2f7,#818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              instantly
            </Box>
          </Typography>
          <Typography
            sx={{ fontSize: 14, color: "#7a93b2", lineHeight: 1.6, mb: 4.5 }}
          >
            Upload any document and ask questions get clear answers in seconds
          </Typography>

          {/* Google */}
          <Button
            fullWidth
            onClick={() => googleLogin()}
            sx={{
              display: "flex",
              gap: 1.5,
              py: 1.7,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px",
              color: "#e2eaf4",
              textTransform: "none",
              fontSize: 15,
              fontWeight: 500,
              transition: "all 0.25s",
              justifyContent: "center",
              "&:hover": {
                borderColor: "rgba(14,165,233,0.35)",
                background: "rgba(255,255,255,0.07)",
                transform: "translateY(-1px)",
                boxShadow: "0 8px 24px rgba(14,165,233,0.12)",
              },
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Trust */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 3,
              mt: 3.5,
              pt: 3,
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {["AI-powered insights", "No credit card required"].map((t) => (
              <Typography
                key={t}
                sx={{
                  fontSize: 11.5,
                  color: "#3d5570",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.6,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#1e4a6e",
                    display: "inline-block",
                  }}
                />
                {t}
              </Typography>
            ))}
          </Box>
        </Box>
      </motion.div>

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default LoginPage;
