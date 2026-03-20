import { createRouter, createWebHistory } from 'vue-router';
/**
 * Central Route Aggregator
 *
 * Each module exports its own route definitions.
 * This file aggregates them under the appropriate layout.
 * Mirrors the backend's api/router.py pattern.
 */
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        // ── Public Routes (no auth required) ──────────────
        {
            path: '/login',
            name: 'login',
            component: () => import('./layouts/PublicLayout.vue'),
            children: [
                {
                    path: '',
                    name: 'login-page',
                    component: () => import('@/modules/identity/pages/LoginPage.vue'),
                },
            ],
        },
        // ── Authenticated Routes ──────────────────────────
        {
            path: '/app',
            component: () => import('./layouts/AuthenticatedLayout.vue'),
            // TODO: Add auth guard — beforeEnter: [authGuard]
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: () => import('@/modules/identity/pages/DashboardPage.vue'),
                },
                // Module routes will be spread here as they are implemented:
                // ...accountingRoutes,
                // ...paymentRequestRoutes,
                // ...bankingRoutes,
                // etc.
            ],
        },
        // ── Catch-all redirect ────────────────────────────
        {
            path: '/:pathMatch(.*)*',
            redirect: '/app',
        },
    ],
});
export { router };
