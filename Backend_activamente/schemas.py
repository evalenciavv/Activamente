from pydantic import BaseModel

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# =========================
# SCHEMA PUNTAJE
# =========================
class PuntajeCreate(BaseModel):
    usuario_id: int
    juego_id: int
    puntaje: int