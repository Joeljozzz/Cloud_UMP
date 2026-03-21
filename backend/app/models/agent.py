import enum
from datetime import datetime
from sqlalchemy import String, Enum, Text, Integer, Float, ForeignKey, Boolean, DateTime, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base


class AgentStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    DRAFT = "DRAFT"


class Agent(Base):
    __tablename__ = "agents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Configurable system prompt — what the agent CAN do
    system_prompt: Mapped[str] = mapped_column(Text)
    model: Mapped[str] = mapped_column(String(100), default="claude-sonnet-4-20250514")
    # Tools this agent is allowed to use (JSON list of strings)
    allowed_tools: Mapped[list] = mapped_column(JSON, default=list)
    max_tokens: Mapped[int] = mapped_column(Integer, default=1000)
    temperature: Mapped[float] = mapped_column(Float, default=0.7)
    status: Mapped[AgentStatus] = mapped_column(Enum(AgentStatus), default=AgentStatus.DRAFT)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    skills: Mapped[list["AgentSkill"]] = relationship("AgentSkill", back_populates="agent", cascade="all, delete-orphan")
    agent_access: Mapped[list["AgentAccess"]] = relationship("AgentAccess", back_populates="agent", cascade="all, delete-orphan")
    chat_sessions: Mapped[list["ChatSession"]] = relationship("ChatSession", back_populates="agent")


class AgentSkill(Base):
    """
    Persistent skill context — survives across conversations.
    These are the 'don't delete my emails without asking' type rules
    that the agent always remembers, independent of conversation history.
    """
    __tablename__ = "agent_skills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agents.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(255))
    # The actual persistent instruction
    instruction: Mapped[str] = mapped_column(Text)
    # Category: 'behavior', 'restriction', 'preference', 'knowledge'
    category: Mapped[str] = mapped_column(String(50), default="behavior")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    agent: Mapped["Agent"] = relationship("Agent", back_populates="skills")


class AgentAccess(Base):
    """Which users can use which agents."""
    __tablename__ = "agent_access"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"))
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agents.id", ondelete="CASCADE"))
    granted: Mapped[bool] = mapped_column(Boolean, default=True)
    granted_by: Mapped[str | None] = mapped_column(String(36), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="agent_access")
    agent: Mapped["Agent"] = relationship("Agent", back_populates="agent_access")
