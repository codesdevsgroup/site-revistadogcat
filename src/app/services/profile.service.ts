import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Endereco } from '../interfaces/endereco.interface';
import { Usuario } from '../interfaces/usuario.interface';

// Perfil de usuário estendido incluindo endereço
export interface UserProfile extends Usuario {
  endereco?: Endereco;
}

// Interface para cães do usuário (estrutura exemplo)
export interface UserDog {
  dogId: string;
  name: string;
  breed: string; // Example property
  // Add other dog properties as needed
}

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
