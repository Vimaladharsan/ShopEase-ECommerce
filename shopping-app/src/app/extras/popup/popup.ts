import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector:'app-popup',
  standalone:true,
  imports:[CommonModule],
  templateUrl:'./popup.html',
  styleUrl:'./popup.css'
})
export class Popup {

  @Input() message='';
  @Input() type='success';

}