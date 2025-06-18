import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os

# --- Fonction pour parser la date au format français ---
def parse_date_custom(date_str):
    mois_dict = {
        "Janvier":"01", "Février":"02", "Mars":"03", "Avril":"04", "Mai":"05",
        "Juin":"06", "Juillet":"07", "Août":"08", "Septembre":"09",
        "Octobre":"10", "Novembre":"11", "Décembre":"12"
    }
    if pd.isna(date_str):
        return pd.NaT
    for mois, num in mois_dict.items():
        if mois in date_str:
            date_str = date_str.replace(mois, num)
            break
    try:
        return pd.to_datetime(date_str, format="%d-%m-%Y", errors='coerce')
    except:
        return pd.NaT

# --- Chargement du fichier ---
def charger_donnees(fichier):
    chemin_complet = os.path.join('..', 'backend', 'uploads', fichier)
    if not os.path.isfile(chemin_complet):
        st.error(f"Fichier introuvable : {chemin_complet}")
        return None
    try:
        if fichier.endswith('.xlsx') or fichier.endswith('.xls'):
            df = pd.read_excel(chemin_complet)
        else:
            df = pd.read_csv(chemin_complet)
        return df
    except Exception as e:
        st.error(f"Erreur chargement fichier: {e}")
        return None

# --- Préparation des données ---
def preparation_donnees(df):
    date_col = "Date"
    precip_col = "Valeur"

    if date_col not in df.columns or precip_col not in df.columns:
        st.error(f"Les colonnes '{date_col}' et/ou '{precip_col}' sont manquantes.")
        return None
    
    df[date_col] = df[date_col].apply(parse_date_custom)
    df = df.dropna(subset=[date_col, precip_col])

    df[precip_col] = pd.to_numeric(df[precip_col], errors='coerce')
    df = df.dropna(subset=[precip_col])
    
    # Calcul année hydrologique (année commençant en septembre)
    df['AnneeHydrologique'] = df[date_col].apply(lambda x: x.year if x.month < 9 else x.year + 1)
    df['Mois'] = df[date_col].dt.month
    df['Jour'] = df[date_col].dt.day

    return df

# --- Calcul de défaillance ---
def calcul_defaillance(df, seuil=1.0):
    # Défaillance = précipitations inférieures au seuil
    df['Defaillance'] = df['Valeur'] < seuil
    return df

# --- Affichage graphique ---
def afficher_graphique(df, afficher_defaillance=True):
    plt.figure(figsize=(12,5))
    plt.plot(df['Date'], df['Valeur'], label='Précipitations')
    if afficher_defaillance:
        defaillances = df[df['Defaillance']]
        plt.scatter(defaillances['Date'], defaillances['Valeur'], color='orange', label='Défaillances')
    plt.title("Précipitations journalières avec défaillances détectées")
    plt.xlabel("Date")
    plt.ylabel("Précipitations (mm)")
    plt.legend()
    plt.tight_layout()
    st.pyplot(plt.gcf())
    plt.close()

# --- Statistiques mensuelles ---
def stats_mensuelles(df):
    stats = df.groupby('Mois')['Valeur'].agg(['mean','std','count']).rename(
        columns={'mean':'Moyenne', 'std':'EcartType', 'count':'NombreJours'}
    )
    return stats

# --- Streamlit ---

st.set_page_config(page_title="Analyse Hydrologique - Défaillance", layout="wide")
st.title("🌧️ Analyse Hydrologique des Précipitations avec Défaillance")

query_params = st.experimental_get_query_params()
nom_fichier = query_params.get('file', [None])[0]

if not nom_fichier:
    st.warning("Aucun fichier spécifié. Ajoutez `?file=nomdufichier.csv` dans l'URL.")
    st.stop()

df = charger_donnees(nom_fichier)
if df is None:
    st.stop()

df = preparation_donnees(df)
if df is None:
    st.stop()

# Sidebar
st.sidebar.header("Filtres et options")

mois_choisis = st.sidebar.multiselect(
    "Filtrer par mois (1=Janvier, ..., 12=Décembre)",
    options=list(range(1,13)),
    default=list(range(1,13))
)

seuil_defaillance = st.sidebar.number_input("Seuil de précipitations (mm) pour défaillance", value=1.0, step=0.1)

afficher_tableau = st.sidebar.checkbox("Afficher les données brutes", value=False)
afficher_defaillance = st.sidebar.checkbox("Afficher les défaillances sur graphique", value=True)
afficher_stats = st.sidebar.checkbox("Afficher statistiques mensuelles", value=True)

# Appliquer filtre mois
df = df[df['Mois'].isin(mois_choisis)]

# Calcul défaillance
df = calcul_defaillance(df, seuil=seuil_defaillance)

# Affichage

if afficher_tableau:
    st.write(f"## Données brutes (filtrées) du fichier : {nom_fichier}")
    st.dataframe(df)

st.write("## Liste des jours en défaillance")
df_defaillances = df[df['Defaillance']].sort_values(by='Date')
if df_defaillances.empty:
    st.info("Aucune défaillance détectée selon le seuil défini.")
else:
    st.dataframe(df_defaillances[['Date', 'Jour', 'Mois', 'AnneeHydrologique', 'Valeur']])

st.write("## Visualisation des précipitations avec défaillances")
afficher_graphique(df, afficher_defaillance=afficher_defaillance)

if afficher_stats:
    st.write("## Statistiques mensuelles des précipitations")
    st.dataframe(stats_mensuelles(df).loc[mois_choisis])
