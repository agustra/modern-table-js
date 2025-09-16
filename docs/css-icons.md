# 🎨 CSS & Icons Guide

ModernTable.js features smart CSS priority system and automatic icon detection for maximum compatibility.

## 🎯 CSS Priority System

ModernTable.js automatically detects available frameworks and adjusts styling accordingly:

### Priority Order
1. **Bootstrap** (Highest) - Full UI framework
2. **Font Awesome** (High) - Icon library  
3. **ModernTable.css** (Fallback) - Built-in styling

## 🔍 Framework Detection

### Automatic Detection
```javascript
// ModernTable.js automatically detects:
const hasBootstrap = document.querySelector('link[href*="bootstrap"]') || window.bootstrap;
const hasFontAwesome = document.querySelector('link[href*="font-awesome"]');

// Adds body classes for CSS targeting
if (hasBootstrap) document.body.classList.add('bootstrap-loaded');
if (hasFontAwesome) document.body.classList.add('fontawesome-loaded');
```

### CSS Targeting
```css
/* Only applies when Bootstrap NOT loaded */
body:not(.bootstrap-loaded) .btn {
    /* Fallback button styling */
}

/* Only applies when Font Awesome NOT loaded */  
body:not(.fontawesome-loaded) .btn-csv::before {
    content: "📊"; /* CSS emoji icon */
}
```

## 🎨 How It Works

ModernTable.js uses a 3-tier system:

1. **Bootstrap** (if available) - Handles all UI styling
2. **Font Awesome** (if available) - Provides professional icons  
3. **ModernTable.css** (always) - Fallback styling + table-specific features

## 🎭 Icon System

### Smart Icon Detection
ModernTable.js automatically chooses the best available icon system:

```javascript
// Built-in button creation
getBuiltinButton(type) {
    const hasFontAwesome = document.body.classList.contains('fontawesome-loaded');
    
    return {
        copy: {
            text: hasFontAwesome ? '<i class="fas fa-copy"></i> Copy' : 'Copy',
            className: 'btn btn-secondary btn-sm btn-copy'
        },
        csv: {
            text: hasFontAwesome ? '<i class="fas fa-file-csv"></i> CSV' : 'CSV', 
            className: 'btn btn-success btn-sm btn-csv'
        }
    };
}
```

### Icon Priority
1. **Font Awesome** (if available) - `<i class="fas fa-copy"></i>`
2. **CSS Icons** (fallback) - `::before { content: "📋"; }`

## 📊 Icon Mapping

### Font Awesome Icons (When Available)
| Button | Font Awesome | CSS Fallback |
|--------|--------------|--------------|
| Copy | `fas fa-copy` | 📋 |
| CSV | `fas fa-file-csv` | 📊 |
| Excel | `fas fa-file-excel` | 📈 |
| PDF | `fas fa-file-pdf` | 📄 |
| Print | `fas fa-print` | 🖨 |
| Columns | `fas fa-columns` | ☰ |
| Delete | `fas fa-trash` | 🗑 |
| Edit | `fas fa-edit` | ✏ |
| Add | `fas fa-plus` | ➕ |
| Search | `fas fa-search` | 🔍 |
| Filter | `fas fa-filter` | 🔽 |
| Clear | `fas fa-eraser` | 🧹 |
| Keyboard | `fas fa-keyboard` | ⌨ |

### CSS Icon Implementation
```css
/* CSS icons (only when Font Awesome not available) */
body:not(.fontawesome-loaded) .btn-copy::before {
    content: "📋";
    margin-right: 4px;
}

body:not(.fontawesome-loaded) .btn-csv::before {
    content: "📊"; 
    margin-right: 4px;
}

body:not(.fontawesome-loaded) .btn-excel::before {
    content: "📈";
    margin-right: 4px;
}
```

## 🎨 Custom Icon Examples

### Using Font Awesome
```javascript
{
    extend: 'csv',
    text: '<i class="fas fa-download"></i> Download CSV',
    className: 'btn btn-primary'
}
```

### Using Custom CSS Icons
```css
.btn-custom::before {
    content: "🚀";
    margin-right: 4px;
}
```

```javascript
{
    text: 'Custom Export',
    className: 'btn btn-info btn-custom'
}
```

### Using Unicode Icons
```javascript
{
    extend: 'csv',
    text: '⬇️ Export Data',
    className: 'btn btn-success'
}
```

## 🎯 Styling Examples

### Bootstrap Integration
```javascript
const table = new ModernTable('#table', {
    buttons: [
        {
            extend: 'csv',
            text: 'Export',
            className: 'btn btn-success btn-sm',     // Bootstrap classes
            titleAttr: 'Export as CSV'
        },
        {
            extend: 'pdf', 
            text: 'PDF',
            className: 'btn btn-danger btn-sm',      // Bootstrap classes
            titleAttr: 'Export as PDF'
        }
    ]
});
```

### Custom CSS Classes
```css
/* Custom button styling */
.btn-export {
    background: linear-gradient(45deg, #28a745, #20c997);
    border: none;
    color: white;
    transition: all 0.3s ease;
}

.btn-export:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
```

```javascript
{
    extend: 'csv',
    text: 'Export',
    className: 'btn-export btn-sm'  // Custom class
}
```

## 🔧 Advanced CSS Customization

### Theme-Aware Styling
```css
/* Light theme */
[data-bs-theme="light"] .modern-table {
    background-color: #ffffff;
    color: #333333;
}

/* Dark theme */
[data-bs-theme="dark"] .modern-table {
    background-color: #2d3748;
    color: #e2e8f0;
}

/* Dark theme buttons */
[data-bs-theme="dark"] .btn-outline-secondary {
    border-color: #4a5568;
    color: #e2e8f0;
}
```

### Responsive Button Text
```javascript
{
    extend: 'csv',
    text: '<span class="d-none d-md-inline">Export </span>CSV',
    className: 'btn btn-success btn-sm'
}
// Mobile: "CSV"
// Desktop: "Export CSV"
```

### Icon-Only Buttons (Mobile)
```javascript
{
    extend: 'csv',
    text: '<i class="fas fa-file-csv d-md-none"></i><span class="d-none d-md-inline"><i class="fas fa-file-csv"></i> CSV</span>',
    className: 'btn btn-success btn-sm'
}
// Mobile: 📊 (icon only)
// Desktop: 📊 CSV (icon + text)
```

## 🎨 CSS Architecture

### ModernTable.css Structure
```css
/* 1. Framework Detection Classes */
body:not(.bootstrap-loaded) { /* Fallback styles */ }
body:not(.fontawesome-loaded) { /* CSS icons */ }

/* 2. Core Table Styles */
.modern-table { /* Base table styling */ }
.modern-table th { /* Header styling */ }
.modern-table td { /* Cell styling */ }

/* 3. Component Styles */
.modern-table-toolbar { /* Toolbar layout */ }
.modern-table-pagination { /* Pagination styling */ }

/* 4. Responsive Styles */
@media (max-width: 768px) { /* Mobile adjustments */ }

/* 5. Theme Support */
[data-bs-theme="dark"] { /* Dark theme */ }
```

### CSS Specificity Strategy
```css
/* Low specificity - easily overridden */
.btn { /* Base button */ }

/* Medium specificity - framework fallbacks */
body:not(.bootstrap-loaded) .btn { /* Bootstrap fallback */ }

/* High specificity - specific components */
.modern-table-wrapper .btn-sm { /* Component-specific */ }
```

## 🚀 Best Practices

### 1. Framework Detection
```javascript
// ✅ Good: Let ModernTable detect automatically
const table = new ModernTable('#table', {
    // ModernTable handles framework detection
});

// ❌ Avoid: Manual framework detection
if (typeof bootstrap !== 'undefined') {
    // Manual detection not needed
}
```

### 2. CSS Loading Order
```html
<!-- ✅ Correct order -->
<link href="bootstrap.css" rel="stylesheet">      <!-- 1. Framework -->
<link href="font-awesome.css" rel="stylesheet">   <!-- 2. Icons -->
<link href="modern-table.css" rel="stylesheet">   <!-- 3. ModernTable -->

<!-- ❌ Wrong order -->
<link href="modern-table.css" rel="stylesheet">   <!-- ModernTable first -->
<link href="bootstrap.css" rel="stylesheet">      <!-- Bootstrap overrides -->
```

### 3. Icon Consistency
```javascript
// ✅ Good: Let ModernTable handle icons
buttons: ['copy', 'csv', 'pdf']  // Consistent icons automatically

// ✅ Good: Custom icons consistently
buttons: [
    { extend: 'csv', text: '<i class="fas fa-download"></i> CSV' },
    { extend: 'pdf', text: '<i class="fas fa-download"></i> PDF' }
]

// ❌ Avoid: Mixed icon systems
buttons: [
    { extend: 'csv', text: '<i class="fas fa-file-csv"></i> CSV' },  // Font Awesome
    { extend: 'pdf', text: '📄 PDF' }                               // Emoji
]
```

## 🎯 Framework Compatibility

### Bootstrap Versions
- ✅ Bootstrap 5.x (Recommended)
- ✅ Bootstrap 4.x (Compatible)
- ✅ Bootstrap 3.x (Basic support)

### Font Awesome Versions
- ✅ Font Awesome 6.x (Recommended)
- ✅ Font Awesome 5.x (Compatible)
- ✅ Font Awesome 4.x (Basic support)

### CSS Framework Alternatives
- ✅ Tailwind CSS (with custom classes)
- ✅ Bulma (with custom classes)
- ✅ Foundation (with custom classes)
- ✅ Pure CSS (standalone mode)

## Alternative Text-based Icons

For maximum compatibility, ModernTable.css includes alternative text-based icons:

```css
.icon-sort::before { content: "⇅"; }
.icon-sort-asc::before { content: "↑"; }
.icon-sort-desc::before { content: "↓"; }
.icon-copy::before { content: "⧉"; }
.icon-csv::before { content: "≡"; }
.icon-excel::before { content: "⊞"; }
.icon-pdf::before { content: "⬜"; }
.icon-print::before { content: "⎙"; }
.icon-columns::before { content: "☰"; }
.icon-delete::before { content: "✕"; }
.icon-edit::before { content: "✎"; }
.icon-add::before { content: "＋"; }
.icon-search::before { content: "🔍"; }
.icon-filter::before { content: "▼"; }
.icon-clear::before { content: "⌫"; }
.icon-keyboard::before { content: "⌨"; }
```

## 🎉 Summary

ModernTable.js provides intelligent CSS and icon management:

- 🎯 **Smart Detection** - Automatically detects available frameworks
- 🎨 **Priority System** - Bootstrap → Font Awesome → Built-in CSS
- 🔄 **Fallback Support** - Works with or without frameworks
- 📱 **Responsive** - Mobile-first design
- 🎭 **Flexible Icons** - Font Awesome, CSS, or custom
- ⚡ **Zero Config** - Works out of the box

**Your tables look great regardless of your CSS setup!** 🚀