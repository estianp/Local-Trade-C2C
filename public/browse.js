function createSkeletonCard() {
    const card = document.createElement('div');
    card.className = 'item-card skeleton';
    card.innerHTML = `
        <div class="skeleton-image"></div>
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
        <div class="skeleton-price"></div>
        <div class="skeleton-button"></div>
    `;
    return card;
}

function loadItems() {
    const container = document.getElementById('itemsContainer');
    
    console.log('Showing skeleton cards');
    container.innerHTML = '';
    
    // Show 6 skeleton cards while loading
    for (let i = 0; i < 6; i++) {
        container.appendChild(createSkeletonCard());
    }
    
    console.log('Fetching items...');
    
    fetch('api/get_items.php')
    .then(response => response.json())
    .then(data => {
        console.log('Items received, replacing skeletons');
        container.innerHTML = '';
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #666;">No items available</p>';
            return;
        }
        
        data.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'item-card';
            
            const imageHtml = item.image 
                ? `<img src="${item.image}" alt="${item.title}" class="item-image">`
                : `<div class="item-image" style="background-color: #ddd; display: flex; align-items: center; justify-content: center; color: #999;">No Image</div>`;
            
            itemEl.innerHTML = `
                ${imageHtml}
                <h3>${item.title}</h3>
                <p class="item-description">${item.description}</p>
                <p class="item-seller">Seller: ${item.username}</p>
                <p class="item-price">R${parseFloat(item.price).toFixed(2)}</p>
                <button class="btn btn-register" style="width: 100%;">View Details</button>
            `;
            container.appendChild(itemEl);
        });
    })
    .catch(error => {
        console.error('Error loading items:', error);
        container.innerHTML = '<p style="color: red; grid-column: 1 / -1;">Error loading items</p>';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    loadItems();
});