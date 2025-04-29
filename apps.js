/**
 * Menu Recommendation App
 * Main application logic
 */
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const categorySelect = document.getElementById('category');
    const flavorSelect = document.getElementById('flavor');
    const preferencesForm = document.getElementById('preferences-form');
    const resultsContainer = document.getElementById('results-container');
    const resultsList = document.getElementById('results-list');
    const statusMessage = document.getElementById('status-message');
    
    // Flag to track if data is loaded
    let dataLoaded = false;
    
    /**
     * Listen for menu data loaded event
     */
    document.addEventListener('menu-data-loaded', function(e) {
        const { categories, flavorsByCategory } = e.detail;
        
        // Populate the category dropdown
        populateCategoryDropdown(categories);
        dataLoaded = true;
    });
    
    /**
     * Event listener for category selection
     */
    categorySelect.addEventListener('change', function() {
        const selectedCategory = this.value;
        
        if (selectedCategory) {
            // Get flavors for the selected category
            const flavors = MenuData.getFlavorsForCategory(selectedCategory);
            
            // Update flavor dropdown
            populateFlavorDropdown(flavors);
            flavorSelect.disabled = false;
        } else {
            // Reset flavor dropdown if no category is selected
            resetFlavorDropdown();
        }
    });
    
    /**
     * Event listener for form submission
     */
    preferencesForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const selectedCategory = categorySelect.value;
        const selectedFlavor = flavorSelect.value;
        
        if (!dataLoaded) {
            showStatus('Please wait for menu data to load.', 'error');
            return;
        }
        
        if (!selectedCategory) {
            showStatus('Please select a category.', 'error');
            return;
        }
        
        if (!selectedFlavor) {
            showStatus('Please select a flavor.', 'error');
            return;
        }
        
        // Filter menu items based on selections
        const filteredItems = MenuData.filterMenuItems(selectedCategory, selectedFlavor);
        
        // Display the results
        displayResults(filteredItems);
    });
    
    /**
     * Populate the category dropdown with options
     * @param {Array} categories - List of available categories
     */
    function populateCategoryDropdown(categories) {
        // Clear existing options except the first one
        while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
        }
        
        // Add new options
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
    
    /**
     * Populate the flavor dropdown with options
     * @param {Array} flavors - List of flavors for the selected category
     */
    function populateFlavorDropdown(flavors) {
        // Clear existing options except the first one
        while (flavorSelect.options.length > 1) {
            flavorSelect.remove(1);
        }
        
        // Add new options
        flavors.forEach(flavor => {
            const option = document.createElement('option');
            option.value = flavor;
            option.textContent = flavor;
            flavorSelect.appendChild(option);
        });
    }
    
    /**
     * Reset the flavor dropdown
     */
    function resetFlavorDropdown() {
        // Clear existing options except the first one
        while (flavorSelect.options.length > 1) {
            flavorSelect.remove(1);
        }
        
        flavorSelect.disabled = true;
        flavorSelect.selectedIndex = 0;
    }
    
    /**
     * Reset the form and results
     */
    function resetForm() {
        categorySelect.selectedIndex = 0;
        resetFlavorDropdown();
        
        // Reset results
        resultsList.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-utensils empty-icon"></i>
                <p>Select a category and flavor to see recommendations</p>
            </div>
        `;
    }
    
    /**
     * Display filtered menu items
     * @param {Array} items - List of filtered menu items
     */
    function displayResults(items) {
        // Clear previous results
        resultsList.innerHTML = '';
        
        if (items.length === 0) {
            // Show no results message
            resultsList.innerHTML = `
                <div class="no-results">
                    <i class="fa-solid fa-search"></i>
                    <p>No menu items found matching your criteria.</p>
                </div>
            `;
            return;
        }
        
        // Create elements for each item
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'menu-item';
            
            itemElement.innerHTML = `
                <h3>${item.Name}</h3>
                <div class="category-flavor">
                    <span class="category">${item.Category}</span>
                    <span class="flavor">${item.Flavor}</span>
                </div>
                <p>${item.Description}</p>
            `;
            
            resultsList.appendChild(itemElement);
        });
    }
    
    /**
     * Show status message
     * @param {string} message - The message to display
     * @param {string} type - The type of message (success or error)
     */
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        
        // Hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                statusMessage.className = 'status-message';
            }, 5000);
        }
    }
});
