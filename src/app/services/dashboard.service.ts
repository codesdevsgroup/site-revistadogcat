import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { DashboardResponse } from "../dtos/dashboard.dto";

@Injectable({ providedIn: "root" })
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

    getDashboardData(): Observable<DashboardResponse> {
    return this.http
      .get<{ data: DashboardResponse }>(this.apiUrl)
      .pipe(map((resp) => resp.data));
  }
}
