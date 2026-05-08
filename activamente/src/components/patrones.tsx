import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const shapes = ["⬛", "⬜", "🔺", "🔵"];

export default function JuegoPatrones() {
  const navigate = useNavigate();

  const [pattern, setPattern] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [options, setOptions] = useState<string[]>([]);
  const [result, setResult] = useState<string>("");

  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(0);

  const [lives, setLives] = useState<number>(3);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [roundTime, setRoundTime] = useState<number>(20);

  // usuario logueado
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // id juego patrones
  const juegoId = 1;

  // =========================
  // INICIO
  // =========================
  useEffect(() => {
    generatePattern();
    fetchBestScore();
  }, []);

  // =========================
  // TIMER
  // =========================
  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          loseLifeByTime();
          return roundTime;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, roundTime]);

  // =========================
  // OBTENER MEJOR PUNTAJE
  // =========================
  async function fetchBestScore() {
    try {
      const response = await fetch(
        `http://localhost:8000/mejor_puntaje/${user.id}/${juegoId}`
      );

      const data = await response.json();

      setBestScore(data.mejor_puntaje || 0);
    } catch (error) {
      console.error("❌ Error obteniendo mejor puntaje:", error);
    }
  }

  // =========================
  // GUARDAR PUNTAJE
  // =========================
  async function saveScore(finalScore: number) {
    try {
      await fetch("http://localhost:8000/puntajes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: user.id,
          juego_id: juegoId,
          puntaje: finalScore,
        }),
      });

      fetchBestScore();
    } catch (error) {
      console.error("❌ Error guardando puntaje:", error);
    }
  }

  // =========================
  // GENERAR PATRÓN
  // =========================
  function generatePattern() {
    const baseLength = Math.floor(Math.random() * 2) + 2;

    const base: string[] = [];

    for (let i = 0; i < baseLength; i++) {
      base.push(shapes[Math.floor(Math.random() * shapes.length)]);
    }

    const fullPattern = [...base, ...base];

    setPattern(fullPattern);

    setCorrectAnswer(base[0]);

    generateOptions(base[0]);
  }

  // =========================
  // GENERAR OPCIONES
  // =========================
  function generateOptions(correct: string) {
    let opts = new Set<string>();

    opts.add(correct);

    while (opts.size < 4) {
      const random = shapes[Math.floor(Math.random() * shapes.length)];

      opts.add(random);
    }

    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
  }

  // =========================
  // PERDER VIDA POR TIEMPO
  // =========================
  function loseLifeByTime() {
    setResult("⏰ Tiempo agotado");

    setLives((prev) => {
      const newLives = prev - 1;

      if (newLives <= 0) {
        setGameOver(true);

        saveScore(score);
      } else {
        setTimeout(() => {
          setResult("");

          generatePattern();
        }, 800);
      }

      return newLives;
    });
  }

  // =========================
  // VALIDAR RESPUESTA
  // =========================
  function checkAnswer(selected: string) {
    if (gameOver) return;

    if (selected === correctAnswer) {
      setResult("✨ Correcto!");

      setScore((prev) => prev + 1);

      // disminuir tiempo por ronda
      setRoundTime((prev) => Math.max(prev - 1, 5));
    } else {
      setResult("💔 Incorrecto");

      setLives((prev) => {
        const newLives = prev - 1;

        if (newLives <= 0) {
          setGameOver(true);

          saveScore(score);
        }

        return newLives;
      });
    }

    setTimeout(() => {
      setResult("");

      if (lives <= 1 && selected !== correctAnswer) {
        setGameOver(true);

        return;
      }

      generatePattern();

      setTimeLeft(roundTime);
    }, 800);
  }

  // =========================
  // REINICIAR
  // =========================
  function resetGame() {
    setScore(0);

    setLives(3);

    setGameOver(false);

    setResult("");

    setRoundTime(20);

    setTimeLeft(20);

    generatePattern();
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🐰 Juego de Patrones</h1>

        {/* BOTÓN MENÚ */}
        <button
          style={styles.menuButton}
          onClick={() => navigate("/menu")}
        >
          ⬅ Menú
        </button>

        {/* HUD */}
        <div style={styles.hud}>
          <span>⭐ {score}</span>

          <span>🏆 {bestScore}</span>

          <span>❤️ {lives}</span>

          <span>⏳ {timeLeft}s</span>
        </div>

        {gameOver ? (
          <div style={styles.gameOver}>
            <h2>💀 Game Over</h2>

            <p>Puntaje final: {score}</p>

            <button style={styles.button} onClick={resetGame}>
              Reiniciar ✨
            </button>
          </div>
        ) : (
          <>
            <p style={styles.subtitle}>
              ¿Cuál es la siguiente figura? 🍓
            </p>

            {/* PATRÓN */}
            <div style={styles.pattern}>
              {pattern.map((shape, i) => (
                <div key={i} style={styles.box}>
                  {shape}
                </div>
              ))}

              <div style={{ ...styles.box, color: "#CDB4DB" }}>?</div>
            </div>

            {/* OPCIONES */}
            <div style={styles.options}>
              {options.map((opt, i) => (
                <div
                  key={i}
                  style={styles.option}
                  onClick={() => checkAnswer(opt)}
                >
                  {opt}
                </div>
              ))}
            </div>

            {/* RESULTADO */}
            <div style={styles.result}>{result}</div>
          </>
        )}
      </div>
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
    fontFamily: "sans-serif",
  },

  card: {
    width: "600px",
    padding: "30px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 12px 35px rgba(0,0,0,0.12)",
    textAlign: "center",
  },

  title: {
    color: "#5C5470",
    marginBottom: "10px",
  },

  subtitle: {
    color: "#8A7F8D",
  },

  hud: {
    display: "flex",
    justifyContent: "space-around",
    padding: "10px",
    margin: "15px 0",
    borderRadius: "20px",
    background: "#FFF9FB",
    color: "#5C5470",
    fontWeight: "bold",
  },

  pattern: {
    display: "flex",
    justifyContent: "center",
    margin: "20px 0",
  },

  box: {
    width: 80,
    height: 80,
    margin: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 40,
    borderRadius: "18px",
    background: "#FFF9FB",
    border: "2px solid #F8C8DC",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },

  options: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "15px",
  },

  option: {
    width: 70,
    height: 70,
    borderRadius: "18px",
    background: "linear-gradient(135deg, #FFAFCC, #CDB4DB)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 30,
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(205,180,219,0.4)",
  },

  result: {
    marginTop: 20,
    fontWeight: "bold",
    color: "#5C5470",
  },

  button: {
    marginTop: 10,
    padding: "12px 20px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #FFAFCC, #BDE0FE)",
    color: "#4A4453",
    fontWeight: "bold",
    cursor: "pointer",
  },

  card: {
    width: "600px",
    padding: "30px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 12px 35px rgba(0,0,0,0.12)",
    textAlign: "center",
    position: "relative", // 👈 IMPORTANTE
  },

  menuButton: {
    position: "absolute", // 👈 para ponerlo en esquina
    top: "20px",
    left: "20px",

    padding: "10px 16px",
    borderRadius: "14px",
    border: "none",

    background: "linear-gradient(135deg, #BDE0FE, #CDB4DB)",
    color: "#4A4453",

    fontWeight: "bold",
    cursor: "pointer",

    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },
  gameOver: {
    padding: "20px",
  },
};