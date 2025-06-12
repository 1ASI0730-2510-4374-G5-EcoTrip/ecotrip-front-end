import { createRouter, createWebHistory } from 'vue-router';
import DefaultLayout from '@/Shared/Presentation/DefaultLayout.vue';
import { AuthSession } from '@/Auth/Domain/auth-session.aggregate.js';

// Clean invalid sessions on router initialization
const existingSession = AuthSession.fromStorage();
if (existingSession && !existingSession.isValid()) {
    AuthSession.clear();
}

const getHomeRedirect = () => {
    const session = AuthSession.fromStorage();
    if (!session?.isValid()) {
        return '/login';
    }
    return session.isAgency() ? '/manage-experiences' : '/experiences';
};

const routes = [
    {
        path: '/',
        name: 'Home',
        redirect: '/login'
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
                component: () => import('@/Experience/Presentation/Pages/manage-experiences.page.vue'),
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
        path: '/:catchAll(.*)', 
        redirect: '/login' 
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to, from, next) => {
    const session = AuthSession.fromStorage();
    const isAuthenticated = session?.isValid() ?? false;

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

    // Guest-only routes (login, register)
    if (to.meta.requiresGuest && isAuthenticated) {
        next(getHomeRedirect());
        return;
    }

    // Authentication required routes
    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login');
        return;
    }

    if (isAuthenticated) {
        // Agency-only routes
        if (to.meta.requiresAgency && !session.isAgency()) {
            next('/experiences');
            return;
        }

        // Tourist-only routes
        if (to.meta.requiresTourist && !session.isTourist()) {
            next('/experiences');
            return;
        }

        // Special case: /manage-experiences is only for agencies
        if (to.path.startsWith('/manage-experiences') && !session.isAgency()) {
            next('/experiences');
            return;
        }

        // Special case: /bookings is only for tourists
        if (to.path.startsWith('/bookings') && !session.isTourist()) {
            next('/experiences');
            return;
        }
    }

    next();
});

export default router;
