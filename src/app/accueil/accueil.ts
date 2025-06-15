import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-accueil',
  imports: [RouterModule, CommonModule],
  templateUrl: './accueil.html',
  styleUrl: './accueil.css'
})
export class Accueil {

   constructor(public router: Router) {}

   // ...existing code...
accordionItems = [
  {
    title: "Fonctionnalités",
    content: [
      "Interfaces de gestion des enseignants et des divisions avec un formulaire pour saisir, modifier, supprimer les données et un affichage sous forme de tableau.",
      "Interface simplifiée de constitution des services : chaque enseignant occupe une carte avec des boutons pour lui affecter ou enlever des divisions.",
      "Calculs automatisés en fonction des informations saisies et affichage de plusieurs informations en bas de page : apports postes, besoin en heures, heures à absorber en HSA ou à affecter aux BMP, HSA de l'équipe, nombre de divisions non affectées, noms des enseignants en sous-service.",
      "Exportation, importation d'une base de données en format JSON et effacement de la base de données utilisée.",
      "Exportation des données au format CSV pour chacune des trois interfaces de gestion."
    ]
  },
  {
    title: "Stockage et traitement des données",
    content: `Cette application utilise IndexedDB. C'est une base de données intégrée directement dans le navigateur, 
    permettant de stocker et gérer des données localement, sans dépendre d’un serveur externe.
    Contrairement aux applications web traditionnelles qui nécessitent une connexion à internet pour
    accéder aux données, IndexedDB permet de conserver vos informations directement sur votre
    ordinateur ou appareil mobile. Vous gardez donc non seulement un contrôle total sur vos données mais pouvez même utiliser
    l'application en mode hors connexion une fois la page chargée une première fois. Vos données resteront disponibles pour des utilisations ultérieures,
    tant que vous n'effacerez les données de votre navigateur.`,
  },
  {
    title: "Comment commencer ?",
    content: "Cliquez sur le bouton Démarrer ci-dessous pour ajouter vos enseignants, divisions et procéder à la répartition."
  }
];

openAccordion: number | null = null;
// ...existing code...
}
