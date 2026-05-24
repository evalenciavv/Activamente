import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/login";
import Register from "./components/register";
import Patrones from "./components/patrones";
import Memoria from "./components/memoria";
import Reflejos from "./components/reflejos";
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
        <Route path="/memoria" element={<Memoria />} />
        <Route path="/reflejos" element={<Reflejos />} />
        <Route path="/menu" element={<Menu />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;