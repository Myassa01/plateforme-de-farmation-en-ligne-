from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.certificate_settings import CertificateSettings


class CertificateSettingsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self) -> CertificateSettings | None:
        stmt = select(CertificateSettings).limit(1)
        return self.db.scalars(stmt).first()

    def save(self, settings: CertificateSettings) -> CertificateSettings:
        self.db.add(settings)
        self.db.commit()
        self.db.refresh(settings)
        return settings
