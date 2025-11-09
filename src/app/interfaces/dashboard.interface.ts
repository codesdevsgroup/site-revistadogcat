export interface DashboardCard {
  value: number;
  percentage: number;
}

export interface MonthlyGrowth {
  month: string;
  year: number;
  count: number;
}

export interface UserDistribution {
  role: string;
  count: number;
}

export interface DashboardData {
  cards: {
    totalUsuarios: DashboardCard;
    artigosPublicados: DashboardCard;
    assinantesAtivos: DashboardCard;
    visualizacoes: DashboardCard;
  };
  monthlyGrowth: MonthlyGrowth[];
  userDistribution: UserDistribution[];
}

export interface DashboardResponse {
  cards: {
    totalUsuarios: { value: number; percentage: number };
    artigosPublicados: { value: number; percentage: number };
    assinantesAtivos: { value: number; percentage: number };
    visualizacoes: { value: number; percentage: number };
  };
}
