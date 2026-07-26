from datetime import date
from enum import Enum

from pydantic import BaseModel, Field, ValidationInfo, field_validator


class Status(str, Enum):
    TODO = "ToDo"
    IN_PROGRESS = "InProgress"
    DONE = "Done"


class Priority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class TaskInput(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = Field(default="", max_length=1000)
    status: Status = Status.TODO
    priority: Priority = Priority.MEDIUM
    assignee: str = Field(default="", max_length=80)
    due_date: date | None = None
    tags: list[str] = Field(default_factory=list, max_length=8)

    @field_validator("title", "assignee")
    @classmethod
    def strip_text(cls, value: str, info: ValidationInfo) -> str:
        value = value.strip()
        if not value and info.field_name == "title":
            raise ValueError("Title cannot be blank")
        return value

    @field_validator("description")
    @classmethod
    def strip_description(cls, value: str) -> str:
        return value.strip()

    @field_validator("tags")
    @classmethod
    def clean_tags(cls, tags: list[str]) -> list[str]:
        cleaned: list[str] = []
        for tag in tags:
            tag = tag.strip().lower()
            if not tag:
                continue
            if len(tag) > 24:
                raise ValueError("Each tag must be 24 characters or fewer")
            if tag not in cleaned:
                cleaned.append(tag)
        return cleaned


class TaskCreate(TaskInput):
    pass


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=1000)
    status: Status | None = None
    priority: Priority | None = None
    assignee: str | None = Field(default=None, max_length=80)
    due_date: date | None = None
    tags: list[str] | None = Field(default=None, max_length=8)

    @field_validator("title", "assignee", "description")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return value
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank")
        return value

    @field_validator("tags")
    @classmethod
    def clean_optional_tags(cls, tags: list[str] | None) -> list[str] | None:
        if tags is None:
            return None
        return TaskInput.clean_tags(tags)


class Task(TaskInput):
    id: int
