/**
 * DOM Utilities for ModernTable.js
 */

/**
 * Create element with attributes and content
 */
export function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else {
            element.setAttribute(key, value);
        }
    });
    
    if (content) {
        element.innerHTML = content;
    }
    
    return element;
}

/**
 * Add CSS classes
 */
export function addClass(element, ...classes) {
    element.classList.add(...classes);
}

/**
 * Remove CSS classes
 */
export function removeClass(element, ...classes) {
    element.classList.remove(...classes);
}

/**
 * Toggle CSS class
 */
export function toggleClass(element, className, force) {
    return element.classList.toggle(className, force);
}

/**
 * Check if element has class
 */
export function hasClass(element, className) {
    return element.classList.contains(className);
}

/**
 * Find element by selector
 */
export function find(selector, context = document) {
    return context.querySelector(selector);
}

/**
 * Find all elements by selector
 */
export function findAll(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

/**
 * Get element by ID
 */
export function getById(id) {
    return document.getElementById(id);
}

/**
 * Remove element from DOM
 */
export function remove(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

/**
 * Empty element content
 */
export function empty(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Insert element after target
 */
export function insertAfter(newElement, targetElement) {
    targetElement.parentNode.insertBefore(newElement, targetElement.nextSibling);
}

/**
 * Insert element before target
 */
export function insertBefore(newElement, targetElement) {
    targetElement.parentNode.insertBefore(newElement, targetElement);
}

/**
 * Get element dimensions
 */
export function getDimensions(element) {
    const rect = element.getBoundingClientRect();
    return {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom
    };
}

/**
 * Check if element is visible
 */
export function isVisible(element) {
    return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

/**
 * Detect CSS framework
 */
export function detectFramework() {
    const body = document.body;
    const html = document.documentElement;
    
    // Check for Bootstrap
    if (find('.container, .container-fluid') || 
        hasClass(body, 'bootstrap') || 
        find('link[href*="bootstrap"]')) {
        return 'bootstrap';
    }
    
    // Check for Tailwind
    if (hasClass(html, 'tailwind') || 
        find('link[href*="tailwind"]') ||
        find('[class*="bg-"], [class*="text-"], [class*="p-"], [class*="m-"]')) {
        return 'tailwind';
    }
    
    // Check for Bulma
    if (find('.container, .column') || 
        find('link[href*="bulma"]')) {
        return 'bulma';
    }
    
    return 'none';
}

/**
 * Get framework-specific classes
 */
export function getFrameworkClasses(framework = null) {
    if (!framework) {
        framework = detectFramework();
    }
    
    const classes = {
        bootstrap: {
            button: 'btn',
            buttonPrimary: 'btn btn-primary',
            buttonSecondary: 'btn btn-secondary',
            input: 'form-control',
            select: 'form-select',
            table: 'table',
            pagination: 'pagination',
            pageItem: 'page-item',
            pageLink: 'page-link'
        },
        tailwind: {
            button: 'px-4 py-2 rounded',
            buttonPrimary: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600',
            buttonSecondary: 'bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600',
            input: 'border border-gray-300 rounded px-3 py-2',
            select: 'border border-gray-300 rounded px-3 py-2',
            table: 'min-w-full divide-y divide-gray-200',
            pagination: 'flex space-x-1',
            pageItem: '',
            pageLink: 'px-3 py-2 border border-gray-300 rounded'
        },
        bulma: {
            button: 'button',
            buttonPrimary: 'button is-primary',
            buttonSecondary: 'button is-light',
            input: 'input',
            select: 'select',
            table: 'table',
            pagination: 'pagination-list',
            pageItem: '',
            pageLink: 'pagination-link'
        },
        none: {
            button: 'mt-button',
            buttonPrimary: 'mt-button mt-button-primary',
            buttonSecondary: 'mt-button mt-button-secondary',
            input: 'mt-input',
            select: 'mt-select',
            table: 'mt-table',
            pagination: 'mt-pagination',
            pageItem: 'mt-page-item',
            pageLink: 'mt-page-link'
        }
    };
    
    return classes[framework] || classes.none;
}