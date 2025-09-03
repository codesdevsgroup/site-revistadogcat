import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Endereco } from '../interfaces/endereco.interface';

// Base User interface, mirroring AuthService
export interface User {
  userId: string;
  userName: string;
  name: string;
  email: string;
  cpf?: string;
  telefone?: string;
  role: string;
  avatarUrl?: string;
  active: boolean;
}

// Extended user profile including address
export interface UserProfile extends User {
  endereco?: Endereco;
}

// Interface for user's dogs (structure inferred from components)
export interface UserDog {
  dogId: string;
  name: string;
  breed: string; // Example property
  // Add other dog properties as needed
}

// Alias for Endereco to resolve component dependency
export type UserAddress = Endereco;

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  /**
   * Fetches the complete profile of the currently authenticated user.
   * This now corresponds to the /users/me endpoint.
   */
  getProfileData(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`);
  }

  /**
   * Updates the profile of the authenticated user.
   */
  updateUserProfile(profileData: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/me`, profileData);
  }

  /**
   * Uploads a new avatar for the authenticated user.
   */
  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<{ avatarUrl: string }>(`${this.apiUrl}/avatar-upload`, formData);
  }
}
