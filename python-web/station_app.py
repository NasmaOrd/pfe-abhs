import streamlit as st
import pandas as pd
import base64
import io

params = st.query_params
station_id = params.get("station", "Inconnue")
filename = params.get("filename", None)
filedata = params.get("filedata", None)

st.title(f"Station ID : {station_id}")

if filedata and filename:
    st.subheader("Fichier reçu depuis React")

    try:
        # Nettoyage du préfixe base64
        if filedata.startswith("data:"):
            filedata = filedata.split(",")[1]

        decoded = base64.b64decode(filedata)
        buffer = io.BytesIO(decoded)

        if filename.endswith(".csv"):
            df = pd.read_csv(buffer)
        elif filename.endswith(".xlsx"):
            df = pd.read_excel(buffer)
        else:
            st.error("Format de fichier non pris en charge.")
            df = None

        if df is not None:
            st.write("Aperçu des données :", df.head())
            st.line_chart(df.iloc[:, 1])  # Supposé: 1ère colonne = date, 2e = valeur
    except Exception as e:
        st.error(f"Erreur lors du traitement : {str(e)}")
else:
    st.info("Veuillez envoyer un fichier via l’interface React.")
