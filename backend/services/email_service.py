# services/email_service.py
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from ..config import settings

logger = logging.getLogger(__name__)


async def send_email(to: str, subject: str, html_body: str) -> bool:
    """Send email asynchronously. Returns True on success, False on failure (non-fatal)."""
    if not settings.SMTP_HOST:
        logger.warning("SMTP not configured — email skipped: subject=%s to=%s", subject, to)
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM
        msg["To"] = to
        msg.attach(MIMEText(html_body, "html"))

        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER or None,
            password=settings.SMTP_PASSWORD or None,
            start_tls=settings.SMTP_TLS,
        )
        logger.info("Email sent to %s subject=%s", to, subject)
        return True
    except Exception as e:
        logger.error("Email send failed: %s", e)
        return False


def password_reset_html(name: str, reset_link: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<body style="font-family: 'DM Sans', Arial, sans-serif; background: #0A0C10; color: #F1F5F9; padding: 40px;">
  <div style="max-width: 480px; margin: 0 auto; background: #111318; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px;">
    <h2 style="color: #6366F1; font-size: 22px; margin-bottom: 8px;">Reset your password</h2>
    <p style="color: #94A3B8; margin-bottom: 24px;">Hi {name}, click the button below to reset your RecruitAI password. This link expires in 1 hour.</p>
    <a href="{reset_link}" style="display: inline-block; background: #6366F1; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
    <p style="color: #475569; font-size: 12px; margin-top: 24px;">If you didn't request this, ignore this email.</p>
  </div>
</body>
</html>"""


def interview_invite_html(
    candidate_name: str, job_title: str, date: str, time: str, link: str | None
) -> str:
    return f"""
<!DOCTYPE html>
<html>
<body style="font-family: 'DM Sans', Arial, sans-serif; background: #0A0C10; color: #F1F5F9; padding: 40px;">
  <div style="max-width: 480px; margin: 0 auto; background: #111318; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px;">
    <h2 style="color: #6366F1; font-size: 22px; margin-bottom: 8px;">Interview Scheduled</h2>
    <p style="color: #94A3B8;">Hi {candidate_name}, your interview for <strong style="color: #F1F5F9;">{job_title}</strong> is confirmed.</p>
    <div style="background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); border-radius: 10px; padding: 16px; margin: 20px 0;">
      <p style="margin: 4px 0; color: #94A3B8;">📅 {date} at {time}</p>
      {f'<p style="margin: 4px 0;"><a href="{link}" style="color: #6366F1;">Join Meeting</a></p>' if link else ''}
    </div>
    <p style="color: #475569; font-size: 12px;">Best of luck!</p>
  </div>
</body>
</html>"""
