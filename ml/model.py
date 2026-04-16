import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

class EmailTriageAI:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        self.model = SentenceTransformer(model_name)
        
        self.categories = {
            "Bug": ["app crashes", "code error", "broken feature", "system failure", "critical bug", "api not responding"],
            "Billing": ["payment failed", "refund request", "invoice issue", "charged twice", "subscription cancellation"],
            "Support": ["how do i", "login problem", "account settings", "password reset", "general inquiry"],
            "Feature Request": ["new functionality", "suggestion for app", "it would be great if", "add a button for"],
            "Security": ["hacked account", "unauthorized login", "data breach", "suspicious activity", "security vulnerability"],
            "Performance": ["slow loading", "lagging", "high latency", "application is sluggish", "timeout"],
            "Noise": ["thank you", "out of office", "newsletter", "auto-reply", "best regards"]
        }

        self.priority_anchors = {
            "High": ["urgent action required", "system is down", "blocked from working", "immediate security threat"],
            "Low": ["just checking in", "minor question", "whenever you have time", "non-urgent feedback"]
        }

        self.reference_embeddings = {cat: self.model.encode(texts) for cat, texts in self.categories.items()}
        self.high_priority_emb = self.model.encode(self.priority_anchors["High"])
        self.low_priority_emb = self.model.encode(self.priority_anchors["Low"])

    def _softmax(self, x, temperature=0.05):
        e_x = np.exp((x - np.max(x)) / temperature)
        return e_x / e_x.sum()

    def classify(self, text):
        if not text or len(text) < 5:
            return {"primary_category": "Other", "priority": "Low", "all_labels": []}

        query_emb = self.model.encode([text])

        # Category Similarity
        cat_scores = {cat: np.max(cosine_similarity(query_emb, ref_embs)[0]) for cat, ref_embs in self.reference_embeddings.items()}
        sorted_cats = sorted(cat_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Softmax Confidence
        top_raw = [s[1] for s in sorted_cats[:3]]
        conf = self._softmax(top_raw)

        # Priority Engine
        high_sim = np.max(cosine_similarity(query_emb, self.high_priority_emb)[0])
        low_sim = np.max(cosine_similarity(query_emb, self.low_priority_emb)[0])
        priority = "High" if (high_sim > 0.45 or any(k in text.lower() for k in ["urgent", "crash", "blocked"])) else ("Low" if low_sim > 0.4 else "Medium")

        primary = "Other" if (sorted_cats[0][0] == "Noise") else sorted_cats[0][0]
        
        return {
            "primary_category": primary,
            "all_labels": [{"label": sorted_cats[0][0], "confidence": round(float(conf[0]*100),1)}, {"label": sorted_cats[1][0], "confidence": round(float(conf[1]*100),1)}],
            "priority": priority,
            "assigned_team": {"Bug":"Engineering","Billing":"Finance","Support":"Customer Success","Security":"Cybersecurity"}.get(primary, "General Support"),
            "confidence_score": float(sorted_cats[0][1]),
            "summary": text[:120] + "..."
        }

triage_system = EmailTriageAI()

def classify_email(text):
    return triage_system.classify(text)