import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const TOTAL_ROUNDS = 8;
const juegoId = 3;

type Phase = "start" | "waiting" | "target" | "result" | "gameover";

function calcPoints(ms: number): number {
  if (ms < 300) return 100;
  if (ms < 500) return 80;
  if (ms < 800) return 60;
  if (ms < 1200) return 40;
  return 20;
}

export default function JuegoReflejos() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [phase, setPhase] = useState<Phase>("start");
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [lastTime, setLastTime] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);

  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    fetchBestScore();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Mantener scoreRef sincronizado con score
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  async function fetchBestScore() {
    try {
      const res = await fetch(
        `http://localhost:8000/mejor_puntaje/${user.id}/${juegoId}`
      );
      const data = await res.json();
      setBestScore(data.mejor_puntaje || 0);
    } catch (e) {
      console.error("Error obteniendo mejor puntaje:", e);
    }
  }

  async function saveScore(finalScore: number) {
    try {
      await fetch("http://localhost:8000/puntajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: user.id,
          juego_id: juegoId,
          puntaje: finalScore,
        }),
      });
      fetchBestScore();
    } catch (e) {
      console.error("Error guardando puntaje:", e);
    }
  }

  function startRound() {
    setPhase("waiting");
    const delay = 800 + Math.random() * 1700;
    timerRef.current = setTimeout(() => {
      setTargetPos({
        x: 10 + Math.random() * 72,
        y: 10 + Math.random() * 72,
      });
      setPhase("target");
      startTimeRef.current = Date.now();
    }, delay);
  }

  function advanceRound(newScore: number, currentRound: number) {
    setTimeout(() => {
      if (currentRound >= TOTAL_ROUNDS) {
        setPhase("gameover");
        saveScore(newScore);
      } else {
        setRound((r) => r + 1);
        startRound();
      }
    }, 1000);
  }

  function handleTargetClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (phase !== "target") return;

    const rt = Date.now() - startTimeRef.current;
    const pts = calcPoints(rt);
    const newScore = scoreRef.current + pts;

    setLastTime(rt);
    setLastPoints(pts);
    setScore(newScore);
    setPhase("result");
    advanceRound(newScore, round);
  }

  function handleAreaClick() {
    if (phase !== "waiting") return;
    // Clic antes de que aparezca el objetivo = demasiado pronto
    if (timerRef.current) clearTimeout(timerRef.current);
    setLastTime(-1);
    setLastPoints(0);
    setPhase("result");
    advanceRound(scoreRef.current, round);
  }

  function resetGame() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("start");
    setRound(1);
    setScore(0);
    scoreRef.current = 0;
    setLastTime(0);
    setLastPoints(0);
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>⚡ Juego de Reflejos</h1>

        <button style={styles.menuButton} onClick={() => navigate("/menu")}>
          ⬅ Menú
        </button>

        <div style={styles.hud}>
          <span>⭐ {score}</span>
          <span>🏆 {bestScore}</span>
          <span>🎯 {round}/{TOTAL_ROUNDS}</span>
        </div>

        {phase === "start" && (
          <div style={styles.center}>
            <p style={styles.subtitle}>
              Cuando aparezca el objetivo, ¡tócalo lo más rápido posible! 🐇
            </p>
            <p style={styles.hint}>
              ⚠️ Si haces clic antes de que aparezca, perderás ese turno
            </p>
            <button style={styles.button} onClick={startRound}>
              ¡Empezar! 🚀
            </button>
          </div>
        )}

        {phase === "gameover" && (
          <div style={styles.gameOver}>
            <h2>🎉 ¡Completado!</h2>
            <p>Puntaje final: {score}</p>
            <p style={{ color: "#8A7F8D", fontSize: "14px" }}>
              Máximo posible: {TOTAL_ROUNDS * 100} pts
            </p>
            <button style={styles.button} onClick={resetGame}>
              Jugar de nuevo ✨
            </button>
          </div>
        )}

        {(phase === "waiting" || phase === "target") && (
          <div style={styles.arena} onClick={handleAreaClick}>
            {phase === "waiting" && (
              <p style={styles.arenaHint}>Espera... 👀</p>
            )}
            {phase === "target" && (
              <div
                style={{
                  ...styles.target,
                  left: `${targetPos.x}%`,
                  top: `${targetPos.y}%`,
                }}
                onClick={handleTargetClick}
              />
            )}
          </div>
        )}

        {phase === "result" && (
          <div style={styles.resultBox}>
            {lastTime === -1 ? (
              <>
                <p style={styles.resultBad}>⚠️ ¡Demasiado pronto!</p>
                <p style={styles.resultPoints}>+0 pts</p>
              </>
            ) : (
              <>
                <p style={styles.resultTime}>⏱ {lastTime} ms</p>
                <p style={styles.resultPoints}>+{lastPoints} pts</p>
                <p style={styles.resultRating}>
                  {lastTime < 300
                    ? "⚡ ¡Increíble!"
                    : lastTime < 500
                    ? "🔥 ¡Muy rápido!"
                    : lastTime < 800
                    ? "👍 Bien"
                    : lastTime < 1200
                    ? "😐 Normal"
                    : "🐢 Lento..."}
                </p>
              </>
            )}
          </div>
        )}
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
      "linear-gradient(135deg, #FFE5EC 0%, #FFF1E6 40%, #E2F0CB 100%)",
    fontFamily: "sans-serif",
    padding: "20px",
  },
  card: {
    width: "560px",
    padding: "30px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 12px 35px rgba(0,0,0,0.12)",
    textAlign: "center",
    position: "relative",
  },
  title: { color: "#5C5470", marginBottom: "10px" },
  subtitle: { color: "#8A7F8D", marginBottom: "10px" },
  hint: {
    color: "#FFAFCC",
    fontSize: "13px",
    marginBottom: "20px",
  },
  menuButton: {
    position: "absolute",
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
  arena: {
    position: "relative",
    width: "100%",
    height: "300px",
    borderRadius: "20px",
    background: "#FFF9FB",
    border: "2px solid #F8C8DC",
    margin: "10px 0",
    overflow: "hidden",
    cursor: "crosshair",
  },
  arenaHint: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "#CDB4DB",
    fontWeight: "bold",
    fontSize: "22px",
    userSelect: "none",
    pointerEvents: "none",
  },
  target: {
    position: "absolute",
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #FFAFCC, #CDB4DB)",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(205,180,219,0.7)",
    transform: "translate(-50%, -50%)",
  },
  center: {
    padding: "30px 10px",
  },
  resultBox: {
    padding: "30px 10px",
  },
  resultTime: {
    color: "#5C5470",
    fontWeight: "bold",
    fontSize: "20px",
    margin: "5px 0",
  },
  resultPoints: {
    color: "#C77DFF",
    fontWeight: "bold",
    fontSize: "32px",
    margin: "5px 0",
  },
  resultRating: {
    color: "#8A7F8D",
    fontSize: "16px",
    marginTop: "5px",
  },
  resultBad: {
    color: "#FF6B6B",
    fontWeight: "bold",
    fontSize: "20px",
  },
  button: {
    marginTop: "10px",
    padding: "12px 24px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #FFAFCC, #BDE0FE)",
    color: "#4A4453",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "15px",
  },
  gameOver: { padding: "20px" },
};
