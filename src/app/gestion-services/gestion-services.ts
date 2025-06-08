import { Component, OnInit } from '@angular/core';
import { Enseignant } from '../models/enseignant';
import { IndexedDb } from '../indexed-db';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-gestion-services',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './gestion-services.html',
  styleUrl: './gestion-services.css'
})
export class GestionServices {

}
