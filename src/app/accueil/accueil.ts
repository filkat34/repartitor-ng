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

   /**
    * Tableau contenant les éléments de l'accordéon.
    * Chaque élément a un titre et un contenu.
    */
accordionItems = [
  {
    title: "Fonctionnalités",
    content: [
      "Interfaces de gestion des enseignants et des divisions avec un formulaire pour saisir, modifier, supprimer les données et un affichage sous forme de tableau.",
      "Interface simplifiée de constitution des services : chaque enseignant occupe une carte avec des boutons pour lui affecter ou enlever des divisions avec affichage du service avec et sans pondérations ainsi que le nombre des HSA.",
      "Calculs automatisés en fonction des informations saisies et affichage de plusieurs informations en bas de page : apports postes, besoin en heures, nombre d'heures à absorber en HSA ou à affecter aux BMP, HSA de l'équipe, nombre de divisions non affectées, noms des enseignants en sous-service.",
      "Exportation, importation d'une base de données au format JSON et effacement de la base de données utilisée.",
      "Exportation des données au format CSV pour chacune des trois interfaces de gestion."
    ]
  },
  {
    title: "Stockage des données",
    content: `Cette application utilise IndexedDB. C'est une base de données intégrée directement dans le navigateur, 
    permettant de stocker et gérer des données localement, sans dépendre d’un serveur externe.
    Contrairement aux applications web traditionnelles qui nécessitent une connexion à internet pour
    accéder aux données, IndexedDB permet de conserver vos informations directement sur votre
    ordinateur ou appareil mobile. Vous gardez donc non seulement un contrôle total sur vos données mais pouvez même utiliser
    l'application en mode hors connexion une fois la page chargée une première fois. Vos données resteront disponibles pour des utilisations ultérieures,
    tant que vous n'effacerez pas les données de votre navigateur.`,
  },
  {
    title: "Portabilité des données",
    content: `Pour assurer la portabilité de vos données, l'application permet d'exporter et d'importer vos données au format JSON.
    Cela signifie que vous pouvez facilement sauvegarder vos données et les transférer vers une autre instance de l'application, sur un autre
    navitateur ou ordinateur.`
  }
];

/**
 * Variable pour gérer l'état de l'accordéon.
 * Si une valeur est définie, l'accordéon correspondant sera ouvert.
 */
openAccordion: number | null = null;

}
