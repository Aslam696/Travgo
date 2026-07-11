import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './features/layout/header/header';
import { FooterComponent } from './features/layout/footer/footer';
import { ChatbotComponent } from './shared/components/chatbot/chatbot';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ChatbotComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
