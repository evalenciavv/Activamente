import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EMOJIS = ["🐰", "🐱", "🐶", "🐸", "🦊", "🦁", "🐼", "🐨"];
const juegoId = 2;

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function createCards(): Card[] {
  return shuffle([...EMOJIS, ...EMOJIS]).map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));
}

export default function JuegoMemoria() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [cards, setCards] = useState<Card[]>(createCards());
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    fetchBestScore();
  }, []);

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

  function handleCardClick(idx: number) {
    if (blocked || cards[idx].flipped || cards[idx].matched) return;

    const newCards = cards.map((c, i) =>
      i === idx ? { ...c, flipped: true } : c
    );
    const newSelected = [...selected, idx];

    setCards(newCards);
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const newMoves = moves + 1;
      setMoves(newMoves);

      const [a, b] = newSelected;
      if (newCards[a].emoji === newCards[b].emoji) {
        // Pareja encontrada
        const matched = newCards.map((c, i) =>
          i === a || i === b ? { ...c, matched: true } : c
        );
        setCards(matched);
        setSelected([]);
        setMessage("¡Pareja encontrada! ✨");
        setTimeout(() => setMessage(""), 700);

        const newPairs = matched.filter((c) => c.matched).length / 2;
        const allMatched = matched.every((c) => c.matched);

        if (allMatched) {
          // Score: 80 base - penalización por intentos fallidos * 2
          const wrongAttempts = newMoves - 8;
          const finalScore = Math.max(0, 80 - wrongAttempts * 2);
          setScore(finalScore);
          setGameOver(true);
          saveScore(finalScore);
        } else {
          setScore(newPairs * 10);
        }
      } else {
        // No coinciden
        setBlocked(true);
        setMessage("💔 No coinciden");
        setTimeout(() => {
          setCards(
            newCards.map((c, i) =>
              i === a || i === b ? { ...c, flipped: false } : c
            )
          );
          setSelected([]);
          setMessage("");
          setBlocked(false);
        }, 900);
      }
    }
  }

  function resetGame() {
    setCards(createCards());
    setSelected([]);
    setMoves(0);
    setScore(0);
    setGameOver(false);
    setMessage("");
    setBlocked(false);
  }

  const pairs = cards.filter((c) => c.matched).length / 2;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🧠 Juego de Memoria</h1>

        <button style={styles.menuButton} onClick={() => navigate("/menu")}>
          ⬅ Menú
        </button>

        <div style={styles.hud}>
          <span>⭐ {score}</span>
          <span>🏆 {bestScore}</span>
          <span>🃏 {pairs}/8</span>
          <span>🔄 {moves}</span>
        </div>

        {gameOver ? (
          <div style={styles.gameOver}>
            <h2>🎉 ¡Ganaste!</h2>
            <p>Puntaje final: {score}</p>
            <p style={{ color: "#8A7F8D", fontSize: "14px" }}>
              Intentos: {moves} · Parejas: 8/8
            </p>
            <button style={styles.button} onClick={resetGame}>
              Jugar de nuevo ✨
            </button>
          </div>
        ) : (
          <>
            <p style={styles.subtitle}>Encuentra todas las parejas 🌸</p>

            <div style={styles.grid}>
              {cards.map((card, idx) => (
                <div
                  key={card.id}
                  style={{
                    ...styles.cardItem,
                    ...(card.flipped || card.matched ? styles.cardFlipped : {}),
                    ...(card.matched ? styles.cardMatched : {}),
                  }}
                  onClick={() => handleCardClick(idx)}
                >
                  {card.flipped || card.matched ? card.emoji : "❓"}
                </div>
              ))}
            </div>

            <div style={styles.result}>{message}</div>
          </>
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
  subtitle: { color: "#8A7F8D", marginBottom: "15px" },
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
    margin: "0 auto",
    maxWidth: "400px",
  },
  cardItem: {
    height: "80px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #FFAFCC, #CDB4DB)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(205,180,219,0.35)",
    transition: "transform 0.15s",
    userSelect: "none",
  },
  cardFlipped: {
    background: "#FFF9FB",
    border: "2px solid #F8C8DC",
  },
  cardMatched: {
    background: "linear-gradient(135deg, #B7E4C7, #95D5B2)",
    border: "2px solid #74C69D",
  },
  result: {
    marginTop: "16px",
    fontWeight: "bold",
    color: "#5C5470",
    minHeight: "24px",
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
