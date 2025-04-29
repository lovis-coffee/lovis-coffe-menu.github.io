const MenuData = (function() {
    let menuItems = [];
    let categories = [];
    let flavorsByCategory = {};

    function loadMenuData() {
        Papa.parse("menu-data.csv", {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                menuItems = results.data;
                categories = getCategories(menuItems);
                flavorsByCategory = getFlavorsByCategory(menuItems);
                document.dispatchEvent(new CustomEvent('menu-data-loaded', {
                    detail: {
                        categories: categories,
                        flavorsByCategory: flavorsByCategory
                    }
                }));
            },
            error: function(error) {
                console.error("Error parsing CSV:", error);
            }
        });
    }

    function getCategories(menuItems) {
        const categories = new Set();
        menuItems.forEach(item => categories.add(item.Category));
        return Array.from(categories);
    }

    function getFlavorsByCategory(menuItems) {
        const flavorsByCategory = {};
        menuItems.forEach(item => {
            if (!flavorsByCategory[item.Category]) {
                flavorsByCategory[item.Category] = [];
            }
            if (!flavorsByCategory[item.Category].includes(item.Flavor)) {
                flavorsByCategory[item.Category].push(item.Flavor);
            }
        });
        return flavorsByCategory;
    }

    function filterMenuItems(category, flavor) {
        return menuItems.filter(item => item.Category === category && item.Flavor === flavor);
    }

    return {
        loadMenuData,
        getFlavorsForCategory: function(category) {
            return flavorsByCategory[category] || [];
        },
        filterMenuItems
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    MenuData.loadMenuData();
});
