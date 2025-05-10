import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt  # Ajout de l'importation plt
import seaborn as sns
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from sklearn.impute import SimpleImputer  # Pour imputer les valeurs manquantes
import tempfile
import io
import sys
import io

# Configuration de la page
st.set_page_config(page_title="ABHS - Explorateur de Données", layout="wide")

# Titre de l'application
st.title("📁 ABHS - Explorateur de Données")

# Barres de navigation
menu = ["Accueil", "Visualisation", "Prédiction", "Exécuter du Code"]
page = st.sidebar.selectbox("Sélectionnez une page", menu)

# Simuler le fichier Excel reçu
uploaded_file = "outputof_AIN SEBOU.xlsx"

# Logique en fonction de la page sélectionnée
if page == "Accueil":
    st.markdown("**Fichier simulé reçu depuis React (Excel local)**")
    
    try:
        # Charger le fichier Excel
        df = pd.read_excel(uploaded_file)
        st.success("✅ Fichier Excel chargé avec succès.")
        st.dataframe(df.head(20))
        st.session_state.df = df  # Partage avec d'autres pages
    except Exception as e:
        st.error(f"❌ Erreur lors du chargement : {e}")
        
elif page == "Visualisation":
    if "df" not in st.session_state:
        st.warning("Veuillez d'abord charger un fichier dans la page Accueil.")
    else:
        df = st.session_state.df
        st.sidebar.header("Options de graphique")
        
        # Paramètres pour sélectionner les colonnes, la valeur et le nombre de lignes
        num_cols = df.select_dtypes(include=['float', 'int']).columns.tolist()
        selected_col = st.sidebar.selectbox("Sélectionner la colonne pour le graphique", num_cols)
        chart_type = st.sidebar.selectbox("Type de graphique", ["Barres", "Lignes", "Secteurs", "Heatmap", "Bulles"])
        num_rows = st.sidebar.slider("Nombre de lignes à afficher", min_value=1, max_value=50, value=10)

        # Sélectionner les lignes à afficher
        df_selected = df[selected_col].head(num_rows)
        
        st.subheader("Aperçu des données sélectionnées")
        st.dataframe(df_selected)
        
        # Génération des graphiques
        st.subheader("Graphique généré")
        fig, ax = plt.subplots()

        if chart_type == "Barres":
            df_selected.value_counts().plot(kind='bar', ax=ax)
        elif chart_type == "Lignes":
            df_selected.plot(kind='line', ax=ax)
        elif chart_type == "Secteurs":
            df_selected.value_counts().plot(kind='pie', autopct='%1.1f%%', ax=ax)
        elif chart_type == "Heatmap":
            sns.heatmap(df.corr(), annot=True, cmap="coolwarm", ax=ax)
        elif chart_type == "Bulles":
            if len(num_cols) >= 3:
                df.plot.scatter(x=num_cols[0], y=num_cols[1], s=df[num_cols[2]]*10, alpha=0.5, ax=ax)
            else:
                st.warning("Besoin de 3 colonnes numériques pour afficher un graphique de type bulles.")

        st.pyplot(fig)
        
elif page == "Prédiction":
    if "df" not in st.session_state:
        st.warning("Veuillez charger les données d'abord.")
    else:
        df = st.session_state.df
        st.write("Sélectionnez une colonne numérique pour effectuer une prédiction.")

        num_cols = df.select_dtypes(include=['float', 'int']).columns.tolist()
        target_col = st.selectbox("Colonne cible", num_cols)

        # Sélectionner une colonne pour les caractéristiques (X) et une colonne pour la cible (y)
        feature_cols = st.multiselect("Colonnes des caractéristiques (X)", df.columns.tolist(), default=num_cols[:2])

        # Gestion des valeurs manquantes
        imputer = SimpleImputer(strategy='mean')  # Imputation des valeurs manquantes par la moyenne
        df[feature_cols] = imputer.fit_transform(df[feature_cols])

        # Diviser les données en ensemble d'entraînement et de test
        X = df[feature_cols]
        y = df[target_col]
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Créer et entraîner un modèle de régression linéaire
        model = LinearRegression()
        model.fit(X_train, y_train)

        # Faire des prédictions sur l'ensemble de test
        y_pred = model.predict(X_test)

        # Calculer l'erreur quadratique moyenne (MSE)
        mse = mean_squared_error(y_test, y_pred)

        # Afficher les résultats
        st.subheader(f"Résultats de la prédiction")
        st.write(f"Le modèle de régression linéaire a une erreur quadratique moyenne (MSE) de : {mse:.2f}")

        # Afficher les prédictions réelles vs prédites
        comparison = pd.DataFrame({"Réel": y_test, "Prédit": y_pred})
        st.write(comparison.head(10))

        # Afficher un graphique de la prédiction
        fig, ax = plt.subplots()
        ax.scatter(y_test, y_pred)
        ax.plot([min(y_test), max(y_test)], [min(y_test), max(y_test)], 'r--', lw=2)
        ax.set_xlabel('Valeurs réelles')
        ax.set_ylabel('Valeurs prédites')
        ax.set_title('Régression Linéaire : Prédictions vs Réelles')
        st.pyplot(fig)

elif page == "Exécuter du Code":
    st.title("💻 Exécution de Code Python")
    
    # Zone de texte pour entrer du code Python
    code_input = st.text_area("✍️ Entrez votre code Python ici :", height=200)
    
    # Zone de sortie pour afficher les résultats du code exécuté
    output_area = st.empty()

    if st.button("▶️ Exécuter"):
        try:
            # Rediriger la sortie standard vers la zone d'affichage Streamlit
            output = io.StringIO()
            sys.stdout = output
            
            # Exécuter le code Python
            exec(code_input)
            
            # Afficher la sortie
            output_value = output.getvalue()
            output_area.text(output_value)  # Affiche la sortie dans l'application Streamlit

            st.success("✅ Code exécuté avec succès.")
        except Exception as e:
            st.error(f"❌ Erreur dans le code : {e}")
