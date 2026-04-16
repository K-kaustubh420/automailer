from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from email_fetch import fetch_emails
from model import classify_email

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/emails")
def get_emails(x_email: str = Header(None), x_password: str = Header(None)):
    if not x_email or not x_password: raise HTTPException(401, "Missing Credentials")
    try:
        raw = fetch_emails(x_email, x_password)
        enriched = []
        for e in raw:
            ai = classify_email(e["body"])
            # Boosting logic for small emails
            full_text = (e["subject"] + " ") * 3 + e["body"] if len(e["body"]) < 50 else e["body"]
            
            enriched.append({
                "id": e["id"],
                "sender": e["from"].split('<')[0].strip().replace('"', ''),
                "subject": e["subject"],
                "body": e["body"],
                "time": "Today",
                "priority": ai["priority"],
                "labels": ai["all_labels"],
                "assigned_team": ai["assigned_team"],
                "confidence": ai["confidence_score"]
            })
        return enriched
    except Exception: raise HTTPException(401, "Auth Failed")