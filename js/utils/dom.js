/**
 * BAGH-CHAL: DOM UTILITY
 */
(function(window) {
  'use strict';

  window.BaghChal = window.BaghChal || {};

  const DOM = {
    $(selector, parent = document) {
      return parent.querySelector(selector);
    },

    $$(selector, parent = document) {
      return Array.from(parent.querySelectorAll(selector));
    },

    byId(id) {
      return document.getElementById(id);
    },

    show(el) {
      if (typeof el === 'string') el = this.byId(el);
      if (el) el.style.display = '';
    },

    hide(el) {
      if (typeof el === 'string') el = this.byId(el);
      if (el) el.style.display = 'none';
    },

    addClass(el, className) {
      if (typeof el === 'string') el = this.byId(el);
      if (el) el.classList.add(className);
    },

    removeClass(el, className) {
      if (typeof el === 'string') el = this.byId(el);
      if (el) el.classList.remove(className);
    },

    toggleClass(el, className, force) {
      if (typeof el === 'string') el = this.byId(el);
      if (el) el.classList.toggle(className, force);
    },

    showToast(message, type = 'gold', duration = 3000) {
      let container = this.byId('toastContainer');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.innerHTML = `<span>${message}</span>`;
      container.appendChild(toast);

      // Trigger animation
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  };

  window.BaghChal.DOM = DOM;
})(window);
