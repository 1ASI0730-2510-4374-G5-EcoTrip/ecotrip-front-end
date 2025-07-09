import { ref, reactive } from 'vue';

// Estado global para mantener el estado de las páginas
const pageStates = reactive({
  experiences: {
    filters: {
      searchQuery: '',
      selectedType: '',
      selectedDifficulty: '',
      selectedPriceRange: '',
      onlyEcoFriendly: false
    },
    scrollPosition: 0,
    lastVisited: null,
    data: null
  },
  reservations: {
    scrollPosition: 0,
    lastVisited: null,
    data: null,
    searchQuery: '',
    loading: false,
    error: null
  },
  profile: {
    scrollPosition: 0,
    lastVisited: null,
    data: null
  }
});

class PageStateManager {
  constructor() {
    this.states = pageStates;
    this.currentPage = ref(null);
    this.isRestoring = ref(false);
  }

  // Guardar estado de una página
  savePageState(pageName, state) {
    if (!this.states[pageName]) {
      this.states[pageName] = {};
    }

    // Guardar el estado actual
    Object.assign(this.states[pageName], state);
    this.states[pageName].lastVisited = Date.now();

    // Guardar también en sessionStorage para persistencia
    try {
      sessionStorage.setItem(`pageState_${pageName}`, JSON.stringify(state));
    } catch (error) {
      console.warn('Error saving page state to sessionStorage:', error);
    }

    console.log(`[PageStateManager] Saved state for ${pageName}:`, state);
  }

  // Restaurar estado de una página
  restorePageState(pageName) {
    let state = this.states[pageName];

    // Intentar cargar desde sessionStorage si no existe en memoria
    if (!state || !state.lastVisited) {
      try {
        const stored = sessionStorage.getItem(`pageState_${pageName}`);
        if (stored) {
          state = JSON.parse(stored);
          this.states[pageName] = state;
        }
      } catch (error) {
        console.warn('Error loading page state from sessionStorage:', error);
      }
    }

    console.log(`[PageStateManager] Restored state for ${pageName}:`, state);
    return state || {};
  }

  // Limpiar estado de una página
  clearPageState(pageName) {
    if (this.states[pageName]) {
      this.states[pageName] = {};
    }
    sessionStorage.removeItem(`pageState_${pageName}`);
    console.log(`[PageStateManager] Cleared state for ${pageName}`);
  }

  // Limpiar todos los estados
  clearAllStates() {
    Object.keys(this.states).forEach(key => {
      this.states[key] = {};
    });
    
    // Limpiar sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('pageState_')) {
        sessionStorage.removeItem(key);
      }
    });
    
    console.log('[PageStateManager] Cleared all states');
  }

  // Obtener estado de una página
  getPageState(pageName) {
    return this.states[pageName] || {};
  }

  // Verificar si una página tiene estado guardado
  hasPageState(pageName) {
    const state = this.states[pageName];
    return state && state.lastVisited && (Date.now() - state.lastVisited < 300000); // 5 minutos
  }

  // Marcar que se está restaurando el estado
  setRestoring(isRestoring) {
    this.isRestoring.value = isRestoring;
  }

  // Obtener si se está restaurando
  get isRestoringState() {
    return this.isRestoring.value;
  }

  // Configurar página actual
  setCurrentPage(pageName) {
    this.currentPage.value = pageName;
  }

  // Obtener página actual
  get currentPageName() {
    return this.currentPage.value;
  }

  // Método para manejar el scroll
  saveScrollPosition(pageName, position) {
    if (!this.states[pageName]) {
      this.states[pageName] = {};
    }
    this.states[pageName].scrollPosition = position;
  }

  restoreScrollPosition(pageName) {
    const state = this.states[pageName];
    if (state && state.scrollPosition) {
      // Restaurar después de que el DOM se haya actualizado
      setTimeout(() => {
        window.scrollTo(0, state.scrollPosition);
      }, 100);
    }
  }

  // Método para manejar errores de navegación y limpiar estado problemático
  handleNavigationError(pageName, error) {
    console.error(`[PageStateManager] Navigation error for ${pageName}:`, error);
    
    // Limpiar estado de la página problemática
    this.clearPageState(pageName);
    
    // Resetear banderas de carga
    this.setRestoring(false);
    
    // Limpiar datos corruptos del sessionStorage
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(`pageState_${pageName}`)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Error clearing sessionStorage:', e);
    }
  }

  // Método para manejar datos de la página
  savePageData(pageName, data) {
    if (!this.states[pageName]) {
      this.states[pageName] = {};
    }
    this.states[pageName].data = data;
  }

  getPageData(pageName) {
    const state = this.states[pageName];
    return state?.data || null;
  }
}

// Instancia singleton
const pageStateManager = new PageStateManager();

// Función helper para usar en componentes
export function usePageState(pageName) {
  return {
    saveState: (state) => pageStateManager.savePageState(pageName, state),
    restoreState: () => pageStateManager.restorePageState(pageName),
    clearState: () => pageStateManager.clearPageState(pageName),
    hasState: () => pageStateManager.hasPageState(pageName),
    saveScroll: (position) => pageStateManager.saveScrollPosition(pageName, position),
    restoreScroll: () => pageStateManager.restoreScrollPosition(pageName),
    saveData: (data) => pageStateManager.savePageData(pageName, data),
    getData: () => pageStateManager.getPageData(pageName),
    isRestoring: () => pageStateManager.isRestoringState,
    setRestoring: (value) => pageStateManager.setRestoring(value),
    handleError: (error) => pageStateManager.handleNavigationError(pageName, error)
  };
}

export { pageStateManager, PageStateManager };
