import os
import json
import shutil
import pandas as pd

# Use a relative path to the public folder inside the backend directory
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_FOLDER = os.path.join(BACKEND_DIR, 'public')
GENERATED_FOLDER = 'generated'

def process_xlsx_files(upload_folder):
    """
    Przetwarza pliki XLSX z folderu uploads i generuje pliki JSON.
    Ta funkcja to 'zaślepka' - musisz zaimplementować swoją logikę.
    """
    if not os.path.exists(GENERATED_FOLDER):
        os.makedirs(GENERATED_FOLDER)

    xlsx_files = [f for f in os.listdir(upload_folder) if f.endswith('.xlsx')]
    if not xlsx_files:
        raise Exception("Brak plików XLSX do przetworzenia.")

    # Przykładowa logika przetwarzania
    for file in xlsx_files:
        filepath = os.path.join(upload_folder, file)
        try:
            df = pd.read_excel(filepath)
            # Przykładowe przetwarzanie - zapisanie pierwszych 10 wierszy do JSON
            df.head(10).to_json(os.path.join(GENERATED_FOLDER, f'{file}.json'), orient='records')
        except Exception as e:
            print(f"Błąd podczas przetwarzania pliku {file}: {e}")
            raise e

def copy_json_to_public():
    """
    Kopiuje wygenerowane pliki JSON do folderu 'public'.
    """
    if not os.path.exists(GENERATED_FOLDER):
        raise Exception("Brak wygenerowanych danych. Uruchom 'generate-json' najpierw.")

    for filename in os.listdir(GENERATED_FOLDER):
        if filename.endswith('.json'):
            src_path = os.path.join(GENERATED_FOLDER, filename)
            dest_path = os.path.join(PUBLIC_FOLDER, filename)
            shutil.copy(src_path, dest_path)
    
    print("Pliki JSON skopiowane do folderu public.")