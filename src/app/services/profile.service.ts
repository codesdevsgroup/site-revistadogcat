import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface UserProfile {
  userId: string;
  userName: string;
  name: string;
  email: string;
  cpf?: string;
  telefone?: string;
  birthDate?: string;
  role: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAddress {
  id?: string;
  street: string;
  number?: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  isMain?: boolean;
}

export interface UserDog {
  id: string;
  name: string;
  breed: string;
  age?: number;
  birthDate?: string;
  gender: string;
  color?: string;
  weight?: number;
  height?: number;
  registrationNumber?: string;
  registrationDate: string;
  fotoPerfilUrl?: string;
  fotoLateralUrl?: string;
  videoUrl?: string;
  pedigreeFrenteUrl?: string;
  pedigreeVersoUrl?: string;
  isActive?: boolean;
}

export interface ProfileData {
  user: UserProfile;
  address?: UserAddress;
  dogs: UserDog[];
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly apiUrl = environment.apiUrl;
  private readonly usersApiUrl = `${this.apiUrl}/usuarios`;
  private readonly addressApiUrl = `${this.apiUrl}/enderecos`;
  private readonly dogsApiUrl = `${this.apiUrl}/cadastro-cao`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Busca todos os dados do perfil do usuário logado
   */
  getProfileData(): Observable<ProfileData> {
    if (!this.authService.isAuthenticated()) {
      return throwError(() => new Error('Usuário não autenticado'));
    }

    // Primeiro buscar dados do usuário, depois usar o userId para buscar endereço e cães
    return this.getUserProfile().pipe(
      switchMap(user => {
        // Buscar endereço e cães em paralelo usando o userId obtido
        return forkJoin({
          user: of(user), // Reutilizar dados do usuário já obtidos
          address: this.getUserAddress(user.userId).pipe(
            catchError(() => of(null)) // Endereço é opcional
          ),
          dogs: this.getUserDogs(user.userId).pipe(
            catchError(() => of([])) // Lista vazia se não houver cães
          )
        });
      }),
      map(result => ({
        user: result.user,
        address: result.address || undefined,
        dogs: result.dogs
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Busca dados detalhados do usuário autenticado usando o endpoint /me
   */
  getUserProfile(): Observable<UserProfile> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/auth/me`, { headers })
      .pipe(
        map(response => {
          // Adaptar resposta da API para interface UserProfile
          const userData = response.data || response;
          return {
            userId: userData.userId || userData.id,
            userName: userData.userName || userData.username,
            name: userData.name || userData.nome,
            email: userData.email,
            cpf: userData.cpf,
            telefone: userData.telefone || userData.phone,
            birthDate: userData.birthDate || userData.dataNascimento,
            role: userData.role,
            avatarUrl: userData.avatarUrl || userData.avatar,
            createdAt: userData.createdAt || userData.created_at,
            updatedAt: userData.updatedAt || userData.updated_at
          };
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Busca endereço principal do usuário
   */
  getUserAddress(userId: string): Observable<UserAddress> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.addressApiUrl}/usuario/${userId}`, { headers })
      .pipe(
        map(response => {
          const addressData = response.data || response;
          // Se retornar array, pegar o endereço principal
          const address = Array.isArray(addressData) 
            ? addressData.find(addr => addr.isMain) || addressData[0]
            : addressData;
            
          if (!address) {
            throw new Error('Endereço não encontrado');
          }

          return {
            id: address.id,
            street: address.street || address.logradouro,
            number: address.number || address.numero,
            complement: address.complement || address.complemento,
            neighborhood: address.neighborhood || address.bairro,
            city: address.city || address.cidade,
            state: address.state || address.estado,
            zipCode: address.zipCode || address.cep,
            country: address.country || address.pais || 'Brasil',
            isMain: address.isMain || address.principal
          };
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Busca lista de cães do usuário
   */
  getUserDogs(userId: string): Observable<UserDog[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.dogsApiUrl}/usuario/${userId}`, { headers })
      .pipe(
        map(response => {
          const dogsData = response.data || response;
          const dogs = Array.isArray(dogsData) ? dogsData : [dogsData];
          
          return dogs.map(dog => ({
            id: dog.id,
            name: dog.name || dog.nome,
            breed: dog.breed || dog.raca,
            age: dog.age || dog.idade,
            birthDate: dog.birthDate || dog.dataNascimento,
            gender: dog.gender || dog.sexo,
            color: dog.color || dog.cor,
            weight: dog.weight || dog.peso,
            height: dog.height || dog.altura,
            registrationNumber: dog.registrationNumber || dog.numeroRegistro,
            registrationDate: dog.registrationDate || dog.dataRegistro,
            fotoPerfilUrl: dog.fotoPerfilUrl || dog.foto_perfil_url,
            fotoLateralUrl: dog.fotoLateralUrl || dog.foto_lateral_url,
            videoUrl: dog.videoUrl || dog.video_url,
            pedigreeFrenteUrl: dog.pedigreeFrenteUrl || dog.pedigree_frente_url,
            pedigreeVersoUrl: dog.pedigreeVersoUrl || dog.pedigree_verso_url,
            isActive: dog.isActive !== false // Default true se não especificado
          })).filter(dog => dog.isActive); // Filtrar apenas cães ativos
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Atualiza dados do perfil do usuário
   */
  updateUserProfile(userId: string, profileData: Partial<UserProfile>): Observable<UserProfile> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<any>(`${this.usersApiUrl}/${userId}`, profileData, { headers })
      .pipe(
        map(response => response.data || response),
        catchError(this.handleError)
      );
  }

  /**
   * Atualiza endereço do usuário
   */
  updateUserAddress(userId: string, addressData: Partial<UserAddress>): Observable<UserAddress> {
    const headers = this.authService.getAuthHeaders();
    
    if (addressData.id) {
      // Atualizar endereço existente
      return this.http.put<any>(`${this.addressApiUrl}/${addressData.id}`, addressData, { headers })
        .pipe(
          map(response => response.data || response),
          catchError(this.handleError)
        );
    } else {
      // Criar novo endereço
      return this.http.post<any>(`${this.addressApiUrl}`, { ...addressData, userId }, { headers })
        .pipe(
          map(response => response.data || response),
          catchError(this.handleError)
        );
    }
  }

  /**
   * Busca endereço por CEP
   */
  getAddressByCep(cep: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.addressApiUrl}/cep/${cep}`, { headers })
      .pipe(
        map(response => response.data || response),
        catchError(this.handleError)
      );
  }

  /**
   * Tratamento de erros
   */
  private handleError(error: any): Observable<never> {
    console.error('Erro no ProfileService:', error);
    
    let errorMessage = 'Erro interno do servidor';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      switch (error.status) {
        case 401:
          errorMessage = 'Não autorizado. Faça login novamente.';
          break;
        case 403:
          errorMessage = 'Acesso negado.';
          break;
        case 404:
          errorMessage = 'Dados não encontrados.';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor.';
          break;
        default:
          errorMessage = `Erro ${error.status}: ${error.statusText || 'Erro desconhecido'}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}