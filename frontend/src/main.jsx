import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PwaProvider } from "./context/PwaContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <PwaProvider>
          <Toaster position="top-right" reverseOrder={false} />
          <App />
        </PwaProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);