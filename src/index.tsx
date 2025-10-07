import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadingScreen } from "./screens/LoadingScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { ToastProvider } from "./lib/toast";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/dashboard" element={<LoadingScreen />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </StrictMode>
);
