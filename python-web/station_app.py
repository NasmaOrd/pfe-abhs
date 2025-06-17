import streamlit as st
import pandas as pd
import requests
import io

params = st.experimental_get_query_params()
station_id = params.get("station", ["Inconnue"])[0]
fileurl = params.get("fileurl", [None])[0]

st.title(f"Station ID : {station_id}")

if fileurl:
    st.subheader("Fichier récupéré depuis l'URL")

    try:
        # Télécharger le fichier via requests
        response = requests.get(fileurl)
        response.raise_for_status()
        buffer = io.BytesIO(response.content)

        # Déduire le type de fichier via l'extension dans l'URL
        if fileurl.endswith(".csv"):
            df = pd.read_csv(buffer)
        elif fileurl.endswith(".xlsx"):
            df = pd.read_excel(buffer)
        else:
            st.error("Format de fichier non pris en charge.")
            df = None

        if df is not None:
            st.write("Aperçu des données :", df.head())
            st.line_chart(df.iloc[:, 1])  # Affiche la 2ème colonne
    except Exception as e:
        st.error(f"Erreur lors du téléchargement ou traitement : {e}")
else:
    st.info("Veuillez envoyer un fichier via l’interface React.")
