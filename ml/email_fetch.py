import imaplib, email, re, html
from email.header import decode_header
from bs4 import BeautifulSoup

class EmailIngestor:
    def __init__(self, host, user, password):
        self.host, self.user, self.password = host, user, password
        self.mail = None

    def __enter__(self):
        self.mail = imaplib.IMAP4_SSL(self.host)
        self.mail.login(self.user, self.password)
        self.mail.select("INBOX")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.mail: self.mail.logout()

    def clean_text(self, text, subject):
        if not text: return subject
        text = html.unescape(text).replace('\r', '')
        # Robust Stripping
        for p in [r"\nOn .* wrote:", r"\nFrom:.*Sent:", r"\n-{5,}.*forwarded message.*-{5,}", r"\n--\s*$"]:
            text = re.split(p, text, flags=re.IGNORECASE | re.DOTALL)[0]
        text = re.sub(r'\s+', ' ', text).strip()
        return text if len(text) > 20 else subject

    def fetch_latest(self, limit=10):
        _, messages = self.mail.search(None, "ALL")
        ids = messages[0].split()[-limit:]
        results = []
        for e_id in reversed(ids):
            _, data = self.mail.fetch(e_id, "(RFC822)")
            msg = email.message_from_bytes(data[0][1])
            subject = "".join([str(t[0], t[1] or 'utf-8') if isinstance(t[0], bytes) else t[0] for t in decode_header(msg.get("Subject", ""))])
            
            body = ""
            if msg.is_multipart():
                for part in msg.walk():
                    if part.get_content_type() == "text/plain": body += part.get_payload(decode=True).decode(errors='replace')
            else: body = msg.get_payload(decode=True).decode(errors='replace')

            cleaned = self.clean_text(body, subject)
            results.append({"id": e_id.decode(), "from": msg.get("From"), "subject": subject, "body": cleaned})
        return results

def fetch_emails(u, p):
    with EmailIngestor("imap.gmail.com", u, p) as ing: return ing.fetch_latest()