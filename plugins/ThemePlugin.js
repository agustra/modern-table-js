/**
 * ThemePlugin.js - Dark Mode & Theme Management
 */

export class ThemePlugin {
  constructor(table) {
    this.table = table;
    this.currentTheme = "auto";
    this.init();
  }

  init() {
    this.detectSystemTheme();
    this.applyTheme();
    this.setupThemeListener();
    this.setupDataLoadListener();
  }

  detectSystemTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("modern-table-theme");
    if (savedTheme) {
      this.currentTheme = savedTheme;
      return;
    }

    // Check system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      this.currentTheme = "dark";
    } else {
      this.currentTheme = "light";
    }
  }

  applyTheme(theme = this.currentTheme) {
    const wrapper = this.table.wrapper;
    if (!wrapper) return;

    // Remove existing theme classes
    wrapper.classList.remove("theme-light", "theme-dark", "theme-auto");

    // Apply new theme
    if (theme === "auto") {
      // Check data-bs-theme first, then system preference
      const htmlTheme = document.documentElement.getAttribute('data-bs-theme');
      const bodyTheme = document.body.getAttribute('data-bs-theme');
      
      let isDark;
      if (htmlTheme === 'dark' || bodyTheme === 'dark') {
        isDark = true;
      } else if (htmlTheme === 'light' || bodyTheme === 'light') {
        isDark = false;
      } else {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      
      wrapper.classList.add(isDark ? "theme-dark" : "theme-light");
    } else {
      wrapper.classList.add(`theme-${theme}`);
    }

    // Update CSS custom properties
    this.updateCSSVariables(theme);

    this.currentTheme = theme;
    localStorage.setItem("modern-table-theme", theme);
  }

  updateCSSVariables(theme) {
    const root = document.documentElement;
    
    let isDark;
    if (theme === "dark") {
      isDark = true;
    } else if (theme === "light") {
      isDark = false;
    } else if (theme === "auto") {
      // Check data-bs-theme first, then system preference
      const htmlTheme = document.documentElement.getAttribute('data-bs-theme');
      const bodyTheme = document.body.getAttribute('data-bs-theme');
      
      if (htmlTheme === 'dark' || bodyTheme === 'dark') {
        isDark = true;
      } else if (htmlTheme === 'light' || bodyTheme === 'light') {
        isDark = false;
      } else {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
    }

    if (isDark) {
      // Dark theme variables
      root.style.setProperty("--mt-bg-color", "#1a1a1a");
      root.style.setProperty("--mt-text-color", "#ffffff");
      root.style.setProperty("--mt-border-color", "#333333");
      root.style.setProperty("--mt-hover-color", "#2d2d2d");
      root.style.setProperty("--mt-header-bg", "#2d2d2d");
      root.style.setProperty("--mt-selected-bg", "#0d47a1");
    } else {
      // Light theme variables
      root.style.setProperty("--mt-bg-color", "#ffffff");
      root.style.setProperty("--mt-text-color", "#212529");
      root.style.setProperty("--mt-border-color", "#dee2e6");
      root.style.setProperty("--mt-hover-color", "#f8f9fa");
      root.style.setProperty("--mt-header-bg", "#f8f9fa");
      root.style.setProperty("--mt-selected-bg", "#e3f2fd");
    }
  }

  setupThemeListener() {
    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", () => {
        if (this.currentTheme === "auto") {
          this.applyTheme("auto");
        }
      });
    }
  }

  setTheme(theme) {
    if (["light", "dark", "auto"].includes(theme)) {
      this.applyTheme(theme);
    }
  }

  getTheme() {
    return this.currentTheme;
  }

  setupDataLoadListener() {
    // Listen for data changes to reapply theme if needed
    this.table.on("initComplete", () => {
      // Only reapply if theme classes are missing (performance optimization)
      const wrapper = this.table.wrapper;
      if (
        wrapper &&
        !wrapper.classList.contains(`theme-${this.currentTheme}`)
      ) {
        requestAnimationFrame(() => {
          this.applyTheme(this.currentTheme);
        });
      }
    });
    
    // Force icon colors after buttons are created
    this.setupIconColorFix();
  }
  
  setupIconColorFix() {
    // Observer to fix icon colors when buttons are added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              this.forceIconColors(node);
            }
          });
        }
      });
    });
    
    if (this.table.wrapper) {
      observer.observe(this.table.wrapper, {
        childList: true,
        subtree: true
      });
    }
    
    // Initial fix
    setTimeout(() => {
      if (this.table.wrapper) {
        this.forceIconColors(this.table.wrapper);
      }
    }, 100);
  }
  
  forceIconColors(element) {
    if (this.currentTheme === 'dark' || 
        (this.currentTheme === 'auto' && this.isDarkMode())) {
      const icons = element.querySelectorAll('.btn i, .btn .fas, .btn .fa, .btn .far, .btn .fab');
      icons.forEach(icon => {
        icon.style.color = '#adb5bd';
      });
    }
  }
  
  isDarkMode() {
    const htmlTheme = document.documentElement.getAttribute('data-bs-theme');
    const bodyTheme = document.body.getAttribute('data-bs-theme');
    
    if (htmlTheme === 'dark' || bodyTheme === 'dark') {
      return true;
    } else if (htmlTheme === 'light' || bodyTheme === 'light') {
      return false;
    } else {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  }

  toggleTheme() {
    const themes = ["light", "dark", "auto"];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    this.setTheme(nextTheme);
    return nextTheme;
  }
}
