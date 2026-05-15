export interface DashboardStats {
  overviewCards: {
    pending: number
    inProgress: number
    doneToday: number
    overdue: number
    myTasks: number
  }
  alerts: {
    highPriorityOverdue: number
    overloadedTechs: number
  }
  charts: {
    byPriority: any[]
    byApartment: any[]
  }
  performance?: any
}
