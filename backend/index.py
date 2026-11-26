# Point d'entrée pour Vercel : il cherche une variable "app" dans ce fichier.
import sys
from pathlib import Path

# Le code est dans src/ : on l'ajoute au chemin de Python pour pouvoir l'importer
sys.path.insert(0, str(Path(__file__).parent / "src"))

from portfolio_api.main import app  # noqa: E402