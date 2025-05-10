import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
from fpdf import FPDF
import base64
import tempfile
import io

st.set_page_config(page_title="Explorateur CSV/Excel", layout="wide")

st.title("📊 Explorateur de données CSV/Excel avec génération de rapport PDF")

uploaded_file = st.file_uploader("📁 Téléchargez votre fichier CSV ou Excel", type=["csv", "xls", "xlsx"])

if uploaded_file is not None:
    file_type = uploaded_file.name.split('.')[-1]

    if file_type in ['xls', 'xlsx']:
        df = pd.read_excel(uploaded_file)
        st.success("✅ Fichier Excel chargé avec succès.")

        csv = df.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="⬇️ Télécharger la version CSV",
            data=csv,
            file_name="converted.csv",
            mime='text/csv'
        )
    else:
        df = pd.read_csv(uploaded_file)
        st.success("✅ Fichier CSV chargé avec succès.")

    st.subheader("Aperçu des données brutes")
    st.dataframe(df.head())

    df_clean = df.dropna()
    st.subheader("Données après nettoyage (valeurs manquantes supprimées)")
    st.dataframe(df_clean.head())

    st.sidebar.header("Paramètres de sélection")
    selected_columns = st.sidebar.multiselect(
        "Sélectionnez les colonnes à afficher",
        df_clean.columns.tolist(),
        default=df_clean.columns.tolist()
    )
    num_rows = st.sidebar.slider(
        "Nombre de lignes à afficher",
        min_value=1,
        max_value=len(df_clean),
        value=min(5, len(df_clean))
    )

    df_selected = df_clean[selected_columns].head(num_rows)
    st.subheader("Données sélectionnées")
    st.dataframe(df_selected)

    st.sidebar.header("Paramètres de visualisation")
    chart_type = st.sidebar.selectbox("Type de graphique", ["Barres", "Lignes", "Secteurs"])
    column_for_chart = st.sidebar.selectbox("Colonne pour le graphique", selected_columns)

    st.subheader("Visualisation")
    fig, ax = plt.subplots()
    try:
        if chart_type == "Barres":
            df_selected[column_for_chart].value_counts().plot(kind='bar', ax=ax)
        elif chart_type == "Lignes":
            df_selected[column_for_chart].plot(kind='line', ax=ax)
        elif chart_type == "Secteurs":
            df_selected[column_for_chart].value_counts().plot(kind='pie', ax=ax, autopct='%1.1f%%')
        st.pyplot(fig)
    except Exception as e:
        st.error(f"Erreur lors de l'affichage du graphique : {e}")

    if st.button("📄 Générer le rapport PDF"):
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmpfile:
            fig.savefig(tmpfile.name)
            tmpfile.seek(0)
            image_path = tmpfile.name

        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt="Rapport de données", ln=True, align='C')
        pdf.ln(10)
        pdf.image(image_path, x=10, y=30, w=pdf.w - 20)

        pdf_bytes = pdf.output(dest='S').encode('latin1')
        pdf_buffer = io.BytesIO(pdf_bytes)

        b64 = base64.b64encode(pdf_buffer.getvalue()).decode()
        href = f'<a href="data:application/octet-stream;base64,{b64}" download="rapport.pdf">📥 Télécharger le rapport PDF</a>'
        st.markdown(href, unsafe_allow_html=True)
