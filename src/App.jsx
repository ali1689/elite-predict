import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Predictions from "./pages/Predictions";
import Today from "./pages/Today";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/today"       element={<Today />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/login"       element={<Login />} />
          </Routes>
        </main>
        <Footer />
        <Analytics />
      </div>
    </AuthProvider>
  );
}
