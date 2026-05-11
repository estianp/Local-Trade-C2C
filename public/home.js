let currentIndex = 0;
let items = [];
let autoPlayInterval;

function loadFeaturedCategory() {
    fetch('api/get_category_items.php')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.items.length > 0) {
            items = data.items;
            document.getElementById('categoryTitle').textContent = `Featured: ${data.category_name}`;
            displayCarousel();
            startAutoPlay();
        }
    })
    .catch(error => console.error('Error loading featured category:', error));
}

function displayCarousel() {
    const container = document.getElementById('carouselItems');
    container.innerHTML = '';

    items.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = `carousel-item ${index === 0 ? 'active' : ''}`;

        const imageHtml = item.image 
            ? `<img src="${item.image}" alt="${item.title}" class="carousel-image">`
            : `<div class="carousel-image" style="background-color: #ddd; display: flex; align-items: center; justify-content: center; color: #999;">No Image</div>`;

        itemEl.innerHTML = `
            ${imageHtml}
            <div class="carousel-item-info">
                <h3>${item.title}</h3>
                <p class="carousel-description">${item.description.substring(0, 80)}...</p>
                <p class="carousel-seller">Seller: ${item.username}</p>
                <p class="carousel-price">R${parseFloat(item.price).toFixed(2)}</p>
                <a href="item.html?id=${item.id}" class="btn btn-register">View Details</a>
            </div>
        `;
        container.appendChild(itemEl);
    });

    createDots();
}

function createDots() {
    const dotsContainer = document.getElementById('dotsContainer');
    dotsContainer.innerHTML = '';

    items.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = `dot ${index === currentIndex ? 'active' : ''}`;
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
            resetAutoPlay();
        });
        dotsContainer.appendChild(dot);
    });
}

function updateCarousel() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    const dots = document.querySelectorAll('.dot');

    carouselItems.forEach((item, index) => {
        item.classList.remove('active');
        if (index === currentIndex) {
            item.classList.add('active');
        }
    });

    dots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (index === currentIndex) {
            dot.classList.add('active');
        }
    });
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % items.length;
    updateCarousel();
    resetAutoPlay();
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    updateCarousel();
    resetAutoPlay();
}

function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}

function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
}

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    loadFeaturedCategory();

    document.getElementById('nextBtn').addEventListener('click', nextSlide);
    document.getElementById('prevBtn').addEventListener('click', prevSlide);
});