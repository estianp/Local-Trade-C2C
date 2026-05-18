let allItems = [];

function loadItems() {
    const container = document.getElementById('itemsContainer');
    
    fetch('api/get_items.php')
    .then(response => response.json())
    .then(data => {
        allItems = data.items || [];
        displayItems(allItems);
    })
    .catch(error => {
        console.error('Error loading items:', error);
        container.innerHTML = '<p style="color: red; grid-column: 1 / -1;">Error loading items</p>';
    });
}

function displayItems(items) {
    const container = document.getElementById('itemsContainer');
    container.innerHTML = '';
    
    if (!items || items.length === 0) {
        container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #666;">No items available</p>';
        return;
    }
    
    items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'item-card';
        
        const imageHtml = item.image_url 
            ? `<img src="${item.image_url}" alt="${item.title}" class="item-image">`
            : `<div class="item-image" style="background-color: #ddd; display: flex; align-items: center; justify-content: center; color: #999;">No Image</div>`;
        
        const soldStamp = item.is_sold ? '<div class="sold-stamp">SOLD</div>' : '';
        
        itemEl.innerHTML = `
            <div class="item-image-wrapper">
                ${imageHtml}
                ${soldStamp}
            </div>
            <h3>${item.title}</h3>
            <p class="item-description">${item.description}</p>
            <p class="item-seller">Seller: ${item.username}</p>
            <p class="item-price">R${parseFloat(item.price).toFixed(2)}</p>
            <a href="item.html?id=${item.id}" class="btn btn-register" style="width: 100%; text-align: center; display: block;">View Details</a>
        `;
        container.appendChild(itemEl);
        
        const img = itemEl.querySelector('img');
        if (img) {
            img.loading = 'lazy';
        }
    });
}

function filterAndSort() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const selectedCategory = document.getElementById('filterCategory').value;
    const sortType = document.getElementById('sortBy').value;
    
    let filtered = allItems;
    
    if (selectedCategory) {
        filtered = filtered.filter(item => String(item.category_id) === String(selectedCategory));
    }
    
    if (searchQuery) {
        filtered = filtered.filter(item => item.title.toLowerCase().includes(searchQuery));
    }
    
    let sorted = [...filtered];
    
    switch(sortType) {
        case 'recent':
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'price-low':
            sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
        case 'price-high':
            sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
        default:
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    displayItems(sorted);
}

document.addEventListener('DOMContentLoaded', function() {
    loadItems();
    loadCategoryDropdown();
    document.getElementById('filterCategory').addEventListener('change', filterAndSort);
    document.getElementById('sortBy').addEventListener('change', filterAndSort);
    document.getElementById('searchInput').addEventListener('input', filterAndSort);
});