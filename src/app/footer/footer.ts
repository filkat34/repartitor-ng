import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndexedDb } from '../indexed-db';
import { Enseignant } from '../models/enseignant';
import { Division } from '../models/division';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer implements OnInit, OnDestroy {

  constructor(private db: IndexedDb) { }

  /**
   * Méthode d'initialisation du composant.
   * Elle est appelée lorsque le composant est créé.
   */
  async ngOnInit() {
    await this.refreshData();
    this.dbSub = this.db.dbChanged$.subscribe(() => this.refreshData());
  }


  /**
   * Méthode de destruction du composant.
   * Elle est appelée lorsque le composant est détruit.
   */
  ngOnDestroy() {
    this.dbSub?.unsubscribe();
  }


  /**
   * Méthode pour rafraîchir les données des enseignants et des divisions.
   * Elle est appelée lors de l'initialisation du composant et à chaque fois que la base de données change.
   */
  async refreshData() {
    this.enseignants = await this.db.getAllEnseignants(true);
    this.divisions = await this.db.getAllDivisions(true);
  }


  /**
   * Propriétés du composant GestionServices.
   * - `enseignants`: Liste des enseignants chargés depuis la base de données.
   * - `divisions`: Liste des divisions chargées depuis la base de données.
   * - `dbSub`: Subscription pour écouter les changements de la base de données.
   */
  enseignants: Enseignant[] = [];
  divisions: Division[] = [];
  private dbSub!: Subscription;


  /**
   * Calcule le service total d'un enseignant en fonction des classes affectées.
   * @param enseignant 
   * @returns 
   */
  CalculateService(enseignant: Enseignant): number {
    if (!enseignant.classes) return 0;
    return enseignant.classes.reduce((total, c) => {
      const division = this.divisions.find(d => d.nom === c.nom);
      return total + (division ? division.horaire_enseignant_sansponderation * c.no : 0);
    }, 0);
  }

  
  /**
   * Calcul du nombre total d'heures affectées à tous les enseignants.
   * Cette méthode parcourt la liste des enseignants et additionne le service calculé pour chacun d'eux.
   * @returns 
   */
  HeuresAffectees(): number {
  if (!this.enseignants) return 0;
  let total = 0;
  for (const enseignant of this.enseignants) {
    total += this.CalculateService(enseignant);
  }
  return total;
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
   * Calcule le total des heures apportées par les enseignants.
   * Il s'agit de la somme des services planchers de tous les enseignants.
   * @returns 
   */
  ApportHeures(): number {
    if (!this.enseignants) return 0;
    return this.enseignants
      .filter(enseignant => enseignant.corps !== 'BMP')
      .reduce((total, enseignant) => total + (enseignant.service_plancher || 0), 0);
}


  /**
   * Calcule le nombre total d'heures nécessaires pour les divisions.
   * Il s'agit de la somme des horaires enseignants multipliés par le nombre de divisions pour chaque division.
   * @returns 
   */
  BesoinHeures(): number {
    if (!this.divisions) return 0;
    return this.divisions.reduce(
      (total, division) => total + (division.horaire_enseignant_sansponderation || 0) * (division.nombreDivisions || 0),
      0
    );
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

}
