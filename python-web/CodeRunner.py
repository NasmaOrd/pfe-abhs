import streamlit as st

st.set_page_config(page_title="Exécuteur de Code - ABHS", layout="wide")

st.title("💻 Exécution de Code Python")

code_input = st.text_area("✍️ Entrez votre code Python ici :", height=200)

if st.button("▶️ Exécuter"):
    try:
        exec_globals = {}
        exec(code_input, exec_globals)
        st.success("✅ Code exécuté avec succès.")
        for var, val in exec_globals.items():
            if var != "__builtins__":
                st.write(f"🔍 {var} = {val}")
    except Exception as e:
        st.error(f"❌ Erreur dans le code : {e}")
