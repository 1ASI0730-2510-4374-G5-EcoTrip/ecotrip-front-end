import { ref, computed } from 'vue';
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate';

// Estado global de navegación
const currentSection = ref('experiences');
const navigationHistory = ref([]);
const isLoading = ref(false);

class NavigationService {
  constructor() {
    this.currentSection = currentSection;
    this.navigationHistory = navigationHistory;
    this.isLoading = isLoading;
  }

  // Getters reactivos
  get section() {
    return this.currentSection.value;
  }

  get history() {
    return this.navigationHistory.value;
  }

  get loading() {
    return this.isLoading.value;
  }

  // Computed para determinar si el usuario está autenticado
  get isAuthenticated() {
    const session = AuthSession.fromStorage();
    return session?.isValid() ?? false;
  }

  // Computed para el rol del usuario
  get userRole() {
    const session = AuthSession.fromStorage();
    if (!session?.isValid()) return null;
    return session.isAgency() ? 'agency' : 'tourist';
  }

  // Métodos para manejar la navegación
  setCurrentSection(section) {
    const previousSection = this.currentSection.value;
    this.currentSection.value = section;
    
    // Agregar a historial
    this.navigationHistory.value.push({
      from: previousSection,
      to: section,
      timestamp: Date.now()
    });

    // Mantener solo los últimos 10 elementos del historial
    if (this.navigationHistory.value.length > 10) {
      this.navigationHistory.value.shift();
    }

    console.log(`[NavigationService] Changed section from ${previousSection} to ${section}`);
  }

  // Obtener la ruta home según el rol
  getHomeRoute() {
    const session = AuthSession.fromStorage();
    if (!session?.isValid()) return '/login';
    return session.isAgency() ? '/manage-experiences' : '/experiences';
  }

  // Verificar si una ruta es accesible para el usuario actual
  canAccessRoute(route) {
    const session = AuthSession.fromStorage();
    if (!session?.isValid()) return false;

    const isAgency = session.isAgency();
    const isTourist = session.isTourist();

    // Rutas específicas para agencias
    const agencyRoutes = ['/manage-experiences', '/agency/profile'];
    // Rutas específicas para turistas
    const touristRoutes = ['/tourist/profile'];
    // Rutas compartidas
    const sharedRoutes = ['/experiences', '/reservations'];

    if (agencyRoutes.some(r => route.startsWith(r))) {
      return isAgency;
    }

    if (touristRoutes.some(r => route.startsWith(r))) {
      return isTourist;
    }

    if (sharedRoutes.some(r => route.startsWith(r))) {
      return true;
    }

    return true; // Por defecto, permitir acceso
  }

  // Limpiar historial
  clearHistory() {
    this.navigationHistory.value = [];
  }

  // Obtener la última sección visitada
  getLastSection() {
    if (this.navigationHistory.value.length === 0) return null;
    return this.navigationHistory.value[this.navigationHistory.value.length - 1];
  }

  // Configurar estado de carga
  setLoading(loading) {
    this.isLoading.value = loading;
  }

  // Manejar errores de navegación
  handleNavigationError(error, route) {
    console.error(`[NavigationService] Navigation error for route ${route}:`, error);
    
    // Limpiar estado si es necesario
    this.setLoading(false);
    
    // Redirigir a home o login según el caso
    if (error.name === 'NavigationDuplicated') {
      // Ignore duplicate navigation errors
      return;
    }
    
    if (!this.isAuthenticated) {
      return '/login';
    }
    
    return this.getHomeRoute();
  }
}

// Instancia singleton
const navigationService = new NavigationService();

export { navigationService, NavigationService };
