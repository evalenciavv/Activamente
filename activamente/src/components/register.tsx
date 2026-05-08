import { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";


interface RegisterForm {
  username: string;
  email: string;
  password: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("📤 Enviando registro:", formData);

    try {
      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      console.log("📩 Respuesta backend:", data);

      if (data.message === "Usuario registrado correctamente") {
        alert("🎉 Usuario creado correctamente");

        // limpiar formulario
        setFormData({
          username: "",
          email: "",
          password: "",
        });
        navigate("/login");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("❌ Error registro:", error);
      alert("Error conectando con el servidor");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.cardDecoration}></div>

      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.header}>
          <span style={styles.emoji}>🐻‍❄️</span>
          <h2 style={styles.title}>Crear cuenta</h2>
          <p style={styles.subtitle}>Únete al mundo Chiikawa ✨</p>
        </div>

        <input
          type="text"
          name="username"
          placeholder="Usuario"
          value={formData.username}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button}>
          Registrarse 🌸
        </button>

        <p style={styles.footerText}>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" style={styles.link}>
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #FFE5EC 0%, #FFF1E6 40%, #E2F0CB 100%)",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },

  cardDecoration: {
    position: "absolute",
    width: "520px",
    height: "520px",
    background: "rgba(255,255,255,0.25)",
    borderRadius: "50%",
    top: "-180px",
    left: "-150px",
    filter: "blur(35px)",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "42px",
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(14px)",
    borderRadius: "28px",
    width: "360px",
    boxShadow: "0 12px 35px rgba(0,0,0,0.12)",
    border: "2px solid rgba(255,255,255,0.6)",
    zIndex: 1,
  },

  header: {
    textAlign: "center",
    marginBottom: "10px",
  },

  emoji: {
    fontSize: "46px",
  },

  title: {
    color: "#5C5470",
    fontSize: "26px",
    margin: "10px 0 5px",
    fontWeight: 700,
  },

  subtitle: {
    color: "#8A7F8D",
    fontSize: "14px",
  },

  input: {
    padding: "14px",
    borderRadius: "14px",
    border: "2px solid #F8C8DC",
    background: "#FFF9FB",
    fontSize: "15px",
    outline: "none",
    color: "#5C5470",
  },

  button: {
    padding: "14px",
    border: "none",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #FFAFCC, #BDE0FE)",
    color: "#4A4453",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(255,175,204,0.4)",
  },

  footerText: {
    textAlign: "center",
    color: "#7C6F7B",
    fontSize: "14px",
  },

  link: {
    color: "#A78BFA",
    fontWeight: "bold",
    cursor: "pointer",
    textDecoration: "none",
  },
};