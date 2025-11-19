// State Management
const state = {
    theme: localStorage.getItem('dashboard-theme') || 'light',
    activePage: 'dashboard',
    users: [
        { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', lastActivity: '2023-06-15', plan: 'Pro' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active', lastActivity: '2023-06-14', plan: 'Enterprise' },
        { id: 3, name: 'Robert Johnson', email: 'robert@example.com', status: 'Inactive', lastActivity: '2023-05-20', plan: 'Basic' },
        { id: 4, name: 'Emily Davis', email: 'emily@example.com', status: 'Active', lastActivity: '2023-06-10', plan: 'Pro' },
        { id: 5, name: 'Michael Wilson', email: 'michael@example.com', status: 'Active', lastActivity: '2023-06-12', plan: 'Enterprise' },
        { id: 6, name: 'Sarah Brown', email: 'sarah@example.com', status: 'Active', lastActivity: '2023-06-11', plan: 'Basic' }
    ],
    revenueChart: null,
    signupsChart: null,
    chartPeriods: {
        revenue: 'monthly',
        signups: 'weekly'
    },
    currentPlan: {
        name: 'Pro Plan',
        price: '$49',
        features: [
            'Up to 10 team members',
            '50GB storage',
            'Priority support',
            'Advanced analytics'
        ]
    }
};

// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const themeToggle = document.getElementById('theme-toggle');
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const settingsNavItems = document.querySelectorAll('.settings-nav-item');
const settingsTabs = document.querySelectorAll('.settings-tab');
const themeOptions = document.querySelectorAll('.theme-option');

// Initialize the application
function init() {
    // Set initial theme
    setTheme(state.theme);
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize charts
    initCharts();
    
    // Render users tables
    renderUsersTable('recent-users-table-body', state.users.slice(0, 3));
    renderUsersTable('users-table-body', state.users);
    
    // Set up button functionality
    setupButtonFunctionality();
    
    // Update current plan display
    updateCurrentPlanDisplay();
}

// Set up event listeners
function setupEventListeners() {
    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    // Sidebar overlay click
    sidebarOverlay.addEventListener('click', closeMobileMenu);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            setActivePage(page);
            closeMobileMenu();
        });
    });
    
    // Settings navigation
    settingsNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.getAttribute('data-tab');
            setActiveSettingsTab(tab);
        });
    });
    
    // Theme options
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');
            setTheme(theme);
        });
    });
    
    // Window resize handler
    window.addEventListener('resize', handleResize);
    
    // Search functionality
    document.getElementById('user-search').addEventListener('input', handleUserSearch);
    document.getElementById('all-users-search').addEventListener('input', handleAllUsersSearch);
    
    // Chart period buttons
    document.querySelectorAll('.chart-action-btn').forEach(btn => {
        btn.addEventListener('click', handleChartPeriodChange);
    });
}

// Set up button functionality
function setupButtonFunctionality() {
    // Add User buttons
    document.getElementById('add-user-btn').addEventListener('click', showAddUserModal);
    document.getElementById('add-user-page-btn').addEventListener('click', showAddUserModal);
    
    // Filter buttons
    document.getElementById('filter-btn').addEventListener('click', showFilterModal);
    document.getElementById('users-filter-btn').addEventListener('click', showFilterModal);
    
    // Export button
    document.getElementById('export-users-btn').addEventListener('click', exportUsers);
    
    // Billing buttons
    document.getElementById('change-plan-btn').addEventListener('click', showChangePlanModal);
    document.getElementById('cancel-subscription-btn').addEventListener('click', showCancelSubscriptionModal);
    document.getElementById('update-payment-btn').addEventListener('click', showUpdatePaymentModal);
    document.getElementById('edit-billing-btn').addEventListener('click', showEditBillingModal);
    
    // Settings buttons
    document.getElementById('save-general-btn').addEventListener('click', saveGeneralSettings);
    document.getElementById('update-password-btn').addEventListener('click', updatePassword);
    document.getElementById('enable-2fa-btn').addEventListener('click', enable2FA);
}

// Handle window resize
function handleResize() {
    // Close mobile menu on larger screens
    if (window.innerWidth >= 1024 && sidebar.classList.contains('open')) {
        closeMobileMenu();
    }
    
    // Adjust sidebar for mobile
    if (window.innerWidth < 768) {
        if (!sidebar.classList.contains('open')) {
            sidebar.classList.add('mobile-collapsed');
        } else {
            sidebar.classList.remove('mobile-collapsed');
        }
    } else {
        sidebar.classList.remove('mobile-collapsed');
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    
    // Adjust sidebar for mobile
    if (window.innerWidth < 768) {
        if (!sidebar.classList.contains('open')) {
            sidebar.classList.add('mobile-collapsed');
        } else {
            sidebar.classList.remove('mobile-collapsed');
        }
    }
}

// Close mobile menu
function closeMobileMenu() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
    
    // Adjust sidebar for mobile
    if (window.innerWidth < 768) {
        sidebar.classList.add('mobile-collapsed');
    }
}

// Toggle theme
function toggleTheme() {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Set theme
function setTheme(theme) {
    state.theme = theme;
    document.body.className = `${theme}-mode`;
    localStorage.setItem('dashboard-theme', theme);
    
    // Update theme toggle icon
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    
    // Update active theme option
    themeOptions.forEach(option => {
        if (option.getAttribute('data-theme') === theme) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Re-render charts with new theme
    initCharts();
}

// Set active page
function setActivePage(page) {
    state.activePage = page;
    
    // Update navigation items
    navItems.forEach(item => {
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update page content
    pages.forEach(pageEl => {
        if (pageEl.id === `${page}-page`) {
            pageEl.classList.remove('hidden');
            pageEl.classList.add('active');
        } else {
            pageEl.classList.add('hidden');
            pageEl.classList.remove('active');
        }
    });
    
    // Update page title
    const pageTitle = document.querySelector('.page-title');
    pageTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);
}

// Set active settings tab
function setActiveSettingsTab(tab) {
    // Update navigation items
    settingsNavItems.forEach(item => {
        if (item.getAttribute('data-tab') === tab) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update tab content
    settingsTabs.forEach(tabEl => {
        if (tabEl.id === `${tab}-tab`) {
            tabEl.classList.remove('hidden');
            tabEl.classList.add('active');
        } else {
            tabEl.classList.add('hidden');
            tabEl.classList.remove('active');
        }
    });
}

// Initialize charts
function initCharts() {
    // Destroy existing charts if they exist
    if (state.revenueChart) {
        state.revenueChart.destroy();
    }
    if (state.signupsChart) {
        state.signupsChart.destroy();
    }
    
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        const data = getRevenueData(state.chartPeriods.revenue);
        state.revenueChart = new Chart(revenueCtx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: state.theme === 'light' ? '#64748b' : '#cbd5e1'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: state.theme === 'light' ? '#e2e8f0' : '#334155'
                        },
                        ticks: {
                            color: state.theme === 'light' ? '#64748b' : '#94a3b8'
                        }
                    },
                    y: {
                        grid: {
                            color: state.theme === 'light' ? '#e2e8f0' : '#334155'
                        },
                        ticks: {
                            color: state.theme === 'light' ? '#64748b' : '#94a3b8'
                        }
                    }
                }
            }
        });
    }

    // Signups Chart
    const signupsCtx = document.getElementById('signupsChart');
    if (signupsCtx) {
        const data = getSignupsData(state.chartPeriods.signups);
        state.signupsChart = new Chart(signupsCtx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: state.theme === 'light' ? '#64748b' : '#cbd5e1'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: state.theme === 'light' ? '#e2e8f0' : '#334155'
                        },
                        ticks: {
                            color: state.theme === 'light' ? '#64748b' : '#94a3b8'
                        }
                    },
                    y: {
                        grid: {
                            color: state.theme === 'light' ? '#e2e8f0' : '#334155'
                        },
                        ticks: {
                            color: state.theme === 'light' ? '#64748b' : '#94a3b8'
                        }
                    }
                }
            }
        });
    }
}

// Get revenue data based on period
function getRevenueData(period) {
    let labels, revenueData, usersData;
    
    switch(period) {
        case 'monthly':
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            revenueData = [4000, 3000, 2000, 2780, 1890, 2390, 3490, 4000, 3000, 2000, 2780, 1890];
            usersData = [2400, 1398, 9800, 3908, 4800, 3800, 4300, 2400, 1398, 9800, 3908, 4800];
            break;
        case 'quarterly':
            labels = ['Q1', 'Q2', 'Q3', 'Q4'];
            revenueData = [9000, 7060, 9880, 6670];
            usersData = [13598, 12508, 10700, 11508];
            break;
        case 'yearly':
            labels = ['2020', '2021', '2022', '2023'];
            revenueData = [18000, 24000, 32000, 38500];
            usersData = [35000, 42000, 51000, 58000];
            break;
        default:
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            revenueData = [4000, 3000, 2000, 2780, 1890, 2390];
            usersData = [2400, 1398, 9800, 3908, 4800, 3800];
    }
    
    return {
        labels: labels,
        datasets: [
            {
                label: 'Revenue',
                data: revenueData,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Users',
                data: usersData,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };
}

// Get signups data based on period
function getSignupsData(period) {
    let labels, data;
    
    switch(period) {
        case 'weekly':
            labels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'];
            data = [400, 300, 200, 278, 189, 239, 349];
            break;
        case 'monthly':
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            data = [1200, 900, 1500, 1800, 2100, 2400];
            break;
        default:
            labels = ['W1', 'W2', 'W3', 'W4'];
            data = [400, 300, 200, 278];
    }
    
    return {
        labels: labels,
        datasets: [{
            label: 'User Signups',
            data: data,
            backgroundColor: '#4f46e5',
            borderRadius: 4
        }]
    };
}

// Render users table
function renderUsersTable(tableBodyId, users) {
    const usersTableBody = document.getElementById(tableBodyId);
    if (usersTableBody) {
        usersTableBody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            
            // Determine status badge class
            const statusClass = user.status === 'Active' ? 'status-active' : 'status-inactive';
            const statusIcon = user.status === 'Active' ? 'fa-check-circle' : 'fa-times-circle';
            
            // Determine plan badge class
            let planClass = 'plan-basic';
            if (user.plan === 'Pro') planClass = 'plan-pro';
            if (user.plan === 'Enterprise') planClass = 'plan-enterprise';
            
            row.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center;">
                        <div class="user-avatar" style="margin-right: 10px;">${user.name.split(' ').map(n => n[0]).join('')}</div>
                        <div>
                            <div>${user.name}</div>
                            <div class="text-muted">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                        ${user.status}
                    </span>
                </td>
                <td>
                    <span class="plan-badge ${planClass}">${user.plan}</span>
                </td>
                <td>${user.lastActivity}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-user-btn" data-id="${user.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit-user-btn" data-id="${user.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-user-btn" data-id="${user.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            usersTableBody.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.view-user-btn').forEach(btn => {
            btn.addEventListener('click', () => viewUser(btn.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.edit-user-btn').forEach(btn => {
            btn.addEventListener('click', () => editUser(btn.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteUser(btn.getAttribute('data-id')));
        });
    }
}

// Handle user search
function handleUserSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredUsers = state.users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) || 
        user.email.toLowerCase().includes(searchTerm)
    ).slice(0, 3);
    
    renderUsersTable('recent-users-table-body', filteredUsers);
}

// Handle all users search
function handleAllUsersSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredUsers = state.users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) || 
        user.email.toLowerCase().includes(searchTerm)
    );
    
    renderUsersTable('users-table-body', filteredUsers);
}

// Handle chart period change
function handleChartPeriodChange(e) {
    const button = e.target;
    const period = button.getAttribute('data-period');
    const chartType = button.closest('.chart-container').querySelector('.chart-title').textContent;
    
    // Update active button
    button.parentElement.querySelectorAll('.chart-action-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
    
    // Update chart data
    if (chartType.includes('Revenue')) {
        state.chartPeriods.revenue = period;
        const data = getRevenueData(period);
        state.revenueChart.data = data;
        state.revenueChart.update();
    } else if (chartType.includes('Signups')) {
        state.chartPeriods.signups = period;
        const data = getSignupsData(period);
        state.signupsChart.data = data;
        state.signupsChart.update();
    }
}

// Show add user modal
function showAddUserModal() {
    showModal('Add User', `
        <div class="form-group">
            <label class="form-label" for="new-user-name">Name</label>
            <input type="text" class="form-control" id="new-user-name">
        </div>
        <div class="form-group">
            <label class="form-label" for="new-user-email">Email</label>
            <input type="email" class="form-control" id="new-user-email">
        </div>
        <div class="form-group">
            <label class="form-label" for="new-user-plan">Plan</label>
            <select class="form-control" id="new-user-plan">
                <option value="Basic">Basic</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
            </select>
        </div>
    `, () => {
        const name = document.getElementById('new-user-name').value;
        const email = document.getElementById('new-user-email').value;
        const plan = document.getElementById('new-user-plan').value;
        
        if (name && email) {
            const newUser = {
                id: state.users.length + 1,
                name: name,
                email: email,
                status: 'Active',
                lastActivity: new Date().toISOString().split('T')[0],
                plan: plan
            };
            
            state.users.push(newUser);
            renderUsersTable('recent-users-table-body', state.users.slice(0, 3));
            renderUsersTable('users-table-body', state.users);
            
            showNotification('User added successfully!', 'success');
        } else {
            showNotification('Please fill in all fields', 'error');
        }
    });
}

// Show filter modal
function showFilterModal() {
    showModal('Filter Users', `
        <div class="form-group">
            <label class="form-label" for="filter-status">Status</label>
            <select class="form-control" id="filter-status">
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label" for="filter-plan">Plan</label>
            <select class="form-control" id="filter-plan">
                <option value="">All Plans</option>
                <option value="Basic">Basic</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
            </select>
        </div>
    `, () => {
        const status = document.getElementById('filter-status').value;
        const plan = document.getElementById('filter-plan').value;
        
        let filteredUsers = state.users;
        
        if (status) {
            filteredUsers = filteredUsers.filter(user => user.status === status);
        }
        
        if (plan) {
            filteredUsers = filteredUsers.filter(user => user.plan === plan);
        }
        
        if (state.activePage === 'dashboard') {
            renderUsersTable('recent-users-table-body', filteredUsers.slice(0, 3));
        } else {
            renderUsersTable('users-table-body', filteredUsers);
        }
        
        showNotification('Filter applied successfully!', 'success');
    });
}

// Export users
function exportUsers() {
    // In a real app, this would generate a CSV or Excel file
    showNotification('Users data exported successfully!', 'success');
}

// Show change plan modal
function showChangePlanModal() {
    const plans = [
        {
            name: 'Basic Plan',
            price: '$19/month',
            features: [
                'Up to 5 team members',
                '10GB storage',
                'Email support',
                'Basic analytics'
            ]
        },
        {
            name: 'Pro Plan',
            price: '$49/month',
            features: [
                'Up to 10 team members',
                '50GB storage',
                'Priority support',
                'Advanced analytics'
            ],
            active: true
        },
        {
            name: 'Enterprise Plan',
            price: '$99/month',
            features: [
                'Unlimited team members',
                '200GB storage',
                '24/7 phone support',
                'Custom analytics'
            ]
        }
    ];
    
    let planOptionsHTML = '';
    plans.forEach(plan => {
        const isActive = plan.name === state.currentPlan.name;
        planOptionsHTML += `
            <div class="plan-option ${isActive ? 'active' : ''}" data-plan="${plan.name}">
                <div class="plan-option-header">
                    <div class="plan-option-name">${plan.name}</div>
                    <div class="plan-option-price">${plan.price}</div>
                </div>
                <ul class="plan-option-features">
                    ${plan.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                </ul>
            </div>
        `;
    });
    
    showModal('Change Plan', `
        <p>Select a new plan for your account:</p>
        <div class="plan-options">
            ${planOptionsHTML}
        </div>
    `, () => {
        const selectedPlanOption = document.querySelector('.plan-option.active');
        if (selectedPlanOption) {
            const planName = selectedPlanOption.getAttribute('data-plan');
            const selectedPlan = plans.find(plan => plan.name === planName);
            
            if (selectedPlan) {
                state.currentPlan = selectedPlan;
                updateCurrentPlanDisplay();
                showNotification(`Plan changed to ${planName} successfully!`, 'success');
            }
        } else {
            showNotification('Please select a plan', 'error');
        }
    });
    
    // Add event listeners to plan options
    document.querySelectorAll('.plan-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.plan-option').forEach(opt => {
                opt.classList.remove('active');
            });
            option.classList.add('active');
        });
    });
}

// Update current plan display
function updateCurrentPlanDisplay() {
    const planCard = document.getElementById('current-plan-card');
    if (planCard) {
        planCard.querySelector('.plan-name').textContent = state.currentPlan.name;
        planCard.querySelector('.plan-price').innerHTML = `${state.currentPlan.price.split('/')[0]}<span style="font-size: 1rem;">/month</span>`;
        
        const featuresList = planCard.querySelector('.plan-features');
        featuresList.innerHTML = state.currentPlan.features
            .map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`)
            .join('');
    }
}

// Show cancel subscription modal
function showCancelSubscriptionModal() {
    showModal('Cancel Subscription', `
        <p>Are you sure you want to cancel your subscription? Your account will remain active until the end of your current billing period.</p>
        <div class="form-group">
            <label class="form-label" for="cancel-reason">Reason for cancellation (optional)</label>
            <textarea class="form-control" id="cancel-reason" rows="3"></textarea>
        </div>
    `, () => {
        showNotification('Subscription cancelled successfully!', 'success');
    });
}

// Show update payment modal
function showUpdatePaymentModal() {
    showModal('Update Payment Method', `
        <div class="form-group">
            <label class="form-label" for="card-number">Card Number</label>
            <input type="text" class="form-control" id="card-number" placeholder="1234 5678 9012 3456">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label" for="expiry-date">Expiry Date</label>
                <input type="text" class="form-control" id="expiry-date" placeholder="MM/YY">
            </div>
            <div class="form-group">
                <label class="form-label" for="cvc">CVC</label>
                <input type="text" class="form-control" id="cvc" placeholder="123">
            </div>
        </div>
    `, () => {
        showNotification('Payment method updated successfully!', 'success');
    });
}

// Show edit billing modal
function showEditBillingModal() {
    showModal('Edit Billing Information', `
        <div class="form-group">
            <label class="form-label" for="billing-company">Company Name</label>
            <input type="text" class="form-control" id="billing-company" value="Acme Inc.">
        </div>
        <div class="form-group">
            <label class="form-label" for="billing-email">Email Address</label>
            <input type="email" class="form-control" id="billing-email" value="billing@acmeinc.com">
        </div>
        <div class="form-group">
            <label class="form-label" for="billing-tax">Tax ID</label>
            <input type="text" class="form-control" id="billing-tax" value="US-123-456-789">
        </div>
    `, () => {
        showNotification('Billing information updated successfully!', 'success');
    });
}

// Save general settings
function saveGeneralSettings() {
    showNotification('General settings saved successfully!', 'success');
}

// Update password
function updatePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill in all password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    showNotification('Password updated successfully!', 'success');
    
    // Clear password fields
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
}

// Enable 2FA
function enable2FA() {
    showNotification('Two-factor authentication enabled successfully!', 'success');
}

// View user
function viewUser(userId) {
    const user = state.users.find(u => u.id == userId);
    showModal(`User: ${user.name}`, `
        <div class="form-group">
            <label class="form-label">Name</label>
            <div>${user.name}</div>
        </div>
        <div class="form-group">
            <label class="form-label">Email</label>
            <div>${user.email}</div>
        </div>
        <div class="form-group">
            <label class="form-label">Status</label>
            <div>${user.status}</div>
        </div>
        <div class="form-group">
            <label class="form-label">Plan</label>
            <div>${user.plan}</div>
        </div>
        <div class="form-group">
            <label class="form-label">Last Activity</label>
            <div>${user.lastActivity}</div>
        </div>
    `, null, true);
}

// Edit user
function editUser(userId) {
    const user = state.users.find(u => u.id == userId);
    showModal(`Edit User: ${user.name}`, `
        <div class="form-group">
            <label class="form-label" for="edit-user-name">Name</label>
            <input type="text" class="form-control" id="edit-user-name" value="${user.name}">
        </div>
        <div class="form-group">
            <label class="form-label" for="edit-user-email">Email</label>
            <input type="email" class="form-control" id="edit-user-email" value="${user.email}">
        </div>
        <div class="form-group">
            <label class="form-label" for="edit-user-status">Status</label>
            <select class="form-control" id="edit-user-status">
                <option value="Active" ${user.status === 'Active' ? 'selected' : ''}>Active</option>
                <option value="Inactive" ${user.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label" for="edit-user-plan">Plan</label>
            <select class="form-control" id="edit-user-plan">
                <option value="Basic" ${user.plan === 'Basic' ? 'selected' : ''}>Basic</option>
                <option value="Pro" ${user.plan === 'Pro' ? 'selected' : ''}>Pro</option>
                <option value="Enterprise" ${user.plan === 'Enterprise' ? 'selected' : ''}>Enterprise</option>
            </select>
        </div>
    `, () => {
        const name = document.getElementById('edit-user-name').value;
        const email = document.getElementById('edit-user-email').value;
        const status = document.getElementById('edit-user-status').value;
        const plan = document.getElementById('edit-user-plan').value;
        
        if (name && email) {
            user.name = name;
            user.email = email;
            user.status = status;
            user.plan = plan;
            
            renderUsersTable('recent-users-table-body', state.users.slice(0, 3));
            renderUsersTable('users-table-body', state.users);
            
            showNotification('User updated successfully!', 'success');
        } else {
            showNotification('Please fill in all fields', 'error');
        }
    });
}

// Delete user
function deleteUser(userId) {
    showModal('Delete User', `
        <p>Are you sure you want to delete this user? This action cannot be undone.</p>
    `, () => {
        state.users = state.users.filter(user => user.id != userId);
        renderUsersTable('recent-users-table-body', state.users.slice(0, 3));
        renderUsersTable('users-table-body', state.users);
        showNotification('User deleted successfully!', 'success');
    });
}

// Show modal
function showModal(title, content, onConfirm, readOnly = false) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('custom-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'custom-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title"></h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer">
                    <button class="btn" id="modal-cancel">Cancel</button>
                    <button class="btn btn-primary" id="modal-confirm">Confirm</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        modal.querySelector('#modal-cancel').addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
    
    // Set modal content
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('.modal-body').innerHTML = content;
    
    // Set up confirm button
    const confirmBtn = modal.querySelector('#modal-confirm');
    if (onConfirm) {
        confirmBtn.style.display = 'block';
        confirmBtn.onclick = () => {
            onConfirm();
            modal.classList.remove('active');
        };
    } else {
        confirmBtn.style.display = 'none';
    }
    
    // Hide cancel button for read-only modals
    if (readOnly) {
        modal.querySelector('#modal-cancel').style.display = 'none';
        confirmBtn.textContent = 'Close';
        confirmBtn.onclick = () => {
            modal.classList.remove('active');
        };
        confirmBtn.style.display = 'block';
    } else {
        modal.querySelector('#modal-cancel').style.display = 'block';
        confirmBtn.textContent = 'Confirm';
    }
    
    // Show modal
    modal.classList.add('active');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification container if it doesn't exist
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        margin-bottom: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        justify-content: space-between;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <span>${message}</span>
        <button style="background: none; border: none; color: white; cursor: pointer; margin-left: 10px;">&times;</button>
    `;
    
    container.appendChild(notification);
    
    // Add close button functionality
    notification.querySelector('button').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode === container) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode === container) {
                    container.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // Add CSS animations if not already added
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Handle initial mobile view
window.addEventListener('load', () => {
    handleResize();
});