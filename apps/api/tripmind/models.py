"""
Pydantic models — schema cho request/response (validate đầu vào theo 5.4/5.5).
"""
from typing import Literal
from pydantic import BaseModel, EmailStr, Field

Priority = Literal["high", "medium", "low"]


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str | None = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class GenerateIn(BaseModel):
    destination: str = Field(min_length=1)
    days: int = Field(ge=1, le=30)
    budget: float = Field(gt=0)
    preferences: list[str] = []


class TripSaveIn(BaseModel):
    destination: str
    days: int = Field(ge=1, le=30)
    budget: float = Field(gt=0)
    estimated_cost: float = 0
    preferences: list[str] = []
    itinerary: list[dict]


class PriorityUpdateIn(BaseModel):
    priority: Priority
