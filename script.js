let currentLang = "en";
let restaurantData = null;

// ======= DOM Elements =======
const landingPage = document.getElementById("landing-screen");
const landingLogo = document.getElementById("landingLogo");
const landingTitle = document.getElementById("landingTitle");
const openMenuBtn = document.getElementById("openMenuBtn");

const menuPage = document.getElementById("menu-book");
const restaurantLogo = document.getElementById("restaurantLogo");
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const langToggle = document.getElementById("langToggle");
const menuContainer = document.getElementById("menu-sections");

// ======= Modal =======
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalPrice = document.getElementById("modal-price");
const modalIngredients = document.getElementById("modal-ingredients");
const modalClose = modal.querySelector(".close");

const defaultLogo = "images/default-logo.png";

// ======= Safe image setter =======
function safeSetImage(imgEl, src, altText) {
  if (!src) {
    imgEl.src = "";
    imgEl.alt = altText;
  } else {
    imgEl.src = src;
    imgEl.alt = altText;
    imgEl.onerror = () => { imgEl.src = ""; imgEl.alt = altText; };
  }
}

// ======= Load Restaurant JSON =======
async function loadRestaurantData() {
  try {
    const params = new URLSearchParams(window.location.search);
    const restaurant = params.get("restaurant") || "lemon-chilli";
    const res = await fetch(`data/${restaurant}.json`);
    if (!res.ok) throw new Error("Menu file not found");
    restaurantData = await res.json();
    renderLanding();
    renderMenuSections();
  } catch (err) {
    console.error(err);
    landingTitle.textContent = "Restaurant not found";
    openMenuBtn.style.display = "none";
  }
}

// ======= Landing Page =======
function renderLanding() {
  landingTitle.textContent = restaurantData.name;
  titleEl.textContent = `${restaurantData.name}`;
  subtitleEl.textContent = restaurantData.subtitle || "";

  safeSetImage(landingLogo, restaurantData.logo, restaurantData.name);
  safeSetImage(restaurantLogo, restaurantData.logo, restaurantData.name);
}

// ======= Menu Sections =======
function renderMenuSections(filteredItems = null) {
  menuContainer.innerHTML = "";

  const itemsToRender = filteredItems || restaurantData.items;

  // group items by sections
  restaurantData.sections.forEach(section => {
    const sectionKey = section.key;
    const sectionTitle = currentLang === "en" ? section.titleEn : section.titleHi;

    const sectionItems = itemsToRender.filter(i => i.type === sectionKey);
    if (!sectionItems.length) return;

    const secDiv = document.createElement("section");
    secDiv.className = "menu-section";
    secDiv.innerHTML = `<h2 class="menu-headline">${sectionTitle}</h2>`;

    const ul = document.createElement("ul");
    ul.className = "menu-list";

    sectionItems.forEach(item => {
      const li = document.createElement("li");
      li.className = "menu-item";

      li.innerHTML = `
        <span class="menu-item-name">${item.name[currentLang]}</span>
        <span class="menu-item-price">₹${item.price}</span>
      `;

      li.addEventListener("click", () => showItemDetails(item));
      ul.appendChild(li);
    });

    secDiv.appendChild(ul);
    menuContainer.appendChild(secDiv);

    // Toggle section open/close
    const headline = secDiv.querySelector(".menu-headline");
    headline.addEventListener("click", () => {
      secDiv.classList.toggle("active");
    });
  });

  // If filteredItems exist but nothing matched
  if (filteredItems && filteredItems.length === 0) {
    menuContainer.innerHTML = `<p style="padding:15px; text-align:center; color:#b78532; font-weight:bold;">Sorry, no items found.</p>`;
  }
}

// ======= Item Details Modal =======
function showItemDetails(item) {
  modalTitle.textContent = item.name[currentLang];
  modalPrice.textContent = `₹${item.price}`;
  modalIngredients.innerHTML = item.ingredients[currentLang].map(i => `<li>${i}</li>`).join("");
  safeSetImage(modalImg, item.image, item.name[currentLang]);
  modal.style.display = "block";
}

// Close modal
modalClose.addEventListener("click", () => { modal.style.display = "none"; });
window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

// ======= Language Toggle =======
langToggle.addEventListener("click", () => {
  currentLang = currentLang === "en" ? "hi" : "en";
  langToggle.textContent = currentLang === "en" ? "हिंदी" : "English";
  renderMenuSections();
});

// ======= Page Flow =======
openMenuBtn.addEventListener("click", () => {
  landingPage.style.display = "none";
  menuPage.style.display = "block";
});

// ======= Search Functionality =======
const searchInput = document.createElement("input");
searchInput.type = "text";
searchInput.id = "menuSearch";
searchInput.placeholder = "Search menu...";
menuPage.insertBefore(searchInput, menuContainer);

const searchWrapper = document.createElement("div");
searchWrapper.id = "searchWrapper";
searchWrapper.appendChild(searchInput);
menuPage.insertBefore(searchWrapper, menuContainer);


searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    renderMenuSections(); // reset
    return;
  }

  const filtered = restaurantData.items.filter(item => {
    const nameEn = item.name.en.toLowerCase();
    const nameHi = item.name.hi.toLowerCase();

    const words = query.split(" ");
    // check if all words exist in item name
    return words.every(w => nameEn.includes(w) || nameHi.includes(w));

  });

  renderMenuSections(filtered);
});

// ======= Init =======
loadRestaurantData();
