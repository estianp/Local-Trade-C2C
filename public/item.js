function loadItem() {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');
    
    if (!itemId) {
        document.querySelector('.item-detail-section').innerHTML = '<p style="text-align: center; color: red;">No item ID provided</p>';
        return;
    }
    
    fetch(`api/get_item.php?id=${itemId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const item = data.item;
            
            document.getElementById('itemCategory').textContent = item.category;
            document.getElementById('itemTitle').textContent = item.title;
            document.getElementById('itemSeller').textContent = `Seller: ${item.username}`;
            document.getElementById('itemDescription').textContent = item.description;
            document.getElementById('itemPrice').textContent = `R${parseFloat(item.price).toFixed(2)}`;
            
            const date = new Date(item.created_at).toLocaleDateString();
            document.getElementById('itemDate').textContent = `Listed: ${date}`;
            
            if (item.image) {
                document.getElementById('itemImage').src = item.image;
            } else {
                document.getElementById('itemImage').style.backgroundColor = '#ddd';
                document.getElementById('itemImage').style.height = '400px';
                document.getElementById('itemImage').textContent = 'No Image';
            }
        } else {
            document.querySelector('.item-detail-section').innerHTML = `<p style="text-align: center; color: red;">${data.message}</p>`;
        }
    })
    .catch(error => {
        console.error('Error loading item:', error);
        document.querySelector('.item-detail-section').innerHTML = '<p style="text-align: center; color: red;">Error loading item</p>';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    loadItem();
});