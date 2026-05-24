from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db, SessionLocal
from schemas import UserRegister, UserLogin, PuntajeCreate
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


@app.on_event("startup")
def seed_juegos():
    """Registra los juegos en la BD si no existen."""
    db = SessionLocal()
    try:
        juegos = [
            (1, "Patrones", "Adivina el siguiente elemento en el patrón"),
            (2, "Memoria", "Encuentra todas las parejas de cartas"),
            (3, "Reflejos", "Toca el objetivo lo más rápido posible"),
        ]
        for game_id, nombre, descripcion in juegos:
            db.execute(
                text("""
                    INSERT INTO juegos.juegos (id, nombre, descripcion)
                    VALUES (:id, :nombre, :desc)
                    ON CONFLICT (id) DO NOTHING
                """),
                {"id": game_id, "nombre": nombre, "desc": descripcion},
            )
        db.commit()
        print("✅ Juegos registrados en BD")
    except Exception as e:
        print(f"❌ Error al registrar juegos: {e}")
        db.rollback()
    finally:
        db.close()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# USUARIOS
# =========================
@app.get("/usuarios")
def obtener_usuarios(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT * FROM juegos.usuarios"))
    return [dict(row._mapping) for row in result]


# =========================
# MEJOR PUNTAJE
# =========================
@app.get("/mejor_puntaje")
def mejor_puntaje(db: Session = Depends(get_db)):
    result = db.execute(text("""
        SELECT username, juego, mejor_puntaje
        FROM juegos.v_mejores_puntajes
    """))
    return [dict(row._mapping) for row in result]


# =========================
# RANKING
# =========================
@app.get("/ranking")
def ranking(db: Session = Depends(get_db)):
    result = db.execute(text("""
        SELECT username, juego, puntaje, fecha
        FROM juegos.v_ranking_general
    """))
    return [dict(row._mapping) for row in result]


# =========================
# REGISTRO
# =========================
@app.post("/auth/register")
def register(user: UserRegister, db: Session = Depends(get_db)):

    existing_user = db.execute(
        text("SELECT * FROM juegos.usuarios WHERE email = :email"),
        {"email": user.email}
    ).fetchone()

    if existing_user:
        return {"message": "El usuario ya existe"}

    db.execute(
        text("""
            INSERT INTO juegos.usuarios (username, email, password_hash, nivel_aprendizaje, created_at)
            VALUES (:username, :email, :password, 1, NOW())
        """),
        {
            "username": user.username,
            "email": user.email,
            "password": user.password  # 👈 texto plano
        }
    )

    db.commit()

    return {"message": "Usuario registrado correctamente"}


# =========================
# LOGIN
# =========================
@app.post("/auth/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = db.execute(
        text("SELECT * FROM juegos.usuarios WHERE email = :email"),
        {"email": user.email}
    ).fetchone()

    if not db_user:
        return {"message": "Usuario no encontrado"}

    # 🔥 comparación directa (sin hash)
    if user.password != db_user.password_hash:
        return {"message": "Contraseña incorrecta"}

    return {
        "message": "Login exitoso",
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email
        }
    }

# =========================
# MEJOR PUNTAJE POR USUARIO Y JUEGO
# =========================
@app.get("/mejor_puntaje/{usuario_id}/{juego_id}")
def obtener_mejor_puntaje(
    usuario_id: int,
    juego_id: int,
    db: Session = Depends(get_db)
):

    result = db.execute(
        text("""
            SELECT MAX(puntaje) as mejor_puntaje
            FROM juegos.puntajes
            WHERE usuario_id = :usuario_id
            AND juego_id = :juego_id
        """),
        {
            "usuario_id": usuario_id,
            "juego_id": juego_id
        }
    ).fetchone()

    return {
        "mejor_puntaje": result.mejor_puntaje if result.mejor_puntaje else 0
    }

# =========================
# GUARDAR PUNTAJE
# =========================
@app.post("/puntajes")
def guardar_puntaje(
    puntaje: PuntajeCreate,
    db: Session = Depends(get_db)
):

    db.execute(
        text("""
            INSERT INTO juegos.puntajes
            (usuario_id, juego_id, puntaje, fecha)
            VALUES
            (:usuario_id, :juego_id, :puntaje, NOW())
        """),
        {
            "usuario_id": puntaje.usuario_id,
            "juego_id": puntaje.juego_id,
            "puntaje": puntaje.puntaje
        }
    )

    db.commit()

    return {
        "message": "Puntaje guardado correctamente"
    }