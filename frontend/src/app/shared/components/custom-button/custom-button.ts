import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-custom-button',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './custom-button.html',
  styleUrl: './custom-button.css',
})
export class CustomButton {
  text = input.required<string>();
  // link = input.required<string>();
  link = input<string>();

  height = input('h-[60px]');
  textSize = input('text-lg');
  width = input('w-[170px]');

  type = input<'button' | 'submit'>('button');

  disabled = input(false);
}
