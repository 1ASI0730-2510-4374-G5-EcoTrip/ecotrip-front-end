import { createRouter, createWebHistory } from 'vue-router';
import DefaultLayout from '@/Shared/Presentation/DefaultLayout.vue';
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate.js';
import { navigationService } from '@/Shared/Application/navigation.service.js';

// Clean invalid sessions on router initialization
const existingSession = AuthSession.fromStorage();
if (!existingSession || !existingSession.isValid()) {
    console.log('[Router] No valid session found, clearing session data');
    AuthSession.clear();
}

const getHomeRedirect = () => {
    const session = AuthSession.fromStorage();
    if (!session?.isValid()) {
        console.log('[Router] Invalid session, redirecting to login');
        return '/login';
    }
    const redirect = session.isAgency() ? '/manage-experiences' : '/experiences';
    console.log('[Router] Valid session, redirecting to:', redirect);
    return redirect;
};

const routes = [
    {
        path: '/',
        name: 'Home',
        beforeEnter: (to, from, next) => {
            const session = AuthSession.fromStorage();
            if (!session?.isValid()) {
                next('/login');
            } else {
                next(session.isAgency() ? '/manage-experiences' : '/experiences');
            }
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/Auth/Presentation/pages/LoginPage.vue'),
        meta: { layout: 'auth', requiresGuest: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/Auth/Presentation/pages/RegisterPage.vue'),
        meta: { layout: 'auth', requiresGuest: true }
    },
    {
        path: '/experiences',
        component: DefaultLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'ExperienceList',
                component: () => import('@/Experience/Presentation/Pages/experience-list.page.vue'),
                props: true
            },
            {
                path: ':id',
                name: 'ExperienceDetails',
                component: () => import('@/Experience/Presentation/Pages/experience-details.page.vue'),
                props: true
            }
        ]
    },
    {
        path: '/manage-experiences',
        component: DefaultLayout,
        meta: { requiresAuth: true, requiresAgency: true },
        children: [
            {
                path: '',
                name: 'ManageExperiences',
                component: () => import('@/Experience/Presentation/Pages/manage-experiences-new.page.vue'),
                beforeEnter: (to, from, next) => {
                    const session = AuthSession.fromStorage();
                    if (!session?.isAgency()) {
                        next('/experiences');
                    } else {
                        next();
                    }
                }
            },
            {
                path: 'create',
                name: 'CreateExperience',
                component: () => import('@/Experience/Presentation/Components/experience-form.component.vue')
            },
            {
                path: ':id/edit',
                name: 'EditExperience',
                component: () => import('@/Experience/Presentation/Components/experience-form.component.vue')
            }
        ]
    },
    {
        path: '/agency',
        component: DefaultLayout,
        meta: { requiresAuth: true, requiresAgency: true },
        children: [
            {
                path: 'profile',
                name: 'AgencyProfile',
                component: () => import('@/Agency/Presentation/agency-profile.page.vue')
            }
        ]
    },
    {
        path: '/tourist',
        component: DefaultLayout,
        meta: { requiresAuth: true, requiresTourist: true },
        children: [
            {
                path: 'profile',
                name: 'TouristProfile',
                component: () => import('@/Tourist/Presentation/tourist-profile.page.vue')
            }
        ]
    },
    {
        path: '/reservations',
        component: DefaultLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'Reservations',
                component: () => import('@/Reservations/Presentation/reservations-view.page.vue'),
                beforeEnter: (to, from, next) => {
                    const session = AuthSession.fromStorage();
                    if (session?.isAgency()) {
                        // Redirect agencies to their specific reservations page
                        next('/agency-reservations');
                    } else {
                        next();
                    }
                }
            }
        ]
    },
    {
        path: '/agency-reservations',
        component: DefaultLayout,
        meta: { requiresAuth: true, requiresAgency: true },
        children: [
            {
                path: '',
                name: 'AgencyReservations',
                component: () => import('@/Reservations/Presentation/agency-reservations.page.vue'),
                beforeEnter: (to, from, next) => {
                    const session = AuthSession.fromStorage();
                    if (!session?.isAgency()) {
                        next('/reservations');
                    } else {
                        next();
                    }
                }
            }
        ]
    },
    { 
        path: '/:catchAll(.*)', 
        redirect: '/login' 
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Manejo de errores de navegación
router.onError((error, to) => {
    console.error('[Router] Navigation error:', error);
    const fallbackRoute = navigationService.handleNavigationError(error, to.path);
    if (fallbackRoute) {
        router.push(fallbackRoute);
    }
});

// Después de cada navegación exitosa, limpiar el estado de carga
router.afterEach(() => {
    navigationService.setLoading(false);
});

router.beforeEach(async (to, from, next) => {
    const session = AuthSession.fromStorage();
    const isAuthenticated = session?.isValid() ?? false;

    // Configurar estado de carga
    navigationService.setLoading(true);

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
        console.log('Navigation:', { 
            to: to.path, 
            from: from.path,
            authenticated: isAuthenticated,
            isAgency: session?.isAgency(),
            isTourist: session?.isTourist()
        });
    }

    // Actualizar sección actual en el service
    const sectionMap = {
        '/experiences': 'experiences',
        '/manage-experiences': 'manage-experiences',
        '/reservations': 'reservations',
        '/agency-reservations': 'agency-reservations',
        '/agency/profile': 'agency-profile',
        '/tourist/profile': 'tourist-profile'
    };

    const section = Object.keys(sectionMap).find(key => to.path.startsWith(key));
    if (section) {
        navigationService.setCurrentSection(sectionMap[section]);
    }

    // Guest-only routes (login, register)
    if (to.meta.requiresGuest && isAuthenticated) {
        console.log('[Router] Authenticated user trying to access guest route, redirecting to home');
        navigationService.setLoading(false);
        next(getHomeRedirect());
        return;
    }

    // Authentication required routes
    if (to.meta.requiresAuth && !isAuthenticated) {
        console.log('[Router] Unauthenticated user trying to access protected route, redirecting to login');
        navigationService.setLoading(false);
        next({
            path: '/login',
            query: { redirect: to.fullPath }
        });
        return;
    }

    // For the root path, redirect to appropriate home
    if (to.path === '/') {
        if (isAuthenticated) {
            const redirect = getHomeRedirect();
            console.log('[Router] Root path access, redirecting to:', redirect);
            navigationService.setLoading(false);
            next(redirect);
        } else {
            console.log('[Router] Root path access without auth, redirecting to login');
            navigationService.setLoading(false);
            next('/login');
        }
        return;
    }

    // Role-based access control
    if (isAuthenticated && session) {
        // Agency trying to access tourist-only routes
        if (session.isAgency() && to.meta.requiresTourist) {
            console.log('[Router] Agency trying to access tourist route, redirecting to home');
            navigationService.setLoading(false);
            next(getHomeRedirect());
            return;
        }

        // Tourist trying to access agency-only routes
        if (session.isTourist() && to.meta.requiresAgency) {
            console.log('[Router] Tourist trying to access agency route, redirecting to home');
            navigationService.setLoading(false);
            next(getHomeRedirect());
            return;
        }
    }

    // Continue with navigation
    navigationService.setLoading(false);
    next();
});

export default router;
