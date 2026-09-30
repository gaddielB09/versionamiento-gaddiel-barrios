let db;
const request = indexedDB.open('exampleProductDB', 1);

request.onerror = function(event) {
    console.error("Database error: ", event.target.error);
};

request.onsuccess = function(event) {
    db = event.target.result;
    loadProductTable();
};

request.onupgradeneeded = function(event) {
    db = event.target.result;
    db.createObjectStore('products', { keyPath: 'id' });
};

function loadProductTable() {
    const transaction = db.transaction(['products'], 'readonly');
    const store = transaction.objectStore('products');

    const request = store.getAll();

    request.onsuccess = function(event) {
        const products = event.target.result;
        const tableBody = document.querySelector('#productsTable tbody');
        tableBody.innerHTML = '';

        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>$${product.price}</td>
                <td><button class="delete-btn" data-id="${product.id}">Eliminar</button></td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', deleteProduct);
        });

        updateSummary(products);
    };
}

function updateSummary(products) {
    const total = products.reduce((sum, product) => sum + product.price, 0);
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalValue').textContent = `$${total.toFixed(2)}`;
}

function addProduct() {
    const name = document.getElementById('name').value.trim();
    const price = parseFloat(document.getElementById('price').value);

    if (!name || isNaN(price) || price <= 0) {
        alert("Ingresa un nombre y un precio válidos.");
        return;
    }

    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');

    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = function(event) {
        const products = event.target.result;
        const newProduct = {
            id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
            name: name,
            price: price
        };

        store.add(newProduct);
        document.getElementById('name').value = '';
        document.getElementById('price').value = '';

        loadProductTable();
    };
}

function deleteProduct(event) {
    const productId = parseInt(event.target.getAttribute('data-id'));
    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');

    store.delete(productId);

    loadProductTable();
}

document.getElementById('addProduct').addEventListener('click', addProduct);
