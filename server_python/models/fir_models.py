from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class Complainant(BaseModel):
    name: Optional[str] = Field(default="Not stated")
    fatherOrHusbandName: Optional[str] = Field(default=None)
    age: Optional[str] = Field(default="Not stated")
    address: Optional[str] = Field(default="Not stated")
    phone: Optional[str] = Field(default="Not stated")

class Incident(BaseModel):
    crimeType: Optional[str] = Field(default="Cognizable Offence")
    date: Optional[str] = Field(default="Not stated")
    time: Optional[str] = Field(default="Not stated")
    location: Optional[str] = Field(default="Not stated")
    description: Optional[str] = Field(default="")

class Accused(BaseModel):
    name: Optional[str] = Field(default="Unknown person(s)")
    description: Optional[str] = Field(default="Unidentified")
    relationship: Optional[str] = Field(default="Stranger")

class Witness(BaseModel):
    name: Optional[str] = Field(default="")
    address: Optional[str] = Field(default="Not stated")

class Property(BaseModel):
    item: Optional[str] = Field(default="")
    value: Optional[str] = Field(default="Not stated")
    description: Optional[str] = Field(default="")

class VerifiedBy(BaseModel):
    name: Optional[str] = Field(default="Inspecting Duty Officer")
    rank: Optional[str] = Field(default="Inspector of Police")
    badgeNumber: Optional[str] = Field(default="TN-POL-8842")
    station: Optional[str] = Field(default="Anna Nagar Police Station (K-4)")

class FIRCase(BaseModel):
    firId: str
    createdBy: Optional[str] = "officer_demo_001"
    policeStation: Optional[str] = "Anna Nagar Police Station (K-4)"
    district: Optional[str] = "Chennai City Police"
    language: Optional[str] = "en"
    languageName: Optional[str] = "English"
    nativeTranscript: Optional[str] = ""
    englishTranscript: Optional[str] = ""
    complainant: Optional[Complainant] = Field(default_factory=Complainant)
    incident: Optional[Incident] = Field(default_factory=Incident)
    accused: Optional[List[Accused]] = Field(default_factory=list)
    witnesses: Optional[List[Witness]] = Field(default_factory=list)
    evidence: Optional[List[str]] = Field(default_factory=list)
    property: Optional[List[Property]] = Field(default_factory=list)
    sections: Optional[List[str]] = Field(default_factory=list)
    narrative: Optional[str] = ""
    narrative_ta: Optional[str] = ""
    narrative_hi: Optional[str] = ""
    status: Optional[str] = "draft"
    verified: Optional[bool] = False
    verifiedBy: Optional[VerifiedBy] = None
    verifiedAt: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class GenerateFIRRequest(BaseModel):
    nativeTranscript: Optional[str] = ""
    englishTranscript: Optional[str] = ""
    language: Optional[str] = "en"
    languageName: Optional[str] = "English"
    station: Optional[str] = None
    district: Optional[str] = None
    groqApiKey: Optional[str] = None
