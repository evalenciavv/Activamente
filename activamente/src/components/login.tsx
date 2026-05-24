import { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

interface LoginForm {
    email: string;
    password: string;
}

export default function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<LoginForm>({
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

        try {
            const response = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            console.log("login response:", data);

            if (data.message === "Login exitoso") {
                localStorage.setItem("user", JSON.stringify(data.user));
                navigate("/menu");
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.cardDecoration}></div>

            <form style={styles.form} onSubmit={handleSubmit}>
                <div style={styles.header}>
                    <span style={styles.emoji}>🐰</span>
                    <h2 style={styles.title}>Iniciar Sesión</h2>
                    <p style={styles.subtitle}>
                        Bienvenido al mundo de Acticamente ✨
                    </p>
                </div>

                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Correo electrónico"
                    style={styles.input}
                    required
                />

                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Contraseña"
                    style={styles.input}
                    required
                />

                <button type="submit" style={styles.button}>
                    Entrar 🎮
                </button>

                <p style={styles.footerText}>
                    ¿No tienes cuenta?{" "}
                    <Link to="/register" style={styles.link}>
                        Regístrate
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
        overflow: "hidden",
        position: "relative",
    },

    cardDecoration: {
        position: "absolute",
        width: "500px",
        height: "500px",
        background: "rgba(255,255,255,0.25)",
        borderRadius: "50%",
        top: "-150px",
        right: "-120px",
        filter: "blur(30px)",
    },

    form: {
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        padding: "42px",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        borderRadius: "28px",
        width: "360px",
        boxShadow: "0 10px 35px rgba(0,0,0,0.12)",
        border: "2px solid rgba(255,255,255,0.7)",
        zIndex: 1,
    },

    header: {
        textAlign: "center",
        marginBottom: "10px",
    },

    emoji: {
        fontSize: "48px",
    },

    title: {
        color: "#5C5470",
        marginTop: "10px",
        marginBottom: "5px",
        fontSize: "28px",
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
        transition: "0.3s",
        color: "#5C5470",
    },

    button: {
        padding: "14px",
        border: "none",
        borderRadius: "16px",
        background: "linear-gradient(135deg, #FFAFCC, #CDB4DB)",
        color: "#4A4453",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "16px",
        transition: "0.3s",
        boxShadow: "0 6px 14px rgba(205,180,219,0.4)",
    },

    footerText: {
        textAlign: "center",
        color: "#7C6F7B",
        fontSize: "14px",
        marginTop: "5px",
    },

    link: {
        color: "#C77DFF",
        fontWeight: "bold",
        cursor: "pointer",
    },
};