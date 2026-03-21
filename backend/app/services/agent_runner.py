"""
Agent Runner — uses Hugging Face free Inference API.
Model: HuggingFaceH4/zephyr-7b-beta (free, instruction-tuned, understands system prompts)
Fallback: mistralai/Mistral-7B-Instruct-v0.2
"""
import httpx
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.models.agent import Agent, AgentAccess, AgentSkill
from app.models.audit import AuditLog
from app.services.constitutional import build_agent_prompt
import uuid

HF_API_URL = "https://api-inference.huggingface.co/models/{model}"

# Zephyr uses <|system|>, <|user|>, <|assistant|> chat template
def format_zephyr_prompt(system: str, messages: list[dict]) -> str:
    prompt = f"<|system|>\n{system}</s>\n"
    for msg in messages:
        role = msg["role"]
        content = msg["content"]
        if role == "user":
            prompt += f"<|user|>\n{content}</s>\n"
        elif role == "assistant":
            prompt += f"<|assistant|>\n{content}</s>\n"
    prompt += "<|assistant|>\n"
    return prompt


# Mistral uses [INST] template as fallback
def format_mistral_prompt(system: str, messages: list[dict]) -> str:
    # Prepend system to first user message
    prompt = ""
    first = True
    for msg in messages:
        if msg["role"] == "user":
            content = msg["content"]
            if first:
                content = f"[SYSTEM]\n{system}\n[/SYSTEM]\n\n{content}"
                first = False
            prompt += f"[INST] {content} [/INST]"
        elif msg["role"] == "assistant":
            prompt += f" {msg['content']} </s>"
    return prompt


async def call_hf_inference(
    model: str,
    prompt: str,
    max_new_tokens: int = 512,
    temperature: float = 0.7,
    hf_token: str = "",
) -> str:
    url = HF_API_URL.format(model=model)
    headers = {"Content-Type": "application/json"}
    if hf_token:
        headers["Authorization"] = f"Bearer {hf_token}"

    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": max_new_tokens,
            "temperature": temperature,
            "do_sample": True,
            "top_p": 0.9,
            "repetition_penalty": 1.1,
            "return_full_text": False,  # only return the NEW tokens
        },
        "options": {
            "wait_for_model": True,  # wait instead of returning 503
            "use_cache": False,
        }
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()

    # HF returns [{"generated_text": "..."}]
    if isinstance(data, list) and len(data) > 0:
        text = data[0].get("generated_text", "")
        return text.strip()

    # Some models return {"generated_text": "..."} directly
    if isinstance(data, dict):
        return data.get("generated_text", "").strip()

    return "I was unable to generate a response. Please try again."


async def run_agent(
    db: AsyncSession,
    agent_id: str,
    user_id: str,
    user_context: dict,
    messages: list[dict],
) -> dict:
    # 1. Load agent
    result = await db.execute(select(Agent).where(Agent.id == agent_id))
    agent = result.scalar_one_or_none()
    if not agent or agent.status != "ACTIVE":
        raise ValueError("Agent not found or not active")

    # 2. Verify user access
    access_result = await db.execute(
        select(AgentAccess).where(
            AgentAccess.user_id == user_id,
            AgentAccess.agent_id == agent_id,
            AgentAccess.granted == True,
        )
    )
    if not access_result.scalar_one_or_none():
        raise PermissionError("You do not have access to this agent")

    # 3. Load active skills
    skills_result = await db.execute(
        select(AgentSkill).where(
            AgentSkill.agent_id == agent_id,
            AgentSkill.is_active == True,
        )
    )
    skills = [
        {"title": s.title, "instruction": s.instruction,
         "category": s.category, "is_active": s.is_active}
        for s in skills_result.scalars().all()
    ]

    # 4. Build constitutional prompt (all 3 layers)
    full_system = build_agent_prompt(
        agent_system_prompt=agent.system_prompt,
        skills=skills,
        user_context=user_context,
    )

    # 5. Determine model + format prompt
    # Default to zephyr; admin can override model field in agent config
    model_name = agent.model if agent.model and "/" in agent.model else "HuggingFaceH4/zephyr-7b-beta"

    if "zephyr" in model_name.lower() or "smollm" in model_name.lower():
        prompt = format_zephyr_prompt(full_system, messages)
    else:
        prompt = format_mistral_prompt(full_system, messages)

    # 6. Cap max_new_tokens for free tier (HF free tier allows up to 500-1000 depending on model)
    max_tokens = min(agent.max_tokens, 500)

    # 7. Call HF Inference API
    hf_token = settings.HF_TOKEN  # optional — free tier works without token (rate limited)
    assistant_text = await call_hf_inference(
        model=model_name,
        prompt=prompt,
        max_new_tokens=max_tokens,
        temperature=agent.temperature,
        hf_token=hf_token,
    )

    # 8. Audit log
    log = AuditLog(
        id=str(uuid.uuid4()),
        user_id=user_id,
        action="AGENT_CHAT",
        resource=f"agent:{agent_id}",
        details={
            "agent_name": agent.name,
            "model": model_name,
            "skills_applied": len(skills),
            "message_count": len(messages),
        },
        success=True,
    )
    db.add(log)
    await db.commit()

    return {
        "message": assistant_text,
        "model": model_name,
        "agent_name": agent.name,
        "skills_count": len(skills),
        "tokens_used": len(prompt.split()),  # approx word count since HF doesn't return token count
    }
