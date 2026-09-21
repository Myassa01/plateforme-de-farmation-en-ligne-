from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies.auth import get_current_user, require_role
from app.models.user import User, UserRole
from app.schemas.certificate import CertificateCreate, CertificateOut, CertificateSettingsOut
from app.services.certificate_service import CertificateService

router = APIRouter(tags=["certificates"])


@router.get("/certificates/settings", response_model=CertificateSettingsOut)
def get_certificate_settings(
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    return CertificateService(db).get_settings()


@router.post("/certificates/settings/background", response_model=CertificateSettingsOut)
def upload_certificate_background(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(UserRole.ADMIN)),
    file: UploadFile = File(...),
):
    return CertificateService(db).upload_background(file)


@router.post("/certificates", response_model=CertificateOut, status_code=status.HTTP_201_CREATED)
def create_certificate(
    payload: CertificateCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(UserRole.ADMIN)),
):
    return CertificateService(db).create_certificate(admin.id, payload)


@router.get("/certificates/me", response_model=list[CertificateOut])
def list_my_certificates(
    db: Session = Depends(get_db),
    student: User = Depends(require_role(UserRole.STUDENT)),
):
    return CertificateService(db).list_for_student(student.id)


@router.get("/certificates", response_model=list[CertificateOut])
def list_all_certificates(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role(UserRole.ADMIN)),
):
    return CertificateService(db).list_all()
