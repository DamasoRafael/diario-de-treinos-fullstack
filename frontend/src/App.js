import React from "react";

// 1. Importando os componentes da rota e as suas páginas
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";

// 2. importando novos componentes (dashboard e protectedroute)
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoutes";

function App() {
  return (
    // 2. Definindo as rotas publicas
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Rota Padrão (Ex: Home) - Por enquanto, vamos redirecionar para o login */}
      <Route path="/" element={<Login />} />

      {/* Rota Protegida */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
