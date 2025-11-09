export interface DashboardCards {
  totalUsuarios: {
    value: number;
    percentage: number;
  };
  artigosPublicados: {
    value: number;
    percentage: number;
  };
  assinantesAtivos: {
    value: number;
    percentage: number;
  };
  visualizacoes: {
    value: number;
    percentage: number;
  };
}

export interface MonthlyGrowthItem {
  month: string;
  year: number;
  count: number;
}

export interface UserDistributionItem {
  role: 'USUARIO' | 'ASSINANTE' | 'ADMIN' | string;
  count: number;
}

export interface DogsStatsResponse {
  monthlyGrowth: MonthlyGrowthItem[];
  incompleteCount: number;
  totalCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export interface DashboardResponse {
  cards: DashboardCards;
  monthlyGrowth: MonthlyGrowthItem[];
  userDistribution: UserDistributionItem[];
  dogsStats?: DogsStatsResponse;
}
