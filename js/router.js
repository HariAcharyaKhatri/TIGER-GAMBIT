/**
 * BAGH-CHAL: CLIENT-SIDE ROUTER & VIEW MANAGER
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};
  const DOM = window.BaghChal.DOM;
  const Leaderboard = window.BaghChal.Leaderboard;
  const Statistics = window.BaghChal.Statistics;

  class Router {
    constructor() {
      this.currentRoute = 'home';
      this.routes = ['home', 'game', 'learn', 'puzzles', 'leaderboard', 'statistics', 'history', 'profile', 'settings', 'about'];
    }

    init() {
      window.addEventListener('hashchange', () => this.handleHashChange());
      // Handle initial route
      this.handleHashChange();
    }

    handleHashChange() {
      const hash = window.location.hash.replace('#', '') || 'home';
      const targetRoute = this.routes.includes(hash) ? hash : 'home';
      this.navigate(targetRoute, false);
    }

    navigate(route, updateHash = true) {
      if (!this.routes.includes(route)) route = 'home';
      this.currentRoute = route;

      if (updateHash) {
        window.location.hash = route;
      }

      // Hide all view sections, show active
      DOM.$$('.view-section').forEach(section => {
        section.classList.remove('active');
      });

      const activeSection = DOM.byId(`section-${route}`);
      if (activeSection) {
        activeSection.classList.add('active');
      }

      // Update navbar links
      DOM.$$('.nav-link').forEach(link => {
        const navTarget = link.getAttribute('data-nav');
        DOM.toggleClass(link, 'active', navTarget === route);
      });

      // Close mobile drawer if open
      const navLinks = DOM.byId('navLinks');
      if (navLinks) navLinks.classList.remove('mobile-open');

      // Scroll to top
      window.scrollTo(0, 0);

      // Trigger route lifecycle hooks
      this._onRouteEnter(route);
    }

    _onRouteEnter(route) {
      if (route === 'leaderboard' || route === 'history') {
        if (Leaderboard) Leaderboard.render('leaderboardContainer');
      } else if (route === 'statistics') {
        if (Statistics) Statistics.render('statsContainer');
      } else if (route === 'game') {
        const controller = window.BaghChal.GameController;
        if (controller && controller.renderer) {
          setTimeout(() => {
            const container = DOM.byId('boardContainer');
            if (container) {
              controller.renderer.resize(container.clientWidth);
              controller.render();
            }
          }, 50);
        }
      }
    }
  }

  window.BaghChal.Router = new Router();
})(window);
