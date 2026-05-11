function loadCategoryDropdown() {
    fetch('api/get_categories.php')
    .then(response => response.json())
    .then(data => {
        const categorySelect = document.getElementById('filterCategory') || document.getElementById('category');
        
        if (!categorySelect) return;
        
        // Group categories by parent
        const mainCategories = data.filter(cat => cat.parent_id === null);
        
        mainCategories.forEach(mainCat => {
            // Add main category as optgroup
            const optgroup = document.createElement('optgroup');
            optgroup.label = mainCat.name;
            
            const subcategories = data.filter(cat => cat.parent_id === mainCat.id);
            
            if (subcategories.length > 0) {
                subcategories.forEach(subCat => {
                    const option = document.createElement('option');
                    option.value = subCat.id;
                    option.textContent = subCat.name;
                    optgroup.appendChild(option);
                });
                categorySelect.appendChild(optgroup);
            }
        });
    })
    .catch(error => console.error('Error loading categories:', error));
}

document.addEventListener('DOMContentLoaded', loadCategoryDropdown);