import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from 'src/app/services/gemini.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit {
  isOpen = false;
  userInput = '';
  messages: Array<{from: 'user' | 'bot'; text: string; loading?: boolean}> = [];
  readonly maxInputLength = 500;
  isAiLoading = false;
  
  private conversationHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  readonly assistantName = 'SkillBarter AI Assistant';
  readonly greeting = "Hi! 👋 I'm your SkillBarter AI Assistant, powered by Google Gemini. Ask me anything about SkillBarter features, how to use them, or how to get the most out of our platform!";
  readonly cannedQuestionsData = [
    'How to sign up?',
    'How to create a session?',
    'How do I earn XP?',
    'Tell me about donations'
  ];
  readonly quickLabel = 'Quick questions:';
  readonly placeholder = 'Type your question...';
  readonly sendLabel = 'Send';
  readonly loadingText = 'AI is thinking...';

  constructor(private geminiService: GeminiService) {}

  get cannedQuestions() {
    return this.cannedQuestionsData;
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  ngOnInit(): void {
    this.messages = [{ from: 'bot', text: this.greeting }];
  }

  chooseQuestion(q: string) {
    this.sendMessage(q);
  }

  sendUserInput() {
    const text = (this.userInput || '').trim();
    if (!text) return;
    if (text.length > this.maxInputLength) {
      this.pushMessage('bot', `Please keep your question under ${this.maxInputLength} characters.`);
      return;
    }
    this.sendMessage(text);
  }

  private sendMessage(userMessage: string) {
    this.pushMessage('user', userMessage);
    this.userInput = '';
    
    // Show loading indicator
    this.isAiLoading = true;
    const loadingMsg = { from: 'bot' as const, text: this.loadingText, loading: true };
    this.messages = [...this.messages, loadingMsg];

    // Add user message to conversation history
    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    // Call Gemini API
    this.geminiService.sendMessage(userMessage, 'en', this.conversationHistory).subscribe({
      next: (response: any) => {
        // Remove loading message
        this.messages = this.messages.filter(m => !m.loading);
        
        if (response.success) {
          const botReply = response.text;
          this.pushMessage('bot', botReply);
          
          // Add bot response to conversation history
          this.conversationHistory.push({
            role: 'model',
            parts: [{ text: botReply }]
          });
        } else {
          this.pushMessage('bot', response.text || 'Sorry, I encountered an error. Please try again.');
        }
        this.isAiLoading = false;
      },
      error: (error: any) => {
        this.messages = this.messages.filter(m => !m.loading);
        this.pushMessage('bot', 'Sorry, I encountered an error. Please check your internet connection and try again.');
        this.isAiLoading = false;
      }
    });
  }

  private pushMessage(from: 'user' | 'bot', text: string) {
    this.messages = [...this.messages, { from, text }];
  }
}

