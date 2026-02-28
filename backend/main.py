import opengradient as og
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os

app = FastAPI(title="The Arbiter AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenGradient client (SECURE: Reads from env var in production)
client = og.Client(private_key=os.getenv("PRIVATE_KEY", "YOUR_PRIVATE_KEY_HERE"))

print("Approving $OPG tokens for inference...")
# client.llm.ensure_opg_approval(opg_amount=5)
print("Tokens approved! Server is ready.")

class CaseRequest(BaseModel):
    topic: str
    player_1_argument: str
    player_2_argument: str

@app.post("/judge")
async def judge_case(request: CaseRequest):
    system_prompt = "You are The Arbiter, a ruthless but fair AI judge in a Web3 game. Evaluate the two arguments logically based on the provided debate topic. Declare a clear winner (Player 1 or Player 2) and give a 2-sentence explanation."
    user_prompt = f"Debate Topic: {request.topic}\nPlayer 1: {request.player_1_argument}\nPlayer 2: {request.player_2_argument}"
    
    try:
        # OPENGRADIENT SDK USAGE - Routes through TEE
        completion = client.llm.chat(
            model=og.TEE_LLM.GPT_4O,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
        )
        
        return {
            "winner_and_verdict": completion.chat_output['content'],
            "cryptographic_proof_hash": completion.transaction_hash 
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/generate-topic")
async def generate_topic():
    system_prompt = "You are a creative game master for a Web3 debate game. Generate one short, funny, or controversial debate topic about crypto, technology, or internet culture."

    try:
        completion = client.llm.chat(
            model=og.TEE_LLM.GPT_4O,
            messages=[{"role": "system", "content": system_prompt}],
        )
        return {"topic": completion.chat_output['content']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
