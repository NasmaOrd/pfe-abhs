import pandas as pd
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import time
import os

EXCEL_PATH = "data.xlsx"
SPREADSHEET_ID = "1_JenBcat2ISgihwpHpjAXr-LRHFbXRDQYMl51eIxSxw"

class FileChangeHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith(EXCEL_PATH):
            print("📂 Fichier modifié, synchronisation...")
            try:
                update_google_sheet()
            except Exception as e:
                print("❌ Erreur pendant la synchronisation :", str(e))

def update_google_sheet():
    if not os.path.exists(EXCEL_PATH):
        print("❌ Le fichier Excel n'existe pas.")
        return

    # Lire les données
    df = pd.read_excel(EXCEL_PATH, dtype=str)  # ✅ Lire tout en texte (cellules vides = '')
    df = df.fillna('')  # ✅ Laisse les cellules vides vides

    if df.empty:
        print("⚠️ Fichier Excel vide. Synchronisation annulée.")
        return

    # Authentification Google Sheets
    scope = ["https://spreadsheets.google.com/feeds",
             "https://www.googleapis.com/auth/drive"]
    creds = ServiceAccountCredentials.from_json_keyfile_name("credentials.json", scope)
    client = gspread.authorize(creds)

    # Ouvrir la feuille
    sheet = client.open_by_key(SPREADSHEET_ID).sheet1

    # Préparation des données à envoyer
    data = [df.columns.tolist()] + df.values.tolist()

    # Mise à jour
    sheet.clear()
    sheet.update(data)
    print("✅ Google Sheet mis à jour avec", len(df), "lignes.")

if __name__ == "__main__":
    print("🕵️‍♂️ Surveillance du fichier data.xlsx...")
    event_handler = FileChangeHandler()
    observer = Observer()
    observer.schedule(event_handler, path='.', recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
