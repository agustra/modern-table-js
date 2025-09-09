/**
 * formatters.js - Data formatters utility for ModernTable.js
 * Sesuai master plan: utils/formatters.js (1KB)
 */

/**
 * Format date
 */
export function formatDate(value, format = 'short') {
    if (!value) return '';
    
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    
    switch (format) {
        case 'short':
            return date.toLocaleDateString();
        case 'long':
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        case 'time':
            return date.toLocaleTimeString();
        case 'datetime':
            return date.toLocaleString();
        case 'iso':
            return date.toISOString().split('T')[0];
        default:
            return date.toLocaleDateString();
    }
}

/**
 * Format currency
 */
export function formatCurrency(value, currency = 'USD', locale = 'en-US') {
    if (value === null || value === undefined || isNaN(value)) return '';
    
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(value);
}

/**
 * Format number
 */
export function formatNumber(value, decimals = 0, locale = 'en-US') {
    if (value === null || value === undefined || isNaN(value)) return '';
    
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) return '';
    
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value / 100);
}

/**
 * Format boolean
 */
export function formatBoolean(value, trueText = 'Yes', falseText = 'No') {
    if (value === null || value === undefined) return '';
    return value ? trueText : falseText;
}

/**
 * Format badge
 */
export function formatBadge(value, colorMap = {}) {
    if (!value) return '';
    
    const defaultColors = {
        active: 'success',
        inactive: 'danger',
        pending: 'warning',
        completed: 'success',
        cancelled: 'danger',
        draft: 'secondary'
    };
    
    const colors = { ...defaultColors, ...colorMap };
    const color = colors[value.toLowerCase()] || 'secondary';
    
    return `<span class="badge bg-${color}">${value}</span>`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    if (!bytes) return '';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format phone number
 */
export function formatPhone(value, format = 'US') {
    if (!value) return '';
    
    const cleaned = value.replace(/\D/g, '');
    
    if (format === 'US' && cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    return value;
}

/**
 * Truncate text
 */
export function truncateText(text, length = 50, suffix = '...') {
    if (!text) return '';
    if (text.length <= length) return text;
    
    return text.substring(0, length) + suffix;
}

/**
 * Format status with icon
 */
export function formatStatus(value, iconMap = {}) {
    if (!value) return '';
    
    const defaultIcons = {
        active: 'fas fa-check-circle text-success',
        inactive: 'fas fa-times-circle text-danger',
        pending: 'fas fa-clock text-warning',
        completed: 'fas fa-check text-success',
        cancelled: 'fas fa-ban text-danger'
    };
    
    const icons = { ...defaultIcons, ...iconMap };
    const icon = icons[value.toLowerCase()] || 'fas fa-circle text-secondary';
    
    return `<i class="${icon}"></i> ${value}`;
}

/**
 * Built-in formatters registry
 */
export const formatters = {
    date: formatDate,
    currency: formatCurrency,
    number: formatNumber,
    percentage: formatPercentage,
    boolean: formatBoolean,
    badge: formatBadge,
    filesize: formatFileSize,
    phone: formatPhone,
    truncate: truncateText,
    status: formatStatus
};

/**
 * Apply formatter by name
 */
export function applyFormatter(value, formatterName, options = {}) {
    const formatter = formatters[formatterName];
    if (!formatter) {
        console.warn(`Unknown formatter: ${formatterName}`);
        return value;
    }
    
    return formatter(value, ...Object.values(options));
}