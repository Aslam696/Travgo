import { Component, ElementRef, ViewChild, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';

@Component({
  selector: 'app-chatbot',
  imports: [FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css'
})
export class ChatbotComponent {
  readonly chatService = inject(ChatService);
  
  // Two-way bound text input
  userInput = '';

  // Reference to the messages container for automatic scrolling
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor() {
    // Automatically scroll to the bottom of the container whenever messages or loading state changes
    effect(() => {
      this.chatService.messages();
      this.chatService.isLoading();
      this.chatService.isOpen();
      
      // Delay slightly to allow the DOM to render the new message node
      setTimeout(() => this.scrollToBottom(), 60);
    });
  }

  // Send the user input message
  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text) return;
    
    this.userInput = '';
    this.chatService.sendMessage(text);
  }

  // Send a pre-configured quick reply query
  sendQuickReply(text: string): void {
    this.chatService.sendMessage(text);
  }

  // Scroll to bottom helper
  private scrollToBottom(): void {
    if (this.scrollContainer) {
      try {
        const el = this.scrollContainer.nativeElement;
        el.scrollTo({
          top: el.scrollHeight,
          behavior: 'smooth'
        });
      } catch (err) {
        // Fallback for older browsers
        const el = this.scrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }
  }
}
