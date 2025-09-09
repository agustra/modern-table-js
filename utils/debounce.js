/**
 * Performance utilities for ModernTable.js
 */

/**
 * Debounce function - delays execution until after delay
 */
export function debounce(func, delay = 300) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Throttle function - limits execution frequency
 */
export function throttle(func, limit = 100) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Request animation frame wrapper
 */
export function raf(callback) {
    return requestAnimationFrame(callback);
}

/**
 * Cancel animation frame
 */
export function cancelRaf(id) {
    return cancelAnimationFrame(id);
}

/**
 * Batch DOM operations
 */
export function batchDOMUpdates(callback) {
    return new Promise(resolve => {
        raf(() => {
            callback();
            resolve();
        });
    });
}

/**
 * Measure performance
 */
export function measurePerformance(name, callback) {
    const start = performance.now();
    const result = callback();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
}