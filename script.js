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

// --- 2. DYNAMICALLY GENERATE FLAVOUR SELECT OPTIONS ---
function getFlavourSelectHTML() {
    let selectHTML = `
        <select name="flavour[]" class="flavourSelect" required>
            <option value="" disabled selected>Select a Flavour</option>
    `;

    for (const category in flavourData) {
        selectHTML += `<optgroup label="${category}">`;
        flavourData[category].forEach(item => {
            // Use item.name for the value and item.price for the data-price attribute
            selectHTML += `
                <option value="${item.name}" data-price="${item.price}">${item.name} - रु${item.price}</option>
            `;
        });
        selectHTML += `</optgroup>`;
    }
    selectHTML += `</select>`;
    return selectHTML;
}

// --- 3. DYNAMICALLY RENDER FLAVOURS IN HOME SECTION (Bonus) ---
function renderHomeFlavours() {
    const flavoursDiv = document.querySelector('.flavours');
    flavoursDiv.innerHTML = ''; // Clear existing content

    for (const category in flavourData) {
        const categoryDiv = document.createElement('div');
        const categoryLabel = category.replace(/-/g, ' ');
        let flavourList = flavourData[category].map(item => item.name).join(', ');
        
        categoryDiv.innerHTML = `
            <strong>${category}:</strong> ${flavourList}
        `;
        flavoursDiv.appendChild(categoryDiv);
    }
}

// --- 4. Initialization and Existing Functions

// Section toggling
const homeSection = document.getElementById("homeSection");
const orderSection = document.getElementById("orderSection");
const contactSection = document.getElementById("contactSection");
const previewModal = document.getElementById('previewModal');
const closePreviewBtn = document.getElementById('closePreviewBtn');
const placeOrderBtn = document.getElementById('placeOrderBtn');

function openModal() {
   previewModal.classList.remove('hidden');
  setTimeout(() => {
        previewModal.classList.add('show');
    }, 10);
}

function closeModal() {
  previewModal.classList.remove('show');
  setTimeout(() => {
            previewModal.classList.add('hidden'); 
    }, 300);
}

document.getElementById("homeBtn").onclick = () => {
  homeSection.classList.add("active");
  orderSection.classList.remove("active");
  contactSection.classList.remove("active");
};

document.getElementById("orderBtn").onclick = () => {
  homeSection.classList.remove("active");
  orderSection.classList.add("active");
  contactSection.classList.remove("active");
};

document.getElementById("contactBtn").onclick = () => {
  homeSection.classList.remove("active");
  orderSection.classList.remove("active");
  contactSection.classList.add("active");
};

document.addEventListener('DOMContentLoaded', function () {
  window.addEventListener('scroll', function () {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
      header.classList.add('shrink');
    } else {
      header.classList.remove('shrink');
    }
  });

    const initialFlavourLabel = document.querySelector('.flavourRow label');
    initialFlavourLabel.innerHTML = `
        Select Flavour:
        ${getFlavourSelectHTML()}
    `;
    
    renderHomeFlavours(); 

    // Close on '×' button
      closePreviewBtn.onclick = closeModal;

    // Close when clicking outside the modal content
    previewModal.onclick = (e) => {
     if (e.target === previewModal) {
      closeModal();
      }
    };

    placeOrderBtn.onclick = () => {
        const form = document.getElementById('orderForm');
        const previewTotalText = document.getElementById('previewTotal').textContent || 'Total: रु0';
        
        alert(`Order placed! ${previewTotalText}. We’ll contact you soon.`);
        previewModal.classList.remove('show');
        previewModal.classList.add('hidden');
        form.reset();
        
        // Reset flavour rows
        const flavourContainer = document.getElementById('flavourContainer');
        flavourContainer.innerHTML = `
            <div class="flavourRow">
                <label>Select Flavour: ${getFlavourSelectHTML()}</label>
                <label>Quantity:
                    <input type="number" name="quantity[]" min="1" value="1" required>
                </label>
                <button type="button" class="removeFlavour" style="display:none;">Remove</button>
            </div>
        `;
        updateRemoveButtons();
        calculateTotal();

        const message = document.getElementById('orderMessage');
        message.classList.remove('hidden');
        setTimeout(() => message.classList.add('hidden'), 5000);
    };
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = themeToggleBtn.querySelector('.icon');

    // 1. Check for stored theme preference or use system preference
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.textContent = '🌙';
    } else if (currentTheme === 'light') {
        document.body.classList.remove('dark-mode');
        themeIcon.textContent = '☀️';
    }

    // 2. Handle the click event
    themeToggleBtn.onclick = () => {
        const isDarkMode = document.body.classList.toggle('dark-mode');

        if (isDarkMode) {
            themeIcon.textContent = '🌙';
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.textContent = '☀️';
            localStorage.setItem('theme', 'light');
        }
    };
});


// Show homepage by default
window.onload = () => {
  homeSection.classList.add("active");
  updateRemoveButtons(); // Ensure the remove button functionality works on load
  calculateTotal(); // Calculate total on load
};


// Handle Add Another Flavor button
function updateRemoveButtons() {
  const allRows = document.querySelectorAll('.flavourRow');
  const removeButtons = document.querySelectorAll('.removeFlavour');
  if (allRows.length > 1) {
    removeButtons.forEach(btn => btn.style.display = 'inline-block');
  } else {
    removeButtons.forEach(btn => btn.style.display = 'none');
  }
}

// Event delegation to handle remove clicks
document.getElementById("flavourContainer").addEventListener("click", function (e) {
  if (e.target.classList.contains("removeFlavour")) {
    e.target.closest(".flavourRow").remove();
    updateRemoveButtons();
    calculateTotal(); 
  }
});

document.getElementById("flavourContainer").addEventListener("input", function (e) {
    // Check if the input or select changed is inside a .flavourRow
    if (e.target.closest(".flavourRow")) {
        calculateTotal();
    }
});

// Also call calculateTotal on change (specifically for the <select> element)
document.getElementById("flavourContainer").addEventListener("change", function (e) {
    if (e.target.classList.contains("flavourSelect")) {
        calculateTotal();
    }
});

// Logo link to smooth scroll to home
document.querySelector('.logo-link').addEventListener('click', function (event) {
  event.preventDefault();
  document.querySelector('#homeSection').scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });

  homeSection.classList.add('active');
  orderSection.classList.remove('active');
  contactSection.classList.remove('active');
});

function calculateTotal() {
    const rows = document.querySelectorAll('.flavourRow');
    let total = 0;
    
    rows.forEach(row => {
        const select = row.querySelector('.flavourSelect');
        const quantityInput = row.querySelector('input[type="number"]');

        // Check if a valid flavor is selected (the value must not be empty)
        if (select && quantityInput && select.value !== "") { 
            const quantity = parseInt(quantityInput.value) || 0;
            
            // Get the selected option element
            const selectedOption = select.selectedOptions[0];
            
            // CRITICAL FIX: Check if the selected option HAS the data-price attribute
            const price = parseFloat(selectedOption.dataset.price) || 0;
            
            total += price * quantity;
        }
    });
    
    document.getElementById('totalAmount').textContent = "Total: रु" + total.toFixed(2);
}

// ✅ Correct Event Listeners: Trigger calculation on quantity change (input) or flavor change (change)

document.getElementById("addFlavour").onclick = function () {
    const flavourContainer = document.getElementById("flavourContainer");

    const newFlavourRow = document.createElement("div");
    newFlavourRow.classList.add("flavourRow");

    // Use the function to get the correct select HTML
    newFlavourRow.innerHTML = `
        <label>Flavor:
            ${getFlavourSelectHTML()}
        </label>
        <label>Quantity:
            <input type="number" name="quantity[]" min="1" value="1" required>
        </label>
        <button type="button" class="removeFlavour">Remove</button>
    `;

    flavourContainer.appendChild(newFlavourRow);
    updateRemoveButtons();
    calculateTotal();
};


// Handle form submit
// Open preview modal on submit
document.getElementById('submitOrderBtn').onclick = function(e) {
    e.preventDefault();
    const form = document.getElementById('orderForm');

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const rows = document.querySelectorAll('.flavourRow');
    const list = document.getElementById('previewList');
    list.innerHTML = "";
    let total = 0;

    rows.forEach(row => {
        const select = row.querySelector('.flavourSelect');
        const flavour = select.value;
        const quantity = row.querySelector('input[type="number"]').value;
        const price = parseFloat(select.selectedOptions[0].dataset.price) || 0;
        const subtotal = price * quantity;
        total += subtotal;

        const li = document.createElement('p');
        li.textContent = `${flavour} x ${quantity} = रु${subtotal.toFixed(2)}`;
        list.appendChild(li);
    });

 document.getElementById('previewTotal').textContent = "Total: रु" + total.toFixed(2);

    openModal(); 
};

