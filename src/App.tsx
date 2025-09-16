// src/App.tsx
import { AuthProvider } from "@/context/AuthProvider";
import { ProjectsProvider } from "@/context/ProjectsProvider";
import AppRoutes from "./AppRoutes";
import { Toaster } from "react-hot-toast";
import ChatWidget from "./components/ChatWidget";


export default function App() {
  return (
    <AuthProvider>
      <ProjectsProvider>
        <AppRoutes />
        <Toaster position="top-right" />
        <ChatWidget /> {/* ✅ chatbot flottant */}
      </ProjectsProvider>
    </AuthProvider>
  );
}
