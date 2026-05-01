from abc import ABC, abstractmethod
from fastapi import UploadFile
from typing import Dict, Any

class BaseModel(ABC):
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model = None
        self.load_model()
    
    @abstractmethod
    def load_model(self):
        pass
    
    @abstractmethod
    async def predict(self, image: UploadFile) -> Dict[str, Any]:
        pass
    
    def is_loaded(self) -> bool:
        return self.model is not None
