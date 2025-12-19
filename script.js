// --- 1. CENTRALIZED FLAVOUR DATA ---
const flavourData = {
    'Ice-Cream': [
        { name: 'Vanilla', price: 150 },
        { name: '21 Love', price: 180 },
        { name: 'Strawberry', price: 160 },
        { name: 'Chocolate', price: 170 },
    ],
    'Kulfi': [
        { name: 'Vanilla Kulfi', price: 200 },
        { name: 'Pista Kulfi', price: 220 },
        { name: 'Chocolate Kulfi', price: 210 },
        { name: 'Strawberry Kulfi', price: 200 },
        { name: 'Blueberry Kulfi', price: 220 },
        { name: 'Mango Kulfi', price: 210 },
        { name: 'Orange Kulfi', price: 200 },
    ]
};

// --- 2. HELPER FUNCTIONS ---

//Login/Logout Functions


function getFlavourSelectHTML() {
    let selectHTML = `<select name="flavour[]" class="flavourSelect" required>
                        <option value="" disabled selected>Select a Flavour</option>`;
    for (const category in flavourData) {
        selectHTML += `<optgroup label="${category}">`;
        flavourData[category].forEach(item => {
            selectHTML += `<option value="${item.name}" data-price="${item.price}">${item.name} - रु${item.price}</option>`;
        });
        selectHTML += `</optgroup>`;
    }
    selectHTML += `</select>`;
    return selectHTML;
}

function renderHomeFlavours() {
    const flavoursDiv = document.querySelector('.flavours');
    if (!flavoursDiv) return;
    flavoursDiv.innerHTML = ''; 
    for (const category in flavourData) {
        const categoryDiv = document.createElement('div');
        let flavourList = flavourData[category].map(item => item.name).join(', ');
        categoryDiv.innerHTML = `<strong>${category}:</strong> ${flavourList}`;
        flavoursDiv.appendChild(categoryDiv);
    }
}

// --- 3. CORE NAVIGATION & UI LOGIC ---

const previewModal = document.getElementById('previewModal');

function showSection(sectionId) {
    const sectionIds = ["homeSection", "orderSection", "contactSection"];
    sectionIds.forEach(id => {
        const sec = document.getElementById(id);
        if (id === sectionId) {
            sec.classList.add("active");
            sec.classList.remove("hidden");
        } else {
            sec.classList.remove("active");
            sec.classList.add("hidden");
        }
    });
    // Close mobile menu
    document.getElementById('navMenu').classList.remove('active');
    document.getElementById('hamburger').classList.remove('active');
    window.scrollTo(0, 0);
}

function openModal() {
    previewModal.classList.remove('hidden');
    setTimeout(() => previewModal.classList.add('show'), 10);
}

function closeModal() {
    previewModal.classList.remove('show');
    setTimeout(() => previewModal.classList.add('hidden'), 300);
}

function calculateTotal() {
    const rows = document.querySelectorAll('.flavourRow');
    let total = 0;
    rows.forEach(row => {
        const select = row.querySelector('.flavourSelect');
        const qtyInput = row.querySelector('input[type="number"]');
        if (select && qtyInput && select.value !== "") { 
            const price = parseFloat(select.selectedOptions[0].dataset.price) || 0;
            total += price * (parseInt(qtyInput.value) || 0);
        }
    });
    document.getElementById('totalAmount').textContent = "Total: रु" + total.toFixed(2);
}

function updateRemoveButtons() {
    const allRows = document.querySelectorAll('.flavourRow');
    document.querySelectorAll('.removeFlavour').forEach(btn => {
        btn.style.display = allRows.length > 1 ? 'inline-block' : 'none';
    });
}

// --- 4. EVENT LISTENERS (Wait for Load) ---

document.addEventListener('DOMContentLoaded', () => {
    // Nav Buttons
    document.getElementById("homeBtn").onclick = () => showSection("homeSection");
    document.getElementById("orderBtn").onclick = () => showSection("orderSection");
    document.getElementById("contactBtn").onclick = () => showSection("contactSection");

    // Hamburger
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    hamburger.onclick = () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    };

    // Theme Toggle
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = themeToggleBtn.querySelector('.icon');
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.textContent = '🌙';
    }
    themeToggleBtn.onclick = () => {
        const isDark = document.body.classList.toggle('dark-mode');
        themeIcon.textContent = isDark ? '🌙' : '☀️';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };

    // Header Shrink
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        window.scrollY > 50 ? header.classList.add('shrink') : header.classList.remove('shrink');
    });

    // Initial Setup
    renderHomeFlavours();
    const firstRowLabel = document.querySelector('.flavourRow label');
    if (firstRowLabel) firstRowLabel.innerHTML = `Select Flavour: ${getFlavourSelectHTML()}`;
    updateRemoveButtons();
    calculateTotal();
});

// --- 5. ORDER FORM FUNCTIONALITIES ---

document.getElementById("addFlavour").onclick = () => {
    const container = document.getElementById("flavourContainer");
    const row = document.createElement("div");
    row.classList.add("flavourRow");
    row.innerHTML = `
        <label>Flavor: ${getFlavourSelectHTML()}</label>
        <label>Quantity: <input type="number" name="quantity[]" min="1" value="1" required></label>
        <button type="button" class="removeFlavour">Remove</button>`;
    container.appendChild(row);
    updateRemoveButtons();
    calculateTotal();
};

document.getElementById("flavourContainer").onclick = (e) => {
    if (e.target.classList.contains("removeFlavour")) {
        e.target.closest(".flavourRow").remove();
        updateRemoveButtons();
        calculateTotal();
    }
};

document.getElementById("flavourContainer").oninput = calculateTotal;

document.getElementById('submitOrderBtn').onclick = (e) => {
    e.preventDefault();
    const form = document.getElementById('orderForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const list = document.getElementById('previewList');
    list.innerHTML = "";
    let total = 0;

    document.querySelectorAll('.flavourRow').forEach(row => {
        const select = row.querySelector('.flavourSelect');
        const qty = row.querySelector('input[type="number"]').value;
        const price = parseFloat(select.selectedOptions[0].dataset.price) || 0;
        const sub = price * qty;
        total += sub;
        const p = document.createElement('p');
        p.textContent = `${select.value} x ${qty} = रु${sub.toFixed(2)}`;
        list.appendChild(p);
    });

    document.getElementById('previewTotal').textContent = "Total: रु" + total.toFixed(2);
    openModal();
};

document.getElementById('closePreviewBtn').onclick = closeModal;
document.getElementById('placeOrderBtn').onclick = async () => {
    // 1. Get the Total
    const totalText = document.getElementById('previewTotal').textContent;
    const totalAmount = parseFloat(totalText.replace(/[^\d.]/g, ''));
    
    // 2. Collect all items from the order rows
    const items = [];
    document.querySelectorAll('.flavourRow').forEach(row => {
        const select = row.querySelector('.flavourSelect');
        const qtyInput = row.querySelector('input[type="number"]');
        
        if (select && select.value) {
            items.push({
                itemName: select.value,
                quantity: parseInt(qtyInput.value),
                price: parseFloat(select.selectedOptions[0].dataset.price)
            });
        }
    });

    // 3. Create the Order Object (Matches your Java Model)
         const orderData = {
    businessId: localStorage.getItem('businessId'), // Get the ID of the logged-in shop
    totalAmount: totalAmount,
    status: "Pending",
    items: items 
};

    // 4. Send the data to your Java Backend
    try {
        const response = await fetch('http://localhost:8080/api/orders/place', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const result = await response.json();
            alert(`Order Placed! Order ID: ${result.id}`);
            location.reload(); // Refresh the page to clear the form
        } else {
            alert("Backend reached, but could not save order.");
        }
    } catch (error) {
        console.error("Connection Error:", error);
        alert("Cannot reach Java server. Is it still running in VS Code?");
    }
};