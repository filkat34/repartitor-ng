import { Routes } from '@angular/router';
import { Accueil } from './accueil/accueil';
import { GestionEnseignants } from './gestion-enseignants/gestion-enseignants';
import { GestionDivisions } from './gestion-divisions/gestion-divisions';
import { GestionServices } from './gestion-services/gestion-services';

export const routes: Routes = [
{ path: '', redirectTo: '/accueil', pathMatch: 'full' },
{ path: 'accueil', component: Accueil },
{ path: 'enseignants', component: GestionEnseignants },
{ path: 'divisions', component: GestionDivisions },
{ path: 'services', component: GestionServices },
];
