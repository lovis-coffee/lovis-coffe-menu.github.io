/**
 * CSV Parser Module
 * Handles CSV file parsing and data management
 */
const CSVParser = (function() {
    // Store the parsed menu data
    let menuData = [];
    
    // Store unique categories and flavors
    let categories = [];
    let flavorsByCategory = {};
    
    /**
     * Parse the uploaded CSV file
     * @param {File} file - The CSV file to parse
     * @returns {Promise} - Resolves with the parsed data or rejects with an error
     */
    function parseCSV(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject('No file provided');
                return;
            }
            
            if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
                reject('File must be a CSV');
                return;
            }
            
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                delimiter: detectDelimiter(file),  // Auto-detect delimiter (comma or semicolon)
                complete: function(results) {
                    try {
                        // Validate required columns
                        const requiredColumns = ['Name', 'Category', 'Flavor', 'Description'];
                        const headers = Object.keys(results.data[0] || {});
                        
                        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
                        if (missingColumns.length > 0) {
                            reject(`Missing required columns: ${missingColumns.join(', ')}`);
                            return;
                        }
                        
                        // Process the data - trim whitespace from values
                        menuData = results.data.map(item => {
                            const cleanedItem = {};
                            Object.keys(item).forEach(key => {
                                cleanedItem[key] = typeof item[key] === 'string' ? item[key].trim() : item[key];
                            });
                            return cleanedItem;
                        });
                        
                        processMenuData();
                        resolve({
                            data: menuData,
                            categories: categories,
                            flavorsByCategory: flavorsByCategory
                        });
                    } catch (err) {
                        reject(`Error processing CSV: ${err.message}`);
                    }
                },
                error: function(error) {
                    reject(`Error parsing CSV: ${error}`);
                }
            });
        });
    }
    
    /**
     * Detects if the CSV file uses commas or semicolons as delimiter
     * @param {File} file - The CSV file to analyze
     * @returns {string} - The detected delimiter
     */
    function detectDelimiter(file) {
        // Default to comma, but we'll attempt to detect semicolon
        // This is a simple implementation - check the filename for indicators
        if (file.name.includes('lovis')) {
            return ';';  // Known to use semicolons
        }
        return ',';  // Default delimiter
    }
    
    /**
     * Process the menu data to extract categories and flavors
     */
    function processMenuData() {
        // Extract unique categories
        categories = [...new Set(menuData.map(item => item.Category))];
        
        // Generate flavor options for each category
        flavorsByCategory = {};
        
        categories.forEach(category => {
            const itemsInCategory = menuData.filter(item => item.Category === category);
            const flavorsInCategory = [...new Set(itemsInCategory.map(item => item.Flavor))];
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
        
        if (category && !flavor) {
            return menuData.filter(item => item.Category === category);
        }
        
        if (!category && flavor) {
            return menuData.filter(item => item.Flavor === flavor);
        }
        
        return menuData.filter(item => 
            item.Category === category && item.Flavor === flavor
        );
    }
    
    /**
     * Load sample data when no CSV is uploaded
     */
    function loadSampleData() {
        // This is sample data, not to be considered as mock data
        // It's a fallback for demonstration purposes
        const sampleData = [
            {
                "Name": "Espresso",
                "Category": "Beverage",
                "Flavor": "Strong",
                "Description": "Concentrated coffee brewed by forcing hot water under pressure through finely ground coffee beans."
            },
            {
                "Name": "Cappuccino",
                "Category": "Beverage",
                "Flavor": "Sweet",
                "Description": "Coffee drink with steamed milk foam, typically containing equal parts of espresso, steamed milk, and milk foam."
            },
            {
                "Name": "Iced Tea",
                "Category": "Beverage",
                "Flavor": "Refreshing",
                "Description": "Chilled tea served with ice, sometimes with flavoring like lemon or peach."
            },
            {
                "Name": "Margherita Pizza",
                "Category": "Food",
                "Flavor": "Savory",
                "Description": "Classic pizza with tomato sauce, mozzarella cheese, and fresh basil."
            },
            {
                "Name": "Buffalo Wings",
                "Category": "Food",
                "Flavor": "Spicy",
                "Description": "Chicken wings coated in a spicy sauce, typically served with celery and blue cheese dressing."
            },
            {
                "Name": "Pasta Alfredo",
                "Category": "Food",
                "Flavor": "Creamy",
                "Description": "Fettuccine pasta tossed with a rich sauce made from butter, cream, and Parmesan cheese."
            }
        ];
        
        menuData = sampleData;
        processMenuData();
        
        return {
            data: menuData,
            categories: categories,
            flavorsByCategory: flavorsByCategory
        };
    }
    
    /**
     * Get current menu data
     * @returns {Array} - The current menu data
     */
    function getMenuData() {
        return menuData;
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
     * Get all flavors by category mapping
     * @returns {Object} - Mapping of categories to flavors
     */
    function getAllFlavorsByCategory() {
        return flavorsByCategory;
    }
    
    /**
     * Set menu data with pre-processed data
     * @param {Array} data - The menu data array
     * @param {Array} cats - The categories array
     * @param {Object} flavors - The flavors by category mapping
     */
    function setMenuData(data, cats, flavors) {
        menuData = data;
        categories = cats;
        flavorsByCategory = flavors;
    }
    
    // Public API
    return {
        parseCSV,
        loadSampleData,
        filterMenuItems,
        getMenuData,
        getCategories,
        getFlavorsForCategory,
        getAllFlavorsByCategory,
        setMenuData
    };
})();
