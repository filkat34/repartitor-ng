import { Component, OnInit } from '@angular/core';
import { Division } from '../models/division';
import { IndexedDb } from '../indexed-db';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-gestion-divisions',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './gestion-divisions.html',
  styleUrl: './gestion-divisions.css'
})
export class GestionDivisions implements OnInit {

  // Initialisations
  constructor(private db: IndexedDb) { }

  ngOnInit() {
    this.loadDivisions();
  }

  // Propriétés pour la gestion des divisions
  nouvelleDivision: Partial<Division> = {};
  divisions: Division[] = [];
  divisionSelectionnee: Division | null = null;
  isEditing = false; // Propriété pour gérer le mode édition


  /**
     * Méthode pour sélectionner une division.
     * Lorsqu'une division est sélectionnée, elle est stockée dans `divisionSelectionne`.
     * @param division 
     */
  selectDivision(division: Division) {
    this.divisionSelectionnee = division;
  }

  /**
   * Méthode pour charger toutes les divisions depuis la base de données.
   * Elle est appelée lors de l'initialisation du composant.
   */
  async loadDivisions() {
    this.divisions = await this.db.getAllDivisions(true);
  }

  /**
   * Méthode pour réinitialiser le formulaire et les sélections.
   * Elle est appelée pour vider les champs du formulaire et réinitialiser l'état d'édition.
   * @param form 
   */
  clearInputs(form: NgForm) {
    form.resetForm();
    this.divisionSelectionnee = null;
    this.isEditing = false;
  }

  /**
   * Méthode appelée lors de la soumission du formulaire pour ajouter ou modifier une division.
   * Si une division est sélectionnée, elle sera modifiée, sinon une nouvelle division sera ajoutée.
   * Les champs sont normalisés pour éviter les accents et mettre en majuscules.
   * Après l'ajout ou la modification, le formulaire est réinitialisé et la liste des divisions est rechargée.
   * @returns {Promise<void>}
   * @async
   */
  async onSubmit() {
    if (this.isEditing && this.divisionSelectionnee) {
      // Modification
      const division: Division = {
        ...this.divisionSelectionnee,
        nom: this.nouvelleDivision.nom!
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase(),
        nombreDivisions: this.nouvelleDivision.nombreDivisions!,
        horaire_eleve_classe_entiere: this.nouvelleDivision.horaire_eleve_classe_entiere!,
        horaire_eleve_demi_groupe: this.nouvelleDivision.horaire_eleve_demi_groupe!,
        division_examen: this.nouvelleDivision.division_examen!,
        ponderation: this.nouvelleDivision.ponderation!,
        horaire_enseignant: ((this.nouvelleDivision.horaire_eleve_classe_entiere ?? 0) + (this.nouvelleDivision.horaire_eleve_demi_groupe ?? 0) * 2) * (this.nouvelleDivision.ponderation ?? 1)
      };
      await this.db.updateDivision(division);
      this.isEditing = false;
      this.divisionSelectionnee = null;
    } else {

      // Vérification de l'existence d'une division avec le même nom (insensible à la casse et aux accents)
      const nomNormalise = this.nouvelleDivision.nom!
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase();
      const existe = this.divisions.some(d =>
        d.nom.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase() === nomNormalise
      );
      if (existe) {
        alert('Une division avec ce nom existe déjà.');
        return;
      }

      // Ajout
      const division: Division = {
        id: Date.now(),
        nom: this.nouvelleDivision.nom!
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase(),
        nombreDivisions: this.nouvelleDivision.nombreDivisions!,
        horaire_eleve_classe_entiere: this.nouvelleDivision.horaire_eleve_classe_entiere!,
        horaire_eleve_demi_groupe: this.nouvelleDivision.horaire_eleve_demi_groupe!,
        division_examen: this.nouvelleDivision.division_examen!,
        ponderation: this.nouvelleDivision.ponderation!,
        horaire_enseignant: ((this.nouvelleDivision.horaire_eleve_classe_entiere ?? 0) + (this.nouvelleDivision.horaire_eleve_demi_groupe ?? 0) * 2) * (this.nouvelleDivision.ponderation ?? 1),
        horaire_enseignant_sansponderation: ((this.nouvelleDivision.horaire_eleve_classe_entiere ?? 0) + (this.nouvelleDivision.horaire_eleve_demi_groupe ?? 0) * 2)
      };
      await this.db.addDivision(division);
    }
    this.nouvelleDivision = {};
    await this.loadDivisions();
  }

  /**
* Méthode pour supprimer la division sélectionnée.
* @returns 
*/
  async deleteSelectedDivision() {
    if (!this.divisionSelectionnee) return;
    await this.db.deleteDivision(this.divisionSelectionnee.id);
    this.divisionSelectionnee = null;
    await this.loadDivisions();
  }

  /**
   * Méthode pour modifier la division sélectionnée.
   */
  editSelectedDivision() {
    if (!this.divisionSelectionnee) return;
    this.nouvelleDivision = { ...this.divisionSelectionnee };
    this.isEditing = true;
  }


  /**
 * Exporte toutes les divisions dans un fichier CSV.
 */
  async exportDivisionsToCSV() {
    // 1. Récupérer les divisions depuis la base de données
    const divisions = await this.db.getAllDivisions(true); // true si tu veux trier

    // 2. Construire le contenu CSV
    const header = 'Niveau,NombreDivisions,HeuresClasseEntiere,HeuresDemiGroupe,Ponderation,HeuresProf';
    const rows = divisions.map(d =>
      [
        `"${d.nom}"`,
        d.nombreDivisions,
        d.horaire_eleve_classe_entiere,
        d.horaire_eleve_demi_groupe,
        d.ponderation,
        d.horaire_enseignant
      ].join(',')
    );
    const csvContent = [header, ...rows].join('\n');

    // 3. Créer un blob et déclencher le téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'divisions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
