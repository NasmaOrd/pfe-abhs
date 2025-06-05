import "./new.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState } from "react";

/**
 * Composant New
 * 
 * Affiche un formulaire pour ajouter un nouvel employé, avec :
 * - Une barre latérale (Sidebar)
 * - Une barre de navigation (Navbar)
 * - Un titre personnalisable
 * - Une prévisualisation de la photo de profil uploadée
 * - Un formulaire dynamique avec des champs passés en props
 * - Un bouton pour soumettre le formulaire
 * 
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.inputs - Liste des champs de formulaire à afficher.
 * Chaque objet input doit contenir :
 *  - id {string} : identifiant unique du champ
 *  - label {string} : texte affiché comme label du champ
 *  - type {string} : type HTML de l'input (ex : "text", "email", "password")
 *  - placeholder {string} : texte d'indication dans l'input
 * @param {string} [props.title="Ajouter un employé"] - Titre affiché en haut du formulaire.
 * 
 * @returns {JSX.Element} Composant React affichant la page d'ajout d'un employé.
 */
const New = ({ inputs, title = "Ajouter un employé" }) => {
  // État local pour stocker le fichier image sélectionné
  const [file, setFile] = useState(null);

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />

        {/* Titre de la page */}
        <div className="top">
          <h1>{title}</h1>
        </div>

        <div className="bottom">
          {/* Partie gauche : aperçu de l'image sélectionnée */}
          <div className="left">
            <img
              src={
                file
                  ? URL.createObjectURL(file) // Affiche l'image choisie
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg" // Image par défaut
              }
              alt="photo employé"
            />
          </div>

          {/* Partie droite : formulaire de saisie */}
          <div className="right">
            <form>
              {/* Upload de la photo */}
              <div className="formInput">
                <label htmlFor="file">
                  Photo de profil :{" "}
                  <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])} // Mise à jour du fichier choisi
                  style={{ display: "none" }} // Input caché, on clique sur le label
                />
              </div>

              {/* Champs du formulaire dynamiques passés en props */}
              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label htmlFor={input.id}>{input.label}</label>
                  <input
                    id={input.id}
                    type={input.type}
                    placeholder={input.placeholder}
                  />
                </div>
              ))}

              {/* Bouton de soumission */}
              <button type="submit">Créer</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;
