import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings


class EmailService:
    def send_password_reset_email(self, to_email: str, reset_link: str) -> None:
        subject = "Réinitialisation de votre mot de passe LearnHub"
        body = (
            "Bonjour,\n\n"
            "Vous avez demandé la réinitialisation de votre mot de passe LearnHub.\n"
            f"Cliquez sur le lien suivant pour définir un nouveau mot de passe :\n{reset_link}\n\n"
            "Ce lien est valable 1 heure. Si vous n'êtes pas à l'origine de cette demande, "
            "ignorez cet email.\n\n"
            "L'équipe LearnHub"
        )
        self._send(to_email, subject, body)

    def _send(self, to_email: str, subject: str, body: str) -> None:
        message = MIMEMultipart()
        message["From"] = settings.smtp_from_email
        message["To"] = to_email
        message["Subject"] = subject
        message.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            if settings.smtp_username:
                server.login(settings.smtp_username, settings.smtp_password)
            server.sendmail(settings.smtp_from_email, [to_email], message.as_string())
