import os
import json
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from solana.rpc.async_api import AsyncClient
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from anchorpy import Program, Provider, Wallet, Idl, Context
import uvicorn
from groq import Groq # ✅ Импортируем Groq

load_dotenv()

# ✅ Настраиваем клиента Groq
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

PRIVATE_KEY_HEX = os.getenv("AI_PRIVATE_KEY_HEX")
ai_keypair = Keypair.from_seed(bytes.fromhex(PRIVATE_KEY_HEX))
wallet = Wallet(ai_keypair)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_program():
    client = AsyncClient(os.getenv("RPC_URL", "https://api.devnet.solana.com"))
    provider = Provider(client, wallet)
    with open("idl.json", "r") as f:
        idl = Idl.from_json(f.read())
    program = Program(idl, Pubkey.from_string(os.getenv("PROGRAM_ID")), provider)
    return program, client

@app.post("/analyze")
async def analyze(image_url: str = Form(...)):
    print(f"\n🧠 Анализирую фото через Groq LLaMA Vision: {image_url}")
    try:
        prompt = """Ты ИИ-инспектор городских проблем. Посмотри на фото.
Верни ТОЛЬКО валидный JSON, без пояснений, без markdown:
{"is_fake": false, "severity": 7, "estimated_cost": 200}

Правила:
- is_fake: true если фото не показывает реальную городскую проблему (яма, мусор, сломанный столб и т.д.)
- severity: целое число от 1 до 10 (10 = очень опасно)
- estimated_cost: целое число, примерная стоимость ремонта в долларах, и чтоб почку не стояло"""

        # ✅ Вызываем бесплатную Vision-модель от Groq
        completion = groq_client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "user",
                    "content":[
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_url}}
                    ]
                }
            ],
            temperature=0,
            max_tokens=1024,
        )

        text = completion.choices[0].message.content
        text = text.strip().replace("```json", "").replace("```", "").strip()
        print(f"🤖 Groq Ответ: {text}")
        
        decision = json.loads(text)

        decision["severity"]       = max(1, min(10, int(decision.get("severity", 5))))
        decision["estimated_cost"] = max(1, int(decision.get("estimated_cost", 100)))
        decision["is_fake"]        = bool(decision.get("is_fake", False))

        if decision["is_fake"]:
            print("🚫 Фейк")
            return {"ok": False, "error": "Фото не является реальной городской проблемой"}

        print(f"✅ Реальная проблема! severity={decision['severity']} cost={decision['estimated_cost']}")
        return {
            "ok":             True,
            "severity":       decision["severity"],
            "estimated_cost": decision["estimated_cost"],
        }

    except Exception as e:
        print(f"❌ Ошибка Groq: {e}")
        return {"ok": False, "error": str(e)}


@app.post("/verify")
async def verify(
    issue_pda:      str = Form(...),
    severity:       int = Form(...),
    estimated_cost: int = Form(...),
):
    print(f"\n📝 Записываю оценку в блокчейн: {issue_pda}")
    program, client = await get_program()
    
    try:
        await program.rpc["verify_by_ai"](
            severity,
            estimated_cost,
            ctx=Context(
                accounts={
                    "issue":    Pubkey.from_string(issue_pda),
                    "ai_agent": ai_keypair.pubkey(),
                },
                signers=[ai_keypair] 
            )
        )

        print(f"✅ verifyByAi записан! severity={severity} cost={estimated_cost}")
        return {"ok": True}

    except Exception as e:
        print(f"❌ Ошибка verify: {e}")
        return {"ok": False, "error": str(e)}
    finally:
        await client.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)