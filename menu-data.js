const MenuData = (function() {
    let menuData = [];
    let categories = [];
    let flavorsByCategory = {};

    function initialize() {
        fetch('menulovis.csv')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load menu data: ${response.status}`);
                }
                return response.text();
            })
            .then(csvText => {
                console.log("CSV Text Loaded:", csvText); // Debugging

                const parsedData = Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    delimiter: ';', // Menggunakan delimiter semicolon
                });

                if (parsedData.errors && parsedData.errors.length > 0) {
                    console.error("CSV parsing errors:", parsedData.errors);
                    showStatus("Error parsing menu data. See console for details.", "error");
                    return;
                }

                // Clean the data and trim whitespace
                menuData = parsedData.data.map(item => {
                    const cleanedItem = {};
                    Object.keys(item).forEach(key => {
                        const cleanKey = key.trim();
                        cleanedItem[cleanKey] = typeof item[key] === 'string' ? item[key].trim() : item[key];
                    });
                    return cleanedItem;
                });

                console.log("Parsed Menu Data:", menuData); // Debugging

                // Filter empty items
                menuData = menuData.filter(item => item.Name && item.Category && item.Flavor);

                // Process menu data to extract categories and flavors
                processMenuData();

                console.log("Categories and Flavors:", categories, flavorsByCategory); // Debugging

                const event = new CustomEvent('menu-data-loaded', { 
                    detail: { 
                        categories: categories, 
                        flavorsByCategory: flavorsByCategory
                    } 
                });
                document.dispatchEvent(event);

                showStatus('Menu data loaded successfully!', 'success');
            })
            .catch(error => {
                console.error('Error loading menu data:', error);
                showStatus('Failed to load menu data. Please check console for details.', 'error');
            });
    }

    function processMenuData() {
        categories = [...new Set(menuData.map(item => item.Category.trim()))];
        categories.unshift("All Categories");

        flavorsByCategory = {};

        const allFlavors = [...new Set(menuData.map(item => item.Flavor.trim()))];
        flavorsByCategory["All Categories"] = allFlavors;

        categories.slice(1).forEach(category => {
            const itemsInCategory = menuData.filter(item => item.Category.trim() === category);
            const flavorsInCategory = [...new Set(itemsInCategory.map(item => item.Flavor.trim()))];
            flavorsByCategory[category] = flavorsInCategory;
        });
    }

    function filterMenuItems(category, flavor) {
        if (!category && !flavor) {
            return menuData;
        }

        if (category === "All Categories") {
            return menuData.filter(item => item.Flavor.trim() === flavor);
        }

        return menuData.filter(item => item.Category.trim() === category && item.Flavor.trim() === flavor);
    }

    function getCategories() {
        return categories;
    }

    function getFlavorsForCategory(category) {
        return flavorsByCategory[category] || [];
    }

    function showStatus(message, type) {
        const statusElement = document.getElementById('status-message');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status-message ${type}`;
            if (type === 'success') {
                setTimeout(() => {
                    statusElement.style.display = 'none';
                }, 5000);
            }
        }
    }

    document.addEventListener('DOMContentLoaded', initialize);

    return {
        filterMenuItems,
        getCategories,
        getFlavorsForCategory
    };
})();
