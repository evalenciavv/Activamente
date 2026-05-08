import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/login";
import Register from "./components/register";
import Patrones from "./components/patrones";
import Menu from "./components/menu";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Rutas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/patrones" element={<Patrones />} />
        <Route path="/menu" element={<Menu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;