import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  messages: Array<{from: 'user' | 'bot'; text: string}> = [];

  lang: 'en' | 'hi' | 'te' | 'ta' = 'en';

  translations: any = {
    en: {
      assistantName: 'SkillBarter Assistant',
      greeting: "Hi — I'm SkillBarter Assistant. How can I help today?",
      cannedQuestions: [
        'How to sign up?',
        'How to post a skill?',
        'How to contact support?',
        'Pricing and subscriptions'
      ],
      responses: {
        'How to sign up?':
          'Click Sign Up at the top-right and follow the profile setup steps. You can also sign up with social login if available.',
        'How to post a skill?':
          'Open your profile, choose "Post a Skill", add a title, description and availability, then submit.',
        'How to contact support?':
          'You can email support@skillbarter.example or use the contact form on the Help page.',
        'Pricing and subscriptions':
          'Visit the Subscriptions page for plans and details. Free and premium tiers are available.'
      },
      defaultReply: 'I can help with signing up, posting skills, matches, and subscriptions. Try one of the quick questions.',
      quickLabel: 'Quick questions:',
      placeholder: 'Type your question...',
      send: 'Send'
    },
    hi: {
      assistantName: 'SkillBarter सहायक',
      greeting: 'नमस्ते — मैं SkillBarter सहायक हूँ। मैं कैसे मदद कर सकता/सकती हूँ?',
      cannedQuestions: [
        'कैसे साइन अप करें?',
        'कौशल कैसे पोस्ट करें?',
        'सहायता से कैसे संपर्क करें?',
        'मूल्य और सदस्यताएँ'
      ],
      responses: {
        'कैसे साइन अप करें?':
          'ऊपर-दाएँ साइड में "साइन अप" पर क्लिक करें और प्रोफ़ाइल सेटअप चरणों का पालन करें। आप सोशल लॉगिन भी उपयोग कर सकते हैं।',
        'कौशल कैसे पोस्ट करें?':
          'अपने प्रोफ़ाइल पर जाएँ, "कौशल पोस्ट करें" चुनें, शीर्षक, विवरण और उपलब्धता जोड़ें, और सबमिट करें।',
        'सहायता से कैसे संपर्क करें?':
          'आप support@skillbarter.example पर ईमेल कर सकते हैं या हelp पृष्ठ पर संपर्क फ़ॉर्म का उपयोग कर सकते हैं।',
        'मूल्य और सदस्यताएँ':
          'सदस्यताएँ पृष्ठ देखें — मुफ्त और प्रीमियम योजनाएँ उपलब्ध हैं।'
      },
      defaultReply: 'मैं साइनअप, कौशल पोस्ट, मैच और सदस्यताएँ में मदद कर सकता/सकती हूँ। एक प्रश्न चुनें।',
      quickLabel: 'त्वरित प्रश्न:',
      placeholder: 'अपना प्रश्न टाइप करें...',
      send: 'भेजें'
    },
    te: {
      assistantName: 'SkillBarter సహాయకుడు',
      greeting: 'హలో — నేను SkillBarter అసిస్టెంట్. నేను ఎలా సహాయం చేయగలను?',
      cannedQuestions: [
        'సైన్ అప్ ఎలా చేయాలి?',
        'స్కిల్ ఎలా పోస్ట్ చేయాలి?',
        'సపోర్ట్ ని ఎలా సంప్రదించాలి?',
        'ధరలు మరియు సభ్యత్వాలు'
      ],
      responses: {
        'సైన్ అప్ ఎలా చేయాలి?':
          'ఎదురు-పక్కన ఉన్న సైన్ అప్ బటన్ మీద క్లిక్ చేసి ప్రొఫైల్ సెటప్ దశలను అనుసరించండి. సోషల్లు ద్వారా కూడా సైన్ ఇన్ చేయవచ్చు.',
        'స్కిల్ ఎలా పోస్ట్ చేయాలి?':
          'మీ ప్రొఫైల్‌ను తెరిచి "స్కిల్ పోస్ట్ చేయి" చేయండి, టైటిల్, వివరణ మరియు అందుబాటు నింపి సమర్పించండి.',
        'సపోర్ట్ ని ఎలా సంప్రదించాలి?':
          'support@skillbarter.example కు ఇమెయిల్ చేయండి లేదా హెల్ప్ పేజీలో ఉన్న ఫారమ్ ఉపయోగించండి.',
        'ధరలు మరియు సభ్యత్వాలు':
          'సబ్‌స్క్రిప్షన్స్ పేజీని చూడండి — ఫ్రీ మరియు ప్రీమియం ప్లాన్స్ ఉన్నాయి.'
      },
      defaultReply: 'నేను సైన్ అప్, స్కిల్ పోస్ట్, మ్యాచ్‌లు మరియు సబ్‌స్క్రిప్షన్స్ గురించి సహాయం చేయగలను. ఒక వేగవంతమైన ప్రశ్నను ప్రయత్నించండి.',
      quickLabel: 'వేగవంతమైన ప్రశ్నలు:',
      placeholder: 'మీ ప్రశ్నను టైప్ చేయండి...',
      send: 'పంపు'
    },
    ta: {
      assistantName: 'SkillBarter உதவியாளர்',
      greeting: 'வணக்கம் — நான் SkillBarter உதவியாளர். எப்படி உதவலாம்?',
      cannedQuestions: [
        'எப்படி பதிவு செய்வது?',
        'திறமையை எப்படி பதிவு செய்வது?',
        'ஆதரத்தை எப்படி தொடர்பு கொள்வது?',
        'திட்டங்கள் மற்றும் சந்தாக்கள்'
      ],
      responses: {
        'எப்படி பதிவு செய்வது?':
          'மேலே வலது பகுதியில் உள்ள பதிவு செய்யும் பொத்தானை கிளிக் செய்து உங்கள் தகவல்களை பூர்த்தி செய்யவும். சமூக உள்நுழைவு கிடைக்கும் என்றால் அதனைப் பயன்படுத்தலாம்.',
        'திறமையை எப்படி பதிவு செய்வது?':
          'உங்கள் சுயவிவரத்திற்கு சென்று "திறமைப் பதிவு" தேர்ந்தெடுக்கவும், தலைப்பு, விளக்கம் மற்றும் கிடைக்கும் நேரத்தை சேர்த்து சமர்ப்பிக்கவும்.',
        'ஆதரத்தை எப்படி தொடர்பு கொள்வது?':
          'support@skillbarter.example என்ற ஐமெயில் அல்லது உதவி பக்கத்தில் உள்ள தொடர்பு படிவத்தை பயன்படுத்தவும்.',
        'திட்டங்கள் மற்றும் சந்தாக்கள்':
          'சந்தாக்கள் பக்கத்தைப் பாருங்கள் — இலவசமும் பிரீமியமும் உள்ளன.'
      },
      defaultReply: 'பதிவை எடுக்க, திறமையை பதிவு செய்ய, பொருத்தங்கள் மற்றும் சந்தாக்கள் பற்றி உதவி செய்யமுடியும். ஒரு விரைவு கேள்வியைத் தேர்ந்தெடுக்கவும்.',
      quickLabel: 'விரைவு கேள்விகள்:',
      placeholder: 'உங்கள் கேள்வியை தட்டச்சு செய்யவும்...',
      send: 'அனுப்பு'
    }
  };

  get cannedQuestions() {
    return this.translations[this.lang].cannedQuestions;
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  ngOnInit(): void {
    this.messages = [{ from: 'bot', text: this.translations[this.lang].greeting }];
  }

  chooseQuestion(q: string) {
    this.pushMessage('user', q);
    this.reply(q);
  }

  sendUserInput() {
    const text = (this.userInput || '').trim();
    if (!text) return;
    this.pushMessage('user', text);
    this.userInput = '';
    this.reply(text);
  }

  private pushMessage(from: 'user' | 'bot', text: string) {
    this.messages = [...this.messages, { from, text }];
    // keep simple — in a real app you might scroll the container
  }

  private reply(key: string) {
    const lower = key.trim().toLowerCase();
    const responses = this.translations[this.lang].responses;
    const matched = Object.keys(responses).find(k => k.toLowerCase() === lower);
    const resp = matched ? responses[matched] : this.translations[this.lang].defaultReply;
    setTimeout(() => this.pushMessage('bot', resp), 500);
  }

  setLanguage(lang: 'en' | 'hi' | 'te' | 'ta') {
    this.lang = lang;
    this.messages = [{ from: 'bot', text: this.translations[this.lang].greeting }];
  }
}
