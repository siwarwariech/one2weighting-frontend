// src/AppRoutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import TargetUpload from "@/pages/Dashboard/TargetUpload";   // ⬅️ new import
import Weighting from "@/pages/Dashboard/Weighting";
import Home              from "@/pages/Home";
import SignIn            from "@/pages/Auth/SignIn";
import SignUp            from "@/pages/Auth/SignUp";
import ForgotPassword    from "@/pages/Auth/ForgotPassword";
import Chatbot           from "@/pages/Chatbot";

import ProtectedRoute    from "@/components/ProtectedRoute";
import DashboardLayout   from "@/components/Layout/DashboardLayout";

import MyProjects        from "@/pages/Dashboard/MyProjects";
import NewProject        from "@/pages/Dashboard/NewProject";
import ProjectProcessing from "@/pages/Dashboard/ProjectProcessing";
import { ProjectsProvider } from "@/context/ProjectsProvider";
import SelectVariables from "./pages/Dashboard/SelectVariables";
import RapportWeighted from "./pages/Dashboard/RapportWeighted";
import ResetPassword from "@/pages/Auth/ResetPassword"; // Ajoutez cette importation
import CompletionPage from "@/pages/Dashboard/CompletionPage"; // Ajoutez cette importation


export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------- Public ---------- */}
      <Route path="/"               element={<Home />} />
      <Route path="/signin"         element={<SignIn />} />
      <Route path="/signup"         element={<SignUp />} />
      <Route path="/forgot-password"element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} /> {/* Ajoutez cette route */}

      <Route path="/chatbot"        element={<Chatbot />} />

      {/* ---------- Protected dashboard ---------- */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={
            <ProjectsProvider>
              <DashboardLayout />
            </ProjectsProvider>
          }
        >
             <Route index                element={<MyProjects />} />
             <Route path="project/new"   element={<NewProject />} />
   
            
            <Route path="project/:id/upload" element={<ProjectProcessing />} />
            <Route path="project/:id/variables" element={<SelectVariables />} />
            <Route path="project/:id/targets" element={<TargetUpload />} />
            <Route path="project/:id/weighting" element={<Weighting />} />
            <Route path="/dashboard/project/:id/rapport-weighted" element={<RapportWeighted />} />
            <Route path="project/:id/completion" element={<CompletionPage />} /> {/* Ajoutez cette route */}


            





          
        </Route>
      </Route>

      {/* ---------- 404 ---------- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
