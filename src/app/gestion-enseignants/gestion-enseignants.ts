import { Component, OnInit } from '@angular/core';
import { Enseignant } from '../models/enseignant';
import { IndexedDb } from '../indexed-db';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-gestion-enseignants',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './gestion-enseignants.html',
  styleUrl: './gestion-enseignants.css'
})
export class GestionEnseignants implements OnInit {

  // Initialisations
  constructor(private db: IndexedDb) { }

  ngOnInit() {
    this.loadEnseignants();
  }


  /**
   * Propriétés du composant GestionEnseignants.
   * - `nouvelEnseignant`: Objet partiel pour stocker les données du nouvel enseignant à ajouter ou modifier.
   * - `enseignants`: Tableau d'enseignants chargés depuis la base de données.
   * - `enseignantSelectionne`: Enseignant actuellement sélectionné pour modification ou suppression.
   * - `isEditing`: Indicateur pour savoir si le composant est en mode édition (modification d'un enseignant).
   */
  nouvelEnseignant: Partial<Enseignant> = {};
  enseignants: Enseignant[] = [];
  enseignantSelectionne: Enseignant | null = null;
  isEditing = false; // Propriété pour gérer le mode édition


  /**
   * Méthode pour charger tous les enseignants depuis la base de données.
   * Elle est appelée lors de l'initialisation du composant.
   */
  async loadEnseignants() {
    this.enseignants = await this.db.getAllEnseignants(true);
  }


  /**
   * Méthode appelée lors de la soumission du formulaire pour ajouter ou modifier un enseignant.
   * Si un enseignant est sélectionné, il sera modifié, sinon un nouvel enseignant sera ajouté.
   * Les champs sont normalisés pour éviter les accents et mettre en majuscules.
   * Le service plancher est calculé en fonction des ORS et de la quotité.
   * Après l'ajout ou la modification, le formulaire est réinitialisé et la liste des enseignants est rechargée.
   * @returns {Promise<void>}
   * @async
   */
  async onSubmit() {
    if (this.isEditing && this.enseignantSelectionne) {
      // Modification
      const enseignant: Enseignant = {
        ...this.enseignantSelectionne,
        nom: this.nouvelEnseignant.nom!
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase(),
        corps: this.nouvelEnseignant.corps!,
        ors: this.nouvelEnseignant.ors!,
        quotite: this.nouvelEnseignant.quotite!,
        service_plancher: ((this.nouvelEnseignant.ors ?? 0) * (this.nouvelEnseignant.quotite ?? 0)) / 100,
      };
      await this.db.updateEnseignant(enseignant);
      this.isEditing = false;
      this.enseignantSelectionne = null;
    } else {

      // Vérification de l'existence d'un enseignant avec le même nom (insensible à la casse et aux accents)
      const nomNormalise = this.nouvelEnseignant.nom!
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase();
      const existe = this.enseignants.some(e =>
        e.nom.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase() === nomNormalise
      );
      if (existe) {
        alert('Un enseignant avec ce nom existe déjà.');
        return;
      }

      // Ajout
      const enseignant: Enseignant = {
        id: Date.now(),
        nom: this.nouvelEnseignant.nom!
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase(),
        corps: this.nouvelEnseignant.corps!,
        ors: this.nouvelEnseignant.ors!,
        quotite: this.nouvelEnseignant.quotite!,
        service_plancher: ((this.nouvelEnseignant.ors ?? 0) * (this.nouvelEnseignant.quotite ?? 0)) / 100,
      };
      await this.db.addEnseignant(enseignant);
    }
    this.nouvelEnseignant = {};
    await this.loadEnseignants();
  }


  /**
   * Méthode pour définir les ORS en fonction du corps de l'enseignant.
   */
  setOrsSelonCorps(corps: string) {
    if (corps === 'AGREGE(E)') {
      this.nouvelEnseignant.ors = 15;
    } else if (corps === 'CERTIFIE(E)') {
      this.nouvelEnseignant.ors = 18;
    } else {
      this.nouvelEnseignant.ors = undefined;
    }
  }


  /**
   * Méthode pour sélectionner un enseignant.
   * Lorsqu'un enseignant est sélectionné, il est stocké dans `enseignantSelectionne`.
   * @param enseignant 
   */
  selectEnseignant(enseignant: Enseignant) {
    this.enseignantSelectionne = enseignant;
  }

  /**
   * Méthode pour supprimer l'enseignant sélectionné.
   * @returns 
   */
  async deleteSelectedEnseignant() {
    if (!this.enseignantSelectionne) return;
    await this.db.deleteEnseignant(this.enseignantSelectionne.id);
    this.enseignantSelectionne = null;
    await this.loadEnseignants();
  }

  /**
   * Méthode pour modifier l'enseignant sélectionné.
   */
  editSelectedEnseignant() {
    if (!this.enseignantSelectionne) return;
    this.nouvelEnseignant = { ...this.enseignantSelectionne };
    this.isEditing = true;
  }


  /**
   * Méthode pour réinitialiser le formulaire et les sélections.
   * Elle est appelée pour vider les champs du formulaire et réinitialiser l'état d'édition.
   * @param form 
   */
  clearInputs(form: NgForm) {
    form.resetForm();
    this.enseignantSelectionne = null;
    this.isEditing = false;
  }

  /**
 * Exporte tous les enseignants dans un fichier CSV.
 */
async exportEnseignantsToCSV() {
  // 1. Récupérer les enseignants (déjà triés si tu veux)
  const enseignants = await this.db.getAllEnseignants(true);

  // 2. Construire le contenu CSV
  const header = 'Nom,Corps,ORS,Quotité(%),ServiceMinimum';
  const rows = enseignants.map(e =>
    [
      `"${e.nom}"`,
      `"${e.corps}"`,
      e.ors,
      e.quotite,
      e.service_plancher.toFixed(2)
    ].join(',')
  );
  const csvContent = [header, ...rows].join('\n');

  // 3. Créer un blob et déclencher le téléchargement
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'enseignants.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
}
