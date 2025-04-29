/**
 * Menu Data Module
 * Handles data processing, storage, and filtering
 */
const MenuData = (function() {
    // Store the parsed menu data
    let menuData = [];
    
    // Store unique categories and flavors
    let categories = [];
    let flavorsByCategory = {};
    
    /**
     * Initialize with data from the CSV file
     */
    function initialize() {
        // Fetch the CSV file
        fetch('data/menulovis.csv')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load menu data: ${response.status}`);
                }
                return response.text();
            })
            .then(csvText => {
                // Parse the CSV text with PapaParse
                const parsedData = Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    delimiter: ';',  // Using semicolon as the delimiter
                });
                
                if (parsedData.errors && parsedData.errors.length > 0) {
                    console.error("CSV parsing errors:", parsedData.errors);
                    showStatus("Error parsing menu data. See console for details.", "error");
                    return;
                }
                
                // Clean the data by trimming whitespace
                menuData = parsedData.data.map(item => {
                    const cleanedItem = {};
                    Object.keys(item).forEach(key => {
                        const cleanKey = key.trim();
                        cleanedItem[cleanKey] = typeof item[key] === 'string' ? item[key].trim() : item[key];
                    });
                    return cleanedItem;
                });
                
                // Remove any empty entries
                menuData = menuData.filter(item => item.Name && item.Category && item.Flavor);
                
                // Process data to extract categories and flavors
                processMenuData();
                
                // Trigger load event
                const event = new CustomEvent('menu-data-loaded', { 
                    detail: { 
                        categories: categories,
                        flavorsByCategory: flavorsByCategory
                    } 
                });
                document.dispatchEvent(event);
                
                // Show success message
                showStatus('Menu data loaded successfully!', 'success');
            })
            .catch(error => {
                console.error('Error loading menu data:', error);
                showStatus('Failed to load menu data. Please check console for details.', 'error');
            });
    }
    
    /**
     * Process the menu data to extract categories and flavors
     */
    function processMenuData() {
        // Extract unique categories
        categories = [...new Set(menuData.map(item => item.Category.trim()))];
        
        // Add "All Categories" option
        categories.unshift("All Categories");
        
        // Generate flavor options for each category
        flavorsByCategory = {};
        
        // Get all unique flavors across all categories for the "All Categories" option
        const allFlavors = [...new Set(menuData.map(item => item.Flavor.trim()))];
        flavorsByCategory["All Categories"] = allFlavors;
        
        // Get flavors for each specific category
        categories.slice(1).forEach(category => {
            const itemsInCategory = menuData.filter(item => item.Category.trim() === category);
            const flavorsInCategory = [...new Set(itemsInCategory.map(item => item.Flavor.trim()))];
            flavorsByCategory[category] = flavorsInCategory;
        });
    }
    
    /**
     * Filter menu items based on category and flavor
     * @param {string} category - The selected category
     * @param {string} flavor - The selected flavor
     * @returns {Array} - Filtered menu items
     */
    function filterMenuItems(category, flavor) {
        if (!category && !flavor) {
            return menuData;
        }
        
        // If "All Categories" is selected, filter only by flavor
        if (category === "All Categories") {
            return menuData.filter(item => 
                item.Flavor.trim() === flavor
            );
        }
        
        // Filter by both category and flavor
        return menuData.filter(item => 
            item.Category.trim() === category && 
            item.Flavor.trim() === flavor
        );
    }
    
    /**
     * Get available categories
     * @returns {Array} - List of categories
     */
    function getCategories() {
        return categories;
    }
    
    /**
     * Get flavors for a specific category
     * @param {string} category - The category to get flavors for
     * @returns {Array} - List of flavors for the category
     */
    function getFlavorsForCategory(category) {
        return flavorsByCategory[category] || [];
    }
    
    /**
     * Show status message
     * @param {string} message - The message to display
     * @param {string} type - The type of message (success or error)
     */
    function showStatus(message, type) {
        const statusElement = document.getElementById('status-message');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status-message ${type}`;
            
            // Hide success messages after 5 seconds
            if (type === 'success') {
                setTimeout(() => {
                    statusElement.style.display = 'none';
                }, 5000);
            }
        }
    }
    
    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', initialize);
    
    // Public API
    return {
        filterMenuItems,
        getCategories,
        getFlavorsForCategory
    };
})();
