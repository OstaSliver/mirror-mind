# app.py
from fastapi import FastAPI, Depends, Header, HTTPException, Query, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Field, SQLModel, Session, select, Relationship, create_engine
from typing import Optional, List
from datetime import datetime, date, timedelta

import calendar
import re,os

from sqlalchemy import desc

from pydantic import BaseModel,EmailStr

from passlib.context import CryptContext
from jose import jwt, JWTError

# ---------- ค่าคงที่ / helper ----------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
AUTH_SECRET = os.getenv("AUTH_SECRET", "dev-secret-change-me")
AUTH_ALG = "HS256"
AUTH_EXPIRES_HOURS = int(os.getenv("AUTH_EXPIRES_HOURS", "168"))  # 7 วัน

DB_URL = "sqlite:///./dev.db"
engine = create_engine(DB_URL, echo=False)
ORIGINS = ["http://localhost:5173"]  # Vite dev
# Database engine setup
app = FastAPI(title="MirrorMind API (FastAPI)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)    # ← int + autoincrement
    username: str = Field(index=True, unique=True)
    moods: List["MoodEntry"] = Relationship(back_populates="user")
    q11: List["Q11Result"] = Relationship(back_populates="user")

class AuthCredential(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    userId: int = Field(foreign_key="user.id", unique=True, index=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class MoodEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    userId: int = Field(foreign_key="user.id")                    # ← int
    date: str = Field(index=True)
    level: int
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    user: Optional[User] = Relationship(back_populates="moods")

class Q11Result(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    userId: int = Field(foreign_key="user.id")                    # ← int
    p1Total: int
    p2Total: int
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    user: Optional[User] = Relationship(back_populates="q11")

class ChatMessage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    userId: int = Field(foreign_key="user.id", index=True)        # ← int
    who: str = Field(regex="^(bot|me)$")
    text: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class QuoteOfDay(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: str = Field(unique=True, index=True)
    text: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)

# --- โมเดลตารางโปรไฟล์ ---
class UserProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    userId: int = Field(foreign_key="user.id", unique=True, index=True)

    firstName: str
    lastName: str
    address: Optional[str] = None
    phone: Optional[str] = None
    dob: date
    gender: str
    occupation: Optional[str] = None
    education: Optional[str] = None

    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

QUOTES = [
    "ความพยายามของเธอ มีค่าเสมอ",
    "ยิ้มของเธอทำให้โลกสดใสขึ้นนะ",
    "วันนี้อาจเหนื่อย แต่เธอเก่งมากแล้ว",
    "ค่อย ๆ ไปก็ยังเป็นการก้าวไปข้างหน้า",
    "พักได้ แต่อย่าลืมเริ่มใหม่อีกครั้ง",
    "เธอไม่จำเป็นต้องสมบูรณ์แบบ แค่พยายามก็พอ",
    "สิ่งเล็ก ๆ ที่ทำวันนี้ คือพลังของพรุ่งนี้",
    "ใจดีกับตัวเองหน่อยนะ",
]

def day_key(d: Optional[date] = None) -> str:
    d = d or date.today()
    return f"{d.year}-{d.month:02d}-{d.day:02d}"



def get_session():
    with Session(engine) as session:
        yield session

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

# MVP auth: ใช้ header X-User-Id เป็น username (จะเปลี่ยนเป็น auth จริงทีหลังได้)
# def get_user(
#     session: Session = Depends(get_session),
#     x_user_id: Optional[str] = Header(default="demo", convert_underscores=False),
# ) -> User:
#     username = (x_user_id or "demo").strip()
#     user = session.exec(select(User).where(User.username == username)).first()
#     if not user:
#         user = User(username=username)
#         session.add(user)
#         session.commit()
#         session.refresh(user)
#     return user

def get_user(request: Request, session: Session = Depends(get_session)):
    # 1) Bearer token มาก่อน
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth.removeprefix("Bearer ").strip()
        try:
            data = decode_token(token)
            user_id = int(data.get("sub"))
        except (JWTError, ValueError):
            raise HTTPException(status_code=401, detail="invalid token")
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=401, detail="user not found")
        return user

# ---------- UserProfile ----------
class ProfileIn(BaseModel):
    firstName: str
    lastName: str
    address: Optional[str] = None
    phone: Optional[str] = None        # 0-9, 9–10 หลัก
    dob: date | str                    # รับเป็น date หรือ 'YYYY-MM-DD'
    gender: str                        # "ชาย" | "หญิง" | "อื่นๆ" | ...
    occupation: Optional[str] = None
    education: Optional[str] = None

PHONE_RE = re.compile(r"^\d{9,10}$")

def _to_date(v: date | str) -> date:
    return v if isinstance(v, date) else date.fromisoformat(v)

# --- GET: อ่านโปรไฟล์ของ user ปัจจุบัน ---
@app.get("/api/profile")
def get_profile(session: Session = Depends(get_session),
                user: User = Depends(get_user)):
    prof = session.exec(select(UserProfile).where(UserProfile.userId == user.id)).first()
    return prof or {}

# --- POST: upsert โปรไฟล์ของ user ปัจจุบัน ---
@app.post("/api/profile")
def upsert_profile(payload: ProfileIn,
                   session: Session = Depends(get_session),
                   user: User = Depends(get_user)):
    # validate ง่าย ๆ
    if payload.phone and not PHONE_RE.match(payload.phone):
        raise HTTPException(status_code=400, detail="เบอร์โทรไม่ถูกต้อง (ต้องเป็นตัวเลข 9–10 หลัก)")

    prof = session.exec(select(UserProfile).where(UserProfile.userId == user.id)).first()
    dob = _to_date(payload.dob)

    if prof is None:
        prof = UserProfile(
            userId=user.id,
            firstName=payload.firstName.strip(),
            lastName=payload.lastName.strip(),
            address=(payload.address or "").strip() or None,
            phone=payload.phone or None,
            dob=dob,
            gender=payload.gender,
            occupation=(payload.occupation or "").strip() or None,
            education=payload.education or None,
        )
        session.add(prof)
    else:
        prof.firstName = payload.firstName.strip()
        prof.lastName  = payload.lastName.strip()
        prof.address   = (payload.address or "").strip() or None
        prof.phone     = payload.phone or None
        prof.dob       = dob
        prof.gender    = payload.gender
        prof.occupation= (payload.occupation or "").strip() or None
        prof.education = payload.education or None
        prof.updatedAt = datetime.utcnow()

    session.commit()
    session.refresh(prof)
    return prof

# ---------- login/register ----------

# ---------- Schemas ----------
class RegisterPayload(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginPayload(BaseModel):
    identifier: str  # email หรือ username
    password: str


USERNAME_RE = re.compile(r"^[a-zA-Z0-9_.-]{3,20}$")


def hash_password(pw: str) -> str:
    return pwd_context.hash(pw)

def verify_password(pw: str, hashed: str) -> bool:
    return pwd_context.verify(pw, hashed)

def create_access_token(user_id: int, username: str) -> str:
    now = datetime.utcnow()
    payload = {
        "sub": str(user_id),
        "username": username,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=AUTH_EXPIRES_HOURS)).timestamp()),
    }
    return jwt.encode(payload, AUTH_SECRET, algorithm=AUTH_ALG)

def decode_token(token: str) -> dict:
    return jwt.decode(token, AUTH_SECRET, algorithms=[AUTH_ALG])


@app.post("/api/auth/register", status_code=201)
def api_register(payload: RegisterPayload, session: Session = Depends(get_session)):
    # ตรวจรูปแบบ
    if not USERNAME_RE.match(payload.username):
        raise HTTPException(status_code=400, detail="username ต้องเป็น a-z0-9_.- ความยาว 3–20 ตัว")
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="รหัสผ่านต้องมีอย่างน้อย 8 ตัว")

    # อีเมลซ้ำ?
    if session.exec(select(AuthCredential).where(AuthCredential.email == payload.email)).first():
        raise HTTPException(status_code=409, detail="อีเมลนี้ถูกใช้แล้ว")

    # หา/สร้าง User
    user = session.exec(select(User).where(User.username == payload.username)).first()
    if user:
        # username ซ้ำแต่ยังไม่มี credential?
        existed_cred = session.exec(select(AuthCredential).where(AuthCredential.userId == user.id)).first()
        if existed_cred:
            raise HTTPException(status_code=409, detail="username นี้ถูกใช้แล้ว")
    else:
        user = User(username=payload.username)
        session.add(user); session.commit(); session.refresh(user)

    cred = AuthCredential(
        userId=user.id,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    session.add(cred); session.commit(); session.refresh(cred)

    token = create_access_token(user.id, user.username)
    return {"ok": True, "token": token, "user": {"id": user.id, "username": user.username, "email": cred.email}}

# 
@app.post("/api/auth/login")
def api_login(payload: LoginPayload, session: Session = Depends(get_session)):
    ident = payload.identifier.strip()
    cred = None
    user = None

    if "@" in ident:
        cred = session.exec(select(AuthCredential).where(AuthCredential.email == ident)).first()
        if cred:
            user = session.get(User, cred.userId)
    else:
        user = session.exec(select(User).where(User.username == ident)).first()
        if user:
            cred = session.exec(select(AuthCredential).where(AuthCredential.userId == user.id)).first()

    if not user or not cred or not verify_password(payload.password, cred.password_hash):
        raise HTTPException(status_code=401, detail="ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง")

    token = create_access_token(user.id, user.username)
    return {"ok": True, "token": token, "user": {"id": user.id, "username": user.username, "email": cred.email}}

# ---------- CHECK (เช็คว่าว่างไหม) ----------
@app.get("/api/auth/check")
def api_check(
    username: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    session: Session = Depends(get_session),
):
    out = {}
    if username is not None:
        u = session.exec(select(User).where(User.username == username)).first()
        # ถ้าเจอ user แต่ยังไม่มี credential ก็ถือว่า "ถูกใช้แล้ว" เพื่อกันชนกัน
        used = bool(u)
        out["username"] = {"available": not used}
    if email is not None:
        e = session.exec(select(AuthCredential).where(AuthCredential.email == email)).first()
        out["email"] = {"available": not bool(e)}
    if not out:
        raise HTTPException(status_code=400, detail="ต้องระบุ username และ/หรือ email")
    return out

# ---------- ME ----------
@app.get("/api/auth/me")
def api_me(user: User = Depends(get_user), session: Session = Depends(get_session)):
    cred = session.exec(select(AuthCredential).where(AuthCredential.userId == user.id)).first()
    return {"user": {"id": user.id, "username": user.username, "email": getattr(cred, "email", None)}}

# ---------- LOGOUT (stateless) ----------
@app.post("/api/auth/logout")
def api_logout():
    # ใช้ JWT แบบ stateless ไม่มี server-side session ให้ลบ – ด้านหน้าแค่ลบ token เอง
    return {"ok": True}



# ---------- MOOD ----------
@app.get("/api/moods")
def get_mood(
    q_date: str | None = Query(None, alias="date"),   # ← รับพารามิเตอร์ชื่อ `date`
    session: Session = Depends(get_session),
    user: User = Depends(get_user),
):
    d = q_date or day_key()
    m = session.exec(
        select(MoodEntry.level).where(MoodEntry.userId == user.id, MoodEntry.date == d)
    ).first()
    return {"date": d, "level": m if m is not None else None}


@app.put("/api/moods")
def upsert_mood(payload: dict, session: Session = Depends(get_session), user: User = Depends(get_user)):
    # อนุญาตอัปเดตเฉพาะ "วันนี้"
    d = payload.get("date")
    level = payload.get("level")
    if d != day_key():
        raise HTTPException(400, "Can only set today's mood")
    if not isinstance(level, int) or not (0 <= level <= 6):
        raise HTTPException(400, "level must be 0..6")

    existing = session.exec(
        select(MoodEntry).where(MoodEntry.userId == user.id, MoodEntry.date == d)
    ).first()
    if existing:
        existing.level = level
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing
    new_entry = MoodEntry(userId=user.id, date=d, level=level)
    session.add(new_entry)
    session.commit()
    session.refresh(new_entry)
    return new_entry

@app.get("/api/moods/month")
def get_moods_month(
    year: int,
    month: int,                      # 1..12
    session: Session = Depends(get_session),
    user: User = Depends(get_user),
):
    # คำนวณช่วงต้น-ปลายเดือน (YYYY-MM-DD)
    last_day = calendar.monthrange(year, month)[1]
    start_str = f"{year:04d}-{month:02d}-01"
    end_str   = f"{year:04d}-{month:02d}-{last_day:02d}"

    rows = session.exec(
        select(MoodEntry).where(
            MoodEntry.userId == user.id,
            MoodEntry.date >= start_str,
            MoodEntry.date <= end_str,
        )
    ).all()

    # แปลงเป็น map { "YYYY-MM-DD": level }
    data = { r.date: r.level for r in rows }
    return { "year": year, "month": month, "data": data }

@app.get("/api/moods/month/summary")
def get_mood_month_summary(
    year: int, month: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_user),
):
    last_day = calendar.monthrange(year, month)[1]
    start_str = f"{year:04d}-{month:02d}-01"
    end_str   = f"{year:04d}-{month:02d}-{last_day:02d}"

    rows = session.exec(
        select(MoodEntry.level).where(
            MoodEntry.userId == user.id,
            MoodEntry.date >= start_str,
            MoodEntry.date <= end_str,
        )
    ).all()
    c = Counter(rows)
    # คืนครบ 0..6
    return {"year": year, "month": month, "counts": {str(i): c.get(i, 0) for i in range(7)}}



# ---------- QUOTE OF DAY ----------
@app.get("/api/quote/today")
def quote_today(session: Session = Depends(get_session)):
    dk = day_key()
    q = session.exec(select(QuoteOfDay).where(QuoteOfDay.date == dk)).first()
    if not q:
        recent = session.exec(select(QuoteOfDay).order_by(QuoteOfDay.createdAt.desc()).limit(5)).all()
        recent_texts = {r.text for r in recent}
        pool = [t for t in QUOTES if t not in recent_texts] or QUOTES
        import random
        text = random.choice(pool)
        q = QuoteOfDay(date=dk, text=text)
        session.add(q)
        session.commit()
        session.refresh(q)
    return q

# ---------- Q11 ----------
@app.post("/api/q11")
def save_q11(payload: dict, session: Session = Depends(get_session), user: User = Depends(get_user)):
    p1 = int(payload.get("p1Total", 0))
    p2 = int(payload.get("p2Total", 0))
    r = Q11Result(userId=user.id, p1Total=p1, p2Total=p2)
    session.add(r)
    session.commit()
    session.refresh(r)
    return r

@app.get("/api/q11/latest")
def latest_q11(session: Session = Depends(get_session), user: User = Depends(get_user)):
    r = session.exec(
        select(Q11Result).where(Q11Result.userId == user.id).order_by(Q11Result.createdAt.desc())
    ).first()
    return r or None


# ดึงประวัติ (page แบบง่าย: limit + before)
@app.get("/api/chat")
def list_chat(
    limit: int = 100,
    before: Optional[str] = None,   # ISO datetime; ถ้าไม่ใส่ = now
    session: Session = Depends(get_session),
    user: User = Depends(get_user),
):
    lim = max(1, min(limit, 500))
    cursor = datetime.fromisoformat(before) if before else datetime.utcnow()
    rows = session.exec(
        select(ChatMessage)
        .where(ChatMessage.userId == user.id, ChatMessage.createdAt < cursor)
        .order_by(desc(ChatMessage.createdAt))
        .limit(lim)
    ).all()
    # ส่งกลับแบบเวลาเก่า→ใหม่ เพื่อแสดงง่าย
    rows.reverse()
    return rows

# ส่งข้อความ (me หรือ bot; ปกติ frontend จะส่ง "me")
@app.post("/api/chat")
def post_chat(
    payload: dict,
    session: Session = Depends(get_session),
    user: User = Depends(get_user),
):
    who = payload.get("who", "me")
    text = (payload.get("text") or "").strip()
    if who not in ("bot", "me") or not text:
        raise HTTPException(400, "invalid payload")
    msg = ChatMessage(userId=user.id, who=who, text=text)
    session.add(msg)
    session.commit()
    session.refresh(msg)
    return msg

# สร้าง mock ประวัติย้อนหลัง (ต่อ user)
@app.post("/api/chat/mock")
def mock_chat(
    days: int = 5,
    per_day: int = 2,
    session: Session = Depends(get_session),
    user: User = Depends(get_user),
):
    """
    สร้างข้อความย้อนหลัง N วัน, วันละ k ข้อความ (สลับ bot/me)
    """
    days = max(1, min(days, 30))
    per_day = max(1, min(per_day, 10))
    base = datetime.utcnow()

    made = []
    qi = 0
    for d in range(days, 0, -1):
        day_dt = (base - timedelta(days=d)).replace(hour=3, minute=0, second=0, microsecond=0)
        for i in range(per_day):
            # เวลาไล่ชั่วโมงสลับ ๆ กันให้ดูจริง
            ts = day_dt + timedelta(hours=2*i + 1)
            who = "bot" if (i % 2 == 0) else "me"
            text = QUOTES[qi % len(QUOTES)] if who == "bot" else f"บันทึกความรู้สึก #{i+1} ย้อนหลัง"
            qi += 1
            msg = ChatMessage(userId=user.id, who=who, text=text, createdAt=ts)
            session.add(msg)
            made.append(msg)

    session.commit()
    return {"inserted": len(made)}
