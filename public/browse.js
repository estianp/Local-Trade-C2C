console.log('browse.js loaded immediately');

function loadItems() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const container = document.getElementById('itemsContainer');
    
    if (!loadingIndicator) {
        console.error('Loading indicator not found');
        return;
    }
    
    console.log('Showing loader');
    loadingIndicator.style.display = 'block';
    
    fetch('api/get_items.php')
    .then(response => response.json())
    .then(data => {
        console.log('Items fetched:', data.length);
        loadingIndicator.style.display = 'none';
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
        loadingIndicator.style.display = 'none';
    });
}

console.log('About to add DOMContentLoaded listener');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
    checkSession();
    loadItems();
});