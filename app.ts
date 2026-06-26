import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';

interface Project {
  id: number;
  name: string;
  description: string;
  documentsCount: number;
  fullDetails?: string;
  imageUrl?: string;
  filesList?: Array<{ name: string; date: string; author: string }>;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatToolbarModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  username = '';
  email = '';
  password = '';
  
  hidePassword = true;
  isLoginMode = true;
  isLoggedIn = false;

  // Рядок пошуку та режим (Звичайний / ШІ)
  searchQuery = '';
  isAiSearchMode = false; // false = звичайний за літерами, true = через ШІ

  currentView: 'list' | 'details' | 'files' = 'list';
  selectedProject: Project | null = null;

  isEditingMarkdown = false;
  markdownText = '';

  projectsDataSource: Project[] = [
    { 
      id: 1, 
      name: 'CRM System', 
      description: 'Документація по CRM системі', 
      documentsCount: 3,
      fullDetails: '# CRM System Overview\nГлобальна CRM-система для автоматизації внутрішніх процесів, обліку лідів, клієнтів та аналітики продажів.\n\n## Модулі:\n- Авторизація користувачів\n- База клієнтів\n- Звіти',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80',
      filesList: [
        { name: 'API авторизації.md', date: '12.05.2026', author: 'user' },
        { name: 'Модель даних.md', date: '11.05.2026', author: 'user' },
        { name: 'Огляд системи.md', date: '13.05.2026', author: 'admin' }
      ]
    },
    { 
      id: 2, 
      name: 'Mobile App', 
      description: 'Документація мобільного застосунку', 
      documentsCount: 1,
      fullDetails: '# Mobile Application Specs\nКроссплатформений мобільний додаток на Flutter для клієнтів компанії. Повний кабінет, пуш-повідомлення.',
      imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&q=80',
      filesList: [
        { name: 'Специфікація інтерфейсу.md', date: '20.06.2026', author: 'ui_designer' }
      ]
    },
    { 
      id: 3, 
      name: 'Payment Service', 
      description: 'Сервіс оплати та транзакцій', 
      documentsCount: 2,
      fullDetails: '# Payment Gateway Integration\nМікросервіс для обробки банківських карток, Apple Pay, Google Pay з шифруванням даних та токенізацією.',
      imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=500&q=80',
      filesList: [
        { name: 'Інструкція по деплою.md', date: '10.05.2026', author: 'admin' },
        { name: 'Протокол шифрування.md', date: '18.06.2026', author: 'security_lead' }
      ]
    }
  ];

  displayedColumns: string[] = ['name', 'description', 'documentsCount', 'actions'];

  // Розділена логіка пошуку
  get filteredProjects(): Project[] {
    let result = [...this.projectsDataSource];

    if (!this.searchQuery) {
      return result.sort((a, b) => a.name.localeCompare(b.name));
    }

    const query = this.searchQuery.toLowerCase().trim();

    if (this.isAiSearchMode) {
      // Режим 2: Пошук через ШІ (імітація інтелектуального RAG-lite аналізу тексту та опису)
      result = result.filter(p => 
        p.description.toLowerCase().includes(query) || 
        (p.fullDetails && p.fullDetails.toLowerCase().includes(query))
      );
    } else {
      // Режим 1: Звичайний пошук за першими літерами та назвою проєкту
      result = result.filter(p => 
        p.name.toLowerCase().startsWith(query) || 
        p.name.toLowerCase().includes(query)
      );
    }

    // Завжди повертаємо в алфавітному порядку
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  get isPasswordInvalid(): boolean {
    if (!this.password) return false;
    if (this.password.length < 8) return true;
    const hasLetter = /[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ]/.test(this.password);
    const hasDigit = /\d/.test(this.password);
    const hasSpecialChar = /[\._\/]/.test(this.password);
    return !hasLetter || !hasDigit || !hasSpecialChar;
  }

  get passwordErrorMessage(): string {
    if (this.password.length < 8) return 'Мінімум 8 символів';
    return 'Обов’язково щоб були літери, цифри; . ; _ ; /';
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.username = ''; this.email = ''; this.password = '';
  }

  onForgotPassword() {
    alert('Інструкцію відновлення надіслано!');
  }

  logout() {
    this.isLoggedIn = false;
    this.password = '';
    this.currentView = 'list';
    this.searchQuery = '';
    this.isAiSearchMode = false;
  }

  onSubmit() {
    if (this.isPasswordInvalid) {
      alert('Будь ласка, виправте помилки у формі!');
      return;
    }
    this.isLoggedIn = true;
  }

  viewProjectDetails(project: Project) {
    this.selectedProject = project;
    this.markdownText = project.fullDetails || project.description;
    this.currentView = 'details';
    this.isEditingMarkdown = false;
  }

  viewProjectFiles(project: Project, event: Event) {
    event.stopPropagation();
    this.selectedProject = project;
    this.currentView = 'files';
  }

  saveMarkdown() {
    if (this.selectedProject) {
      this.selectedProject.fullDetails = this.markdownText;
      this.selectedProject.documentsCount++;
      
      const now = new Date();
      const formattedDate = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth()+1).toString().padStart(2, '0')}.${now.getFullYear()}`;
      
      if (!this.selectedProject.filesList) this.selectedProject.filesList = [];
      this.selectedProject.filesList.unshift({
        name: `Збережена версія v${this.selectedProject.documentsCount}.md`,
        date: formattedDate,
        author: this.email || 'user@example.com'
      });

      this.isEditingMarkdown = false;
      alert('Markdown успішно збережено! Створено нову версію документа.');
    }
  }

  addNewProject() {
    const nextId = this.projectsDataSource.length + 1;
    const newProj: Project = {
      id: nextId,
      name: `Автоматичний Проєкт ${nextId}`,
      description: 'Новий доданий опис проєкту',
      documentsCount: 0,
      fullDetails: '# Новий Автоматичний Проєкт\nОпис створеного проєкту для системи документування.',
      imageUrl: 'https://images.unsplash.com/photo-1510519138101-570d1dca3d66?w=500&q=80',
      filesList: []
    };
    this.projectsDataSource = [...this.projectsDataSource, newProj];
  }
}