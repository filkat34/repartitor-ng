import { Component, OnInit } from '@angular/core';
import { Enseignant } from '../models/enseignant';
import { Division } from '../models/division';
import { IndexedDb } from '../indexed-db';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-gestion-services',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './gestion-services.html',
  styleUrl: './gestion-services.css'
})
export class GestionServices implements OnInit {

  /**
    * Constructeur du composant GestionServices.
   * @param db Service pour interagir avec la base de données IndexedDB.
   * Ce service est utilisé pour charger les enseignants et les divisions,
   */
  constructor(private db: IndexedDb) { }


  /**
   * Méthode d'initialisation du composant.
   * Elle est appelée lorsque le composant est créé.
   * Elle charge tous les enseignants et divisions depuis la base de données.
   * @async
   */
  async ngOnInit() {
    this.enseignants = await this.db.getAllEnseignants(true);
    this.divisions = await this.db.getAllDivisions(true);
  }


  /**
   * Propriétés du composant GestionServices.
   * - `enseignants`: Liste des enseignants chargés depuis la base de données.
   * - `divisions`: Liste des divisions chargées depuis la base de données.
   */
  enseignants: Enseignant[] = [];
  divisions: Division[] = [];


  /**
   * Récupère le nombre de classes d'une division affectée à un enseignant.
   * @param enseignant 
   * @param divisionNom 
   * @returns 
   */
  getClasseNoForDivision(enseignant: Enseignant, divisionNom: string): number {
    if (!enseignant.classes) return 0;
    const classe = enseignant.classes.find(c => c.nom === divisionNom);
    return classe ? classe.no : 0;
  }

  /**
 * Récupère le nombre total de classes d'une division affectées à un enseignant.
 * @param divisionNom Nom de la division.
 * @returns Nombre total de classes pour la division.
 */
  getTotalNoForDivision(divisionNom: string): number {
    return this.enseignants
      .flatMap(e => e.classes ?? [])
      .filter(c => c.nom === divisionNom)
      .reduce((sum, c) => sum + c.no, 0);
  }

  /**
   * Ajoute une classe à un enseignant dans le service.
   * Si la classe existe déjà, elle incrémente le nombre de classes.
   * @param enseignant 
   * @param divisionNom 
   */
  async addClassToService(enseignant: Enseignant, divisionNom: string) {
    if (!enseignant.classes) {
      enseignant.classes = [];
    }
    const found = enseignant.classes.find(c => c.nom === divisionNom);
    if (found) {
      found.no += 1;
    } else {
      enseignant.classes.push({ no: 1, nom: divisionNom });
    }
    await this.db.updateEnseignant(enseignant);
  }


  /**
   * Supprime une classe d'un enseignant dans le service.
   * Si le nombre de classes est supérieur à 1, il décrémente le nombre.
   * @param enseignant 
   * @param divisionNom 
   */
  async deleteClassFromService(enseignant: Enseignant, divisionNom: string) {
    if (!enseignant.classes) {
      enseignant.classes = [];
    }
    const found = enseignant.classes.find(c => c.nom === divisionNom);
    if (found) {
      if (found.no > 1) {
        found.no -= 1;
      } else {
        enseignant.classes = enseignant.classes.filter(c => c.nom !== divisionNom);
      }
      await this.db.updateEnseignant(enseignant);
    }
  }


  /**
   * Désactive le bouton d'ajout pour une division si le nombre total de classes pour cette division atteint le maximum autorisé.
   * @param division 
   * @returns 
   */
  isAddDisabled(division: Division): boolean {
    return this.getTotalNoForDivision(division.nom) >= division.nombreDivisions;
  }


  /**
   * Désactive le bouton de suppression pour un enseignant et une division si l'enseignant n'a pas de classes dans cette division.
   * @param enseignant 
   * @param division 
   * @returns 
   */
  isDeleteDisabled(enseignant: Enseignant, division: Division): boolean {
    return this.getClasseNoForDivision(enseignant, division.nom) === 0;
  }


  /**
   * Calcule le service total d'un enseignant en fonction des classes affectées.
   * @param enseignant 
   * @returns 
   */
  CalculateService(enseignant: Enseignant): number {
    if (!enseignant.classes) return 0;
    return enseignant.classes.reduce((total, c) => {
      const division = this.divisions.find(d => d.nom === c.nom);
      return total + (division ? division.horaire_enseignant * c.no : 0);
    }, 0);
  }


  /**
   * Calcul du nombre d'heures supplémentaires annuelles (HSA) pour un enseignant.
   * Il s'agit de la différence entre le service total calculé et le service plancher de l'enseignant.
   * @param enseignant 
   * @returns 
   */
  CalculateHSA(enseignant: Enseignant): number {
    if (!enseignant.classes) return 0;
    else {
      return this.CalculateService(enseignant) - enseignant.service_plancher
    }
  }


  /**
   * 
   * @returns Calcul du total des heures supplémentaires annuelles (HSA) pour tous les enseignants.
   * Cette méthode parcourt la liste des enseignants, calcule les HSA pour chacun d'eux,
   */
  CalculateTotalHSA(): number {
    let totalHSA = 0;
    this.enseignants.forEach(enseignant => {
      const hsa = this.CalculateHSA(enseignant);
      if (hsa > 0) {
        totalHSA += hsa;
      }
    });
    return totalHSA;
  }


  /**
   * Retourne une liste des divisions qui n'ont pas d'affectation d'enseignants.
   * Pour chaque division, elle calcule le nombre de classes affectées et retourne celles qui n'ont pas d'affectation.
   * @returns Liste des divisions qui n'ont pas d'affectation d'enseignants.
   */
  DivisionsNonAffectees(): { nom: string, no: number }[] {
    // Obtenir les noms des divisions affectées et le nombre total des classes affectées de chaque division
    const affecteesCount: Record<string, number> = {};
    this.enseignants.forEach(e => {
      (e.classes ?? []).forEach(c => {
        affecteesCount[c.nom] = (affecteesCount[c.nom] || 0) + c.no;
      });
    });

    // Pour chaque division, vérifier combien de classes sont affectées
    // et retourner celles qui n'ont pas d'affectation
    return this.divisions
      .map(d => ({
        nom: d.nom,
        no: Math.max(0, d.nombreDivisions - (affecteesCount[d.nom] || 0))
      }))
      .filter(d => d.no > 0);
  }


  /**
   * Exporte les données des enseignants dans un fichier CSV.
   * Le fichier contient les informations suivantes pour chaque enseignant :
   * - Nom de l'enseignant
   * - ORS (Organisation de Répartition des Services)
   * - Quotité (en pourcentage)
   * - Classes (noms et numéros des classes)
   * - Service (calculé en fonction des classes affectées)
   * - HSA (Heures Supplémentaires Annuelles, calculées en fonction du service total et du service plancher)
   * * Le fichier est créé en mémoire, puis téléchargé automatiquement.
   * @returns {void}
   * @description Cette méthode génère un fichier CSV contenant les informations des enseignants et le télécharge.
   */
  exportToCSV() {
    const rows: string[] = [];
    // En-tête
    rows.push('Enseignant,ORS,Quotité (%),Classes (nombre),Service,HSA');

    this.enseignants.forEach(enseignant => {
      const service = Number(this.CalculateService(enseignant).toFixed(2));
      let hsa = Number(this.CalculateHSA(enseignant).toFixed(2));
      if (hsa < 0) hsa = 0;
      let classesStr = '';
      if (enseignant.classes && enseignant.classes.length > 0) {
        classesStr = enseignant.classes
          .map(classe => `${classe.nom} (${classe.no})`)
          .join(', ');
      }
      rows.push(
        `"${enseignant.nom}",${enseignant.ors},${enseignant.quotite},"${classesStr}",${service},${hsa}`
      );
    });

    const csvContent = rows.join('\r\n');
    // Création et téléchargement du fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'services.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

}
