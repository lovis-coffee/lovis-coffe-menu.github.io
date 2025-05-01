/**
 * Menu Data Module
 * Handles data processing, storage, and filtering
 */
const MenuData = (function() {
    let menuData = [];
    let categories = [];
    let flavorsByCategory = {};
    
    function initialize() {
        fetch('menulovis.csv')
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load menu data: ${response.status}`);
                return response.text();
            })
            .then(csvText => {
                const parsedData = Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    delimiter: ';',
                });

                if (parsedData.errors?.length) {
                    console.error("CSV parsing errors:", parsedData.errors);
                    showStatus("Error parsing menu data. See console for details.", "error");
                    return;
                }

                menuData = parsedData.data.map(item => {
                    const cleanedItem = {};
                    Object.keys(item).forEach(key => {
                        const cleanKey = key.trim();
                        let value = item[key];
                        if (typeof value === 'string') value = value.trim();

                        if (cleanKey === 'Price') {
                            value = parseFloat(value); // Convert to number
                        }

                        cleanedItem[cleanKey] = value;
                    });
                    return cleanedItem;
                });

                // Filter to ensure essential fields exist
                menuData = menuData.filter(item =>
                    item.Name && item.Category && item.Flavor && item.Photo && !isNaN(item.Price)
                );

                processMenuData();

                const event = new CustomEvent('menu-data-loaded', {
                    detail: {
                        categories,
                        flavorsByCategory
                    }
                });
                document.dispatchEvent(event);
                showStatus('Menu data loaded successfully!', 'success');
                populateCategories();
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

    function populateCategories() {
        const categorySelect = document.getElementById('category');
        categorySelect.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
        categorySelect.disabled = false;

        categorySelect.addEventListener('change', function(event) {
            const selectedCategory = event.target.value;
            if (selectedCategory) {
                populateFlavors(selectedCategory);
            }
        });
    }

    function populateFlavors(category) {
        const flavorSelect = document.getElementById('flavor');
        flavorSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Choose a flavor';
        flavorSelect.appendChild(defaultOption);

        const flavors = getFlavorsForCategory(category);
        flavors.forEach(flavor => {
            const option = document.createElement('option');
            option.value = flavor;
            option.textContent = flavor;
            flavorSelect.appendChild(option);
        });
        flavorSelect.disabled = false;
    }

    function filterMenuItems(category, flavor) {
        if (!category && !flavor) return menuData;

        if (category === "All Categories") {
            return menuData.filter(item => item.Flavor.trim() === flavor);
        }

        return menuData.filter(item =>
            item.Category.trim() === category &&
            item.Flavor.trim() === flavor
        );
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
