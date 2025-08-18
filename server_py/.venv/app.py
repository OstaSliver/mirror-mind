# app.py
from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Field, SQLModel, Session, select, Relationship, create_engine
from typing import Optional, List
from datetime import datetime, date

from datetime import timedelta
from sqlalchemy import desc

# ---------- CONFIG ----------
DB_URL = "sqlite:///./dev.db"
engine = create_engine(DB_URL, echo=False)
ORIGINS = ["http://localhost:5173"]  # Vite dev

# --- MODELS ---
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)    # ← int + autoincrement
    username: str = Field(index=True, unique=True)
    moods: List["MoodEntry"] = Relationship(back_populates="user")
    q11: List["Q11Result"] = Relationship(back_populates="user")

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

# ---------- APP ----------
app = FastAPI(title="MirrorMind API (FastAPI)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_session():
    with Session(engine) as session:
        yield session

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

# MVP auth: ใช้ header X-User-Id เป็น username (จะเปลี่ยนเป็น auth จริงทีหลังได้)
def get_user(
    session: Session = Depends(get_session),
    x_user_id: Optional[str] = Header(default="demo", convert_underscores=False),
) -> User:
    username = (x_user_id or "demo").strip()
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        user = User(username=username)
        session.add(user)
        session.commit()
        session.refresh(user)
    return user

@app.get("/api/health")
def health():
    return {"ok": True}

# ---------- MOOD ----------
@app.get("/api/moods")
def get_mood(date_str: Optional[str] = None, session: Session = Depends(get_session), user: User = Depends(get_user)):
    d = date_str or day_key()
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
