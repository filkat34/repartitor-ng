export interface Division {
  id: number;
  nom: string; // Nom de la division
  nombreDivisions: number; // Nombre de divisions au total
  horaire_eleve_classe_entiere: number;
  horaire_eleve_demi_groupe: number;
  division_examen: number; // 0 si la division n'est pas un examen, 1 si c'est un examen
  ponderation: number; // Pondération de la division
  horaire_enseignant: number; // Horaire de l'enseignant pour cette division avec la ponderation appliquée
  horaire_enseignant_sansponderation: number; // Horaire de l'enseignant pour cette division sans la pondération appliquée
}