export interface Translations {
  nav: {
    dashboard: string; waitingRoom: string; patients: string; prescriptions: string
    documents: string; finance: string; settings: string; doctorPanel: string
    secretary: string; doctorAccess: string; secretaryAccess: string
  }
  common: {
    save: string; cancel: string; delete: string; edit: string; add: string
    search: string; loading: string; confirm: string; back: string; print: string
    close: string; yes: string; no: string; actions: string; status: string
    date: string; name: string; phone: string; email: string; address: string
    notes: string; signOut: string; new: string; view: string; required: string
    optional: string; noData: string; saveChanges: string; remove: string
    upload: string; change: string
  }
  dashboard: {
    title: string; goodMorning: string; goodAfternoon: string; goodEvening: string
    waitingNow: string; inConsultation: string; seenToday: string; totalToday: string
    totalPatients: string; newToday: string; todayRevenue: string; consultations: string
    todayVisits: string; allStatuses: string; monthlySummary: string; revenue: string
    expenses: string; netIncome: string; quickLinks: string; newPrescription: string
    viewFinance: string; patientRecords: string; todayActivity: string; noActivityToday: string
  }
  waitingRoom: {
    title: string; subtitle: string; addPatient: string; refresh: string
    waiting: string; inConsult: string; done: string; total: string
    callNext: string; markDone: string; remove: string; priority: string
    noPatients: string; emptyMessage: string; registeredAt: string; waitingFor: string
    searchPatient: string; selectPatient: string; addNote: string; markAsUrgent: string; addToWaiting: string
  }
  patients: {
    title: string; subtitle: string; addPatient: string; searchPlaceholder: string
    noPatients: string; firstName: string; lastName: string; dateOfBirth: string
    gender: string; male: string; female: string; other: string; bloodType: string
    nationalId: string; allergies: string; hasFile: string; age: string; years: string
    prescriptions: string; payments: string; viewProfile: string; medicalFile: string
    patientSince: string; recentPayments: string; noPayments: string; addPayment: string; patientInfo: string
  }
  prescriptions: {
    title: string; newPrescription: string; searchPlaceholder: string; patient: string
    doctor: string; diagnosis: string; date: string; items: string; drug: string
    dosage: string; frequency: string; duration: string; instructions: string
    addDrug: string; noPrescriptions: string; printPdf: string; saveAsTemplate: string
    loadTemplate: string; notes: string; selectPatient: string; searchDrug: string; rx: string
  }
  documents: {
    title: string; newDocument: string; medicalLeave: string; certificate: string
    letter: string; custom: string; noDocuments: string; printPdf: string
    patient: string; type: string; createdAt: string
  }
  finance: {
    title: string; subtitle: string; addExpense: string; recordPayment: string
    todayRevenue: string; monthlyRevenue: string; monthlyExpenses: string; netIncome: string
    thisMonth: string; revenueMinusExpenses: string; sixMonthOverview: string; recentPayments: string
    newExpense: string; category: string; description: string; amount: string; method: string
    cash: string; card: string; insurance: string; consultationFee: string; selectCategory: string
    expenseCategories: string[]
  }
  settings: {
    title: string; subtitle: string; clinicInfo: string; prescription: string
    layoutDesigner: string; templates: string; clinicName: string; doctorName: string
    specialty: string; phone: string; email: string; address: string; currency: string
    consultationPrice: string; requireMedicalFile: string; requireMedicalFileDesc: string
    headerText: string; footerText: string; quickPreview: string; footerPlaceholder: string
    savedTemplates: string; templatesDesc: string; noTemplates: string; noTemplatesDesc: string
    logoTitle: string; logoDesc: string; uploadLogo: string; changeLogo: string
    removeLogo: string; logoTooBig: string; language: string
  }
  auth: {
    signIn: string; email: string; password: string; signInButton: string
    signingIn: string; welcomeBack: string; clinicSystem: string; invalidCredentials: string
  }
  status: {
    waiting: string; inConsultation: string; done: string; left: string
    paid: string; pending: string; cancelled: string
  }
}
