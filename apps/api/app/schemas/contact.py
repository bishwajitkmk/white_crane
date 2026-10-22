from enum import StrEnum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ContactTopic(StrEnum):
    consultation = "consultation"
    training = "training"
    directory = "directory"
    general = "general"


TOPIC_LABELS = {
    ContactTopic.consultation: "Consultation for teams",
    ContactTopic.training: "Training",
    ContactTopic.directory: "DBT Clinical Directory",
    ContactTopic.general: "General question",
}


class ContactIn(BaseModel):
    # Trimmed before the length checks, so a message of only spaces is rejected.
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    organization: str = Field(default="", max_length=200)
    topic: ContactTopic = ContactTopic.general
    message: str = Field(min_length=1, max_length=5000)
    # Honeypot, see ApplicationIn.nickname.
    nickname: str = ""
