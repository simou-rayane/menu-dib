// ============================================
// SCRIPT.JS - FONCTIONS PARTAGÉES
// ============================================

// ============================================
// GESTION DES TABLES (index.html)
// ============================================

function displayTables() {
    const grid = document.getElementById('tableGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const tableDiv = document.createElement('div');
        tableDiv.className = 'table-card';
        tableDiv.innerHTML = `🪑 Table ${i}`;
        tableDiv.onclick = () => {
            localStorage.setItem('current_table', i);
            window.location.href = 'menu.html';
        };
        grid.appendChild(tableDiv);
    }
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function showToast(message, type = 'info') {
    const colors = {
        'success': '#4caf50',
        'error': '#f44336',
        'warning': '#ff9800',
        'info': '#2196F3'
    };
    const icons = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    
    const existing = document.querySelector('.menu-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `menu-toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || '📢'}</span> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideDownToast 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ============================================
// INITIALISATION
// ============================================

console.log('🚀 Script.js chargé');
