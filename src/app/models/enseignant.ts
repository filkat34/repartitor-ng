export interface Enseignant {
  id: number;
  nom: string;
  corps: string; // Corps de l'enseignant
  ors: number; // Obligation réglementaire de service en heures à 100%
  quotite: number; // Quotité de service en pourcentage (0-100)
  service_plancher: number; // Service d'enseignement plancher prenant en compte la quotité
  classes?: Array <{no: number; nom: string}>; // no = nb de classes de même niveau, nom = nom du niveau
}