# Objectif

Repartitor est un outil destiné à faciliter les conseils d'enseignement. Il permet de constituer, grâce à une interface simple, les services des enseignants d'une équipe disciplinaire en trois étapes :

1. ajoutez les différents enseignants faisant partie de l’équipe ainsi que les informations nécessaires pour calculer leurs services ;
2. ajoutez les différentes divisions ainsi que le nombre de chacune d’entre elles pour pouvoir calculer les besoins en heures ;
3. grâce à une interface simple et intuitive, affectez des divisions à chaque enseignant pour constituer son service et exportez la répartition de l'équipe en format CSV.

# Fonctionnalités

* Interface de gestion des enseignants et des divisions avec un formulaire pour saisir, modifier, supprimer les données et un affichage sous forme de tableau;
* interface simplifiée de constitution des services : chaque enseignant occupe une carte avec des boutons pour lui affecter ou enlever des divisions ;
* calculs automatisés en fonction des informations saisies : apports postes, besoin en heures, HSA, nombre de divisions non affectées, etc ;
* exportation, importation d'une base de données en format JSON et effacement de la base de données utilisée ;
* exportation des données en format CSV.

# Pile technologique

Ce projet a été codé en utilisant :
* Angular (version 20.0.0) ;
* Talwindcss (version 4.1) ;
* IndexedDB.
