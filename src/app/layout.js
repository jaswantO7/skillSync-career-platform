import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "SkillSync - Your AI Career Growth Companion",
  icons: {
    icon: "/favicon.ico", // ✅ ensures Next picks it
  },
  description:
    "Transform your career with AI-powered skill analysis, personalized learning roadmaps, and intelligent mentorship.",
  keywords:
    "career growth, AI mentor, skill development, learning roadmap, professional development",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <ProgressProvider>
              <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
                {children}
              </div>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  className:
                    "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                }}
              />
            </ProgressProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
