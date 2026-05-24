import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id?: number;
  username: string;
  email: string;
}

export default function Menu() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Obtener usuario guardado en login
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Si no hay usuario, regresar al login
      navigate("/login");
    }
  }, []);

  function logout() {
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div style={styles.container}>
      <div style={styles.backgroundCircle}></div>

      <div style={styles.card}>
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.avatar}>🐰</div>

          <h1 style={styles.title}>Menú Principal</h1>

          <p style={styles.subtitle}>
            Bienvenido al mundo Activamente ✨
          </p>
        </div>

        {/* INFO USUARIO */}
        <div style={styles.userCard}>
          <h3 style={styles.userTitle}>🌸 Información del usuario</h3>

          <p style={styles.userText}>
            <strong>Usuario:</strong>{" "}
            {user?.username || "Invitado"}
          </p>

          <p style={styles.userText}>
            <strong>Correo:</strong>{" "}
            {user?.email || "Sin correo"}
          </p>
        </div>

        {/* JUEGOS */}
        <div style={styles.gamesContainer}>
          <h3 style={styles.gamesTitle}>🎮 Selecciona un juego</h3>

          <button
            style={styles.gameButton}
            onClick={() => navigate("/patrones")}
          >
            🧩 Juego de Patrones
          </button>

          <button
            style={styles.gameButton}
            onClick={() => navigate("/memoria")}
          >
            🧠 Juego de Memoria
          </button>

          <button
            style={styles.gameButton}
            onClick={() => navigate("/reflejos")}
          >
            ⚡ Juego de Reflejos
          </button>
        </div>

        {/* LOGOUT */}
        <button style={styles.logoutButton} onClick={logout}>
          🚪 Cerrar sesión
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #FFE5EC 0%, #FFF1E6 45%, #E2F0CB 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "sans-serif",
    padding: "20px",
  },

  backgroundCircle: {
    position: "absolute",
    width: "600px",
    height: "600px",
    background: "rgba(255,255,255,0.25)",
    borderRadius: "50%",
    top: "-200px",
    right: "-150px",
    filter: "blur(40px)",
  },

  card: {
    width: "520px",
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(14px)",
    borderRadius: "32px",
    padding: "35px",
    boxShadow: "0 12px 35px rgba(0,0,0,0.12)",
    zIndex: 1,
  },

  header: {
    textAlign: "center",
    marginBottom: "25px",
  },

  avatar: {
    fontSize: "58px",
  },

  title: {
    color: "#5C5470",
    marginTop: "10px",
    marginBottom: "5px",
  },

  subtitle: {
    color: "#8A7F8D",
    fontSize: "14px",
  },

  userCard: {
    background: "#FFF9FB",
    padding: "18px",
    borderRadius: "20px",
    border: "2px solid #F8C8DC",
    marginBottom: "25px",
  },

  userTitle: {
    color: "#C77DFF",
    marginBottom: "12px",
  },

  userText: {
    color: "#5C5470",
    marginBottom: "8px",
    fontSize: "15px",
  },

  gamesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  gamesTitle: {
    color: "#5C5470",
    marginBottom: "8px",
  },

  gameButton: {
    padding: "15px",
    borderRadius: "18px",
    border: "none",
    background: "linear-gradient(135deg, #FFAFCC, #BDE0FE)",
    color: "#4A4453",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(205,180,219,0.4)",
    transition: "0.2s",
  },

  disabledButton: {
    padding: "15px",
    borderRadius: "18px",
    border: "none",
    background: "#F1F1F1",
    color: "#AAA",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "not-allowed",
  },

  logoutButton: {
    marginTop: "25px",
    width: "100%",
    padding: "13px",
    borderRadius: "16px",
    border: "none",
    background: "#FFE5EC",
    color: "#5C5470",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "15px",
  },
};