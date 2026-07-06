document.addEventListener("DOMContentLoaded", () => {
    loadAdminData();
    initializeAdminTabs();
    setupAddProductForm();
});

function initializeAdminTabs() {
    document.querySelectorAll(".admin-tab").forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll(".admin-tab, .admin-section").forEach(el => el.classList.remove("active"));
            tab.classList.add("active");
            document.getElementById(tab.dataset.tab + "Section").classList.add("active");
        };
    });
}

async function loadAdminData() {
    await loadUsers();
    await loadProducts();
    await loadOrders();
}

async function loadUsers() {
    const res = await fetch("admin-api.php?action=users");
    const data = await res.json();
    const tbody = document.querySelector("#usersTable tbody");
    if (data.users) {
        tbody.innerHTML = data.users.map(u => `<tr><td>${u.id}</td><td>${u.first_name} ${u.last_name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.created_at}</td></tr>`).join("");
    }
}

async function loadProducts() {
    const res = await fetch("get-products.php");
    const data = await res.json();
    const tbody = document.querySelector("#productsTable tbody");
    if (data.products) {
        tbody.innerHTML = data.products.map(p => `
            <tr>
                <td>${p.id}</td>
                <td><img src="${p.image || 'PHOTOS/6.jpg'}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;"></td>
                <td><b>${p.name}</b></td>
                <td>${p.category}</td>
                <td>Rs. ${p.price}</td>
                <td>${p.stock}</td>
                <td><span class="spice-tag">${p.spice_level}</span></td>
                <td><button class="btn-delete" onclick="deleteProduct(${p.id})">Delete</button></td>
            </tr>
        `).join("");
    }
}

async function loadOrders() {
    const res = await fetch("admin-api.php?action=orders");
    const data = await res.json();
    const tbody = document.querySelector("#ordersTable tbody");
    if (data.orders) {
        tbody.innerHTML = data.orders.map(o => `
            <tr>
                <td>${o.id}</td>
                <td>${o.user_name || 'User ' + o.user_id}</td>
                <td>Rs. ${o.total}</td>
                <td>${o.created_at}</td>
                <td><button onclick='showOrderModal(${JSON.stringify(o).replace(/'/g, "&#39;")})'>View</button></td>
            </tr>
        `).join("");
    }
}

function setupAddProductForm() {
    const form = document.getElementById('addProductForm');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target); // Correct for file uploads

        const res = await fetch('manage-products-api.php?action=add', {
            method: 'POST',
            body: formData // Do not set headers, browser does it automatically for FormData
        });

        const result = await res.json();
        if (result.success) {
            alert("Product saved!");
            closeProductModal();
            loadProducts();
            e.target.reset();
        } else {
            alert("Error: " + result.message);
        }
    };
}

// Global functions for HTML
window.showAddProductModal = () => document.getElementById('productModalBg').classList.add('active');
window.closeProductModal = () => document.getElementById('productModalBg').classList.remove('active');
window.deleteProduct = async (id) => {
    if (!confirm("Delete product?")) return;
    const res = await fetch(`manage-products-api.php?action=delete&id=${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) loadProducts();
};

window.showOrderModal = (order) => {
    const modalContent = document.getElementById('orderModalContent');
    let html = `<div class='modal-title'>Order #${order.id}</div>`;
    html += `<div><b>User:</b> ${order.user_name || order.user_id}</div>`;
    html += `<div><b>Date:</b> ${order.created_at}</div>`;
    html += `<div><b>Address:</b> ${order.location || 'N/A'}</div>`;
    html += `<div><b>Phone:</b> ${order.phone || 'N/A'}</div>`;
    html += `<div><b>Total:</b> Rs. ${order.total}</div>`;

    if (order.items) {
        html += `<table style='width:100%; margin-top:15px;'><thead><tr><th>Product</th><th>Qty</th><th>Subtotal</th></tr></thead><tbody>`;
        const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items);
        items.forEach(item => {
            const name = item.product_name || item.name || "Unknown";
            html += `<tr><td>${name}</td><td>${item.quantity}</td><td>Rs. ${item.price * item.quantity}</td></tr>`;
        });
        html += `</tbody></table>`;
    }
    modalContent.innerHTML = html;
    document.getElementById('orderModalBg').classList.add('active');
};
window.closeOrderModal = () => document.getElementById('orderModalBg').classList.remove('active');