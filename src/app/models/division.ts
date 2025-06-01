export interface Division {
  id: number;
  nom: string; // Nom de la division
  horaire_eleve_classe_entiere: number;
  horaire_eleve_demi_groupe: number;
  division_examen: number; // 0 si la division n'est pas un examen, 1 si c'est un examen
  service_enseignant?: number; // id de l'enseignant associé à la division
  ponderation?: number; // Pondération de la division
  horaire_enseignant?: number; // Horaire de l'enseignant pour cette division
}