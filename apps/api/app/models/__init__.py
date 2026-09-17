"""Import every model here so Base.metadata is complete for Alembic autogenerate."""

from app.models.application import ATTESTATION_VERSION, Application, ApplicationStatus
from app.models.board_member import BoardMember
from app.models.invite import Invite
from app.models.listing import Listing
from app.models.password_reset import PasswordReset
from app.models.resource import Resource, ResourceCategory, ResourceKind
from app.models.site_content import SiteContent
from app.models.subscriber import Subscriber
from app.models.training import Training, TrainingFormat, TrainingStatus
from app.models.user import Role, User, UserStatus

__all__ = [
    "ATTESTATION_VERSION",
    "Application",
    "ApplicationStatus",
    "BoardMember",
    "Invite",
    "Listing",
    "PasswordReset",
    "Resource",
    "ResourceCategory",
    "ResourceKind",
    "Role",
    "SiteContent",
    "Subscriber",
    "Training",
    "TrainingFormat",
    "TrainingStatus",
    "User",
    "UserStatus",
]
