import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

st.set_page_config(page_title="Visualisation - ABHS", layout="wide")

st.title("📊 Visualisation des Données ABHS")

if "df" not in st.session_state:
    st.warning("Veuillez d'abord charger un fichier dans la page Accueil.")
else:
    df = st.session_state.df

    st.sidebar.header("Options de graphique")
    columns = df.select_dtypes(include=['float', 'int']).columns.tolist()
    selected = st.sidebar.selectbox("Colonne principale", columns)
    chart_type = st.sidebar.selectbox("Type", ["Barres", "Lignes", "Secteurs", "Heatmap", "Bulles"])

    st.subheader("Graphique généré")
    fig, ax = plt.subplots()

    if chart_type == "Barres":
        df[selected].value_counts().head(10).plot(kind='bar', ax=ax)
    elif chart_type == "Lignes":
        df[selected].head(50).plot(kind='line', ax=ax)
    elif chart_type == "Secteurs":
        df[selected].value_counts().head(5).plot(kind='pie', autopct='%1.1f%%', ax=ax)
    elif chart_type == "Heatmap":
        sns.heatmap(df[columns].corr(), annot=True, cmap="coolwarm", ax=ax)
    elif chart_type == "Bulles":
        if len(columns) >= 3:
            df.plot.scatter(x=columns[0], y=columns[1], s=df[columns[2]]*10, alpha=0.5, ax=ax)
        else:
            st.warning("Besoin de 3 colonnes numériques pour les bulles.")

    st.pyplot(fig)
