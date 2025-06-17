import streamlit as st
import pandas as pd
import requests
import io
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

# Setup page
st.set_page_config(page_title="Lab complet Station Hydrologique", layout="wide")

# Récupère les paramètres station & fileurl
params = st.experimental_get_query_params()
station_id = params.get("station", ["Inconnue"])[0]
fileurl = params.get("fileurl", [None])[0]

st.title(f"Analyse complète - Station : {station_id}")

@st.cache_data
def load_data_from_url(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        buffer = io.BytesIO(response.content)
        if url.endswith(".csv"):
            df = pd.read_csv(buffer)
        elif url.endswith(".xlsx"):
            df = pd.read_excel(buffer)
        else:
            return None, "Format de fichier non supporté (seul CSV/XLSX)"
        return df, None
    except Exception as e:
        return None, str(e)

if not fileurl:
    st.warning("Aucun fichier fourni. Merci d'uploader via React ou fournir l'URL avec le paramètre 'fileurl'.")
    st.stop()

df, error = load_data_from_url(fileurl)
if error:
    st.error(f"Erreur de chargement : {error}")
    st.stop()

# Vérifier les colonnes attendues
expected_cols = {"Date", "Jour", "Mois", "Annee", "Valeur"}
missing_cols = expected_cols - set(df.columns)
if missing_cols:
    st.warning(f"Colonnes manquantes dans le fichier : {missing_cols}")

# Onglets
tabs = st.tabs(["Données", "Missing Values & Nettoyage", "Analyse & Visualisation", "Modélisation"])

with tabs[0]:
    st.header("Données brutes")
    st.write(f"Fichier chargé : {fileurl}")
    
    # Choix du nombre de lignes à afficher
    nb_lignes = st.slider("Nombre de lignes à afficher", min_value=5, max_value=len(df), value=20)
    st.dataframe(df.head(nb_lignes))

with tabs[1]:
    st.header("Gestion des valeurs manquantes")
    
    # Présentation des missing values
    missing_count = df.isnull().sum()
    missing_percent = (missing_count / len(df)) * 100
    missing_df = pd.DataFrame({"Count": missing_count, "Percent (%)": missing_percent})
    st.dataframe(missing_df)
    
    if missing_count.sum() > 0:
        st.subheader("Options de traitement des valeurs manquantes")
        action = st.radio("Choisir une méthode de traitement :", 
                          ("Supprimer lignes manquantes", "Imputer moyenne", "Imputer médiane", "Ne rien faire"))
        
        df_clean = df.copy()
        if action == "Supprimer lignes manquantes":
            df_clean = df_clean.dropna()
        elif action == "Imputer moyenne":
            for col in df_clean.select_dtypes(include=[np.number]).columns:
                df_clean[col] = df_clean[col].fillna(df_clean[col].mean())
        elif action == "Imputer médiane":
            for col in df_clean.select_dtypes(include=[np.number]).columns:
                df_clean[col] = df_clean[col].fillna(df_clean[col].median())
        else:
            df_clean = df.copy()
        
        st.write(f"Données après traitement ({len(df_clean)} lignes) :")
        st.dataframe(df_clean.head(20))
    else:
        st.info("Pas de valeurs manquantes détectées.")
        df_clean = df.copy()

with tabs[2]:
    st.header("Analyse & Visualisation")
    
    # Sélection de colonnes pour graphiques
    numeric_cols = df_clean.select_dtypes(include=[np.number]).columns.tolist()
    st.subheader("Histogrammes")
    col_hist = st.selectbox("Choisir colonne à visualiser", numeric_cols)
    fig, ax = plt.subplots()
    sns.histplot(df_clean[col_hist].dropna(), bins=30, kde=True, ax=ax)
    st.pyplot(fig)
    
    st.subheader("Boxplot")
    col_box = st.selectbox("Choisir colonne pour boxplot", numeric_cols, index=0)
    fig, ax = plt.subplots()
    sns.boxplot(x=df_clean[col_box], ax=ax)
    st.pyplot(fig)
    
    st.subheader("Série temporelle")
    if "Date" in df_clean.columns:
        df_clean["Date"] = pd.to_datetime(df_clean["Date"], errors='coerce')
        df_date = df_clean.dropna(subset=["Date"])
        st.line_chart(df_date.set_index("Date")[numeric_cols])
    else:
        st.info("Colonne 'Date' non présente pour série temporelle.")
    
    st.subheader("Matrice de corrélation")
    corr = df_clean[numeric_cols].corr()
    fig, ax = plt.subplots()
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", ax=ax)
    st.pyplot(fig)

with tabs[3]:
    st.header("Modélisation - Régression & Machine Learning")
    
    # On propose de prédire "Valeur"
    if "Valeur" not in df_clean.columns:
        st.warning("Colonne 'Valeur' non présente, impossible de faire la modélisation.")
        st.stop()
    
    # Choix des features (exclure Valeur)
    features = [c for c in numeric_cols if c != "Valeur"]
    if len(features) == 0:
        st.warning("Pas assez de colonnes numériques pour faire la modélisation.")
        st.stop()
    
    st.subheader("Choix des variables explicatives")
    selected_features = st.multiselect("Variables explicatives (features) :", features, default=features)
    
    if len(selected_features) == 0:
        st.warning("Sélectionnez au moins une variable explicative.")
        st.stop()
    
    # Préparation des données
    X = df_clean[selected_features]
    y = df_clean["Valeur"]
    
    # Suppression des lignes NaN sur ces colonnes
    data_model = pd.concat([X, y], axis=1).dropna()
    X = data_model[selected_features]
    y = data_model["Valeur"]
    
    # Split train/test
    test_size = st.slider("Taille du jeu de test (%)", 5, 50, 20)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size/100, random_state=42)
    
    st.write(f"Train size: {len(X_train)}, Test size: {len(X_test)}")
    
    # Choix du modèle
    model_choice = st.selectbox("Choisir un modèle :", ["Régression linéaire", "Random Forest Regressor"])
    
    if model_choice == "Régression linéaire":
        model = LinearRegression()
    else:
        model = RandomForestRegressor(random_state=42)
    
    # Entraînement
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    # Scores
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    st.subheader("Résultats")
    st.write(f"RMSE : {rmse:.3f}")
    st.write(f"R2-score : {r2:.3f}")
    
    # Graphique prédiction vs réel
    fig, ax = plt.subplots()
    ax.scatter(y_test, y_pred, alpha=0.7)
    ax.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--')
    ax.set_xlabel("Valeur Réelle")
    ax.set_ylabel("Valeur Prédite")
    ax.set_title(f"Prédiction vs Réel - {model_choice}")
    st.pyplot(fig)
