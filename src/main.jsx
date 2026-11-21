import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Customer from "./pages/Customer.jsx";
import "./styles.css";

function RedirectToGoogle() {
  React.useEffect(() => {
    window.location.replace("https://search.google.com/local/writereview?placeid=ChIJ7bbz-CwBwTsReJz4vKgjBtY");
  }, []);
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "sans-serif" }}>
      <p>Redirecting to Google Review page...</p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/review" element={<RedirectToGoogle />} />
      <Route path="/:counter?" element={<Customer />} />
    </Routes>
  </BrowserRouter>
);
