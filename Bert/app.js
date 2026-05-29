const PASSWORD = "685173717";
const SESSION_KEY = "yinkunRestaurantAuthed";

function commonsImage(fileName, width = 900) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${width}`;
}

const dishes = [
  {
    id: "chili-pork",
    name: "辣椒炒肉",
    image: commonsImage("Fried Pork with Pepper 20210630.jpg"),
    fallback: "assets/dishes/chili-pork.png",
  },
  {
    id: "potato-shreds",
    name: "炒土豆丝",
    image: commonsImage("Liang ban tu dou si.jpg"),
    fallback: "assets/dishes/potato-shreds.png",
  },
  {
    id: "scallion-beef",
    name: "葱爆牛肉",
    image: commonsImage("HK 沙田北 Shatin North 石門 Shek Mun 安群街 On Kwan Street 京瑞廣場 Kings Wing Plaza shop 南京金陵湯包 Nanjing Jinling Dumpling Restaurant Feb 2019 SSG 05.jpg"),
    fallback: "assets/dishes/scallion-beef.png",
  },
  {
    id: "seaweed-egg-soup",
    name: "紫菜蛋汤",
    image: commonsImage("Egg drop soup.jpg"),
    fallback: "assets/dishes/seaweed-egg-soup.png",
  },
  {
    id: "lettuce-egg",
    name: "莴苣炒蛋",
    image: commonsImage("Scrambled Eggs with Chives and Asiago (4594228418).jpg"),
    fallback: "assets/dishes/lettuce-egg.png",
  },
  {
    id: "cauliflower-pot",
    name: "干锅花菜",
    image: commonsImage("Cauliflower-bajirak-bokkeum.jpg"),
    fallback: "assets/dishes/cauliflower-pot.png",
  },
  {
    id: "edamame-pork",
    name: "毛豆炒肉丝",
    image: commonsImage("Wok-fried edamame by joyosity.jpg"),
    fallback: "assets/dishes/edamame-pork.png",
  },
  {
    id: "crayfish",
    name: "小龙虾",
    image: commonsImage("Spicy crayfish.jpg"),
    fallback: "assets/dishes/crayfish.png",
  },
  {
    id: "greens",
    name: "炒青菜",
    image: commonsImage("Stir Fried Bok Choy, Aug 2025.jpg"),
    fallback: "assets/dishes/greens.png",
  },
  {
    id: "chives",
    name: "炒韭菜",
    image: commonsImage("Scrambled Eggs with Chives and Asiago (4594228418).jpg"),
    fallback: "assets/dishes/chives.png",
  },
  {
    id: "sprouts-beef",
    name: "豆芽炒牛肉",
    image: commonsImage("Tomato ramen with beef 20200906.jpg"),
    fallback: "assets/dishes/sprouts-beef.png",
  },
];

const state = {
  selected: new Set(),
  toastTimer: undefined,
  currentRole: "guest",
  password: localStorage.getItem("yinkunRestaurantPassword") || "",
};

const loginView = document.querySelector("#loginView");
const restaurantView = document.querySelector("#restaurantView");
const loginForm = document.querySelector("#loginForm");
const passwordInput = document.querySelector("#passwordInput");
const loginError = document.querySelector("#loginError");
const logoutBtn = document.querySelector("#logoutBtn");
const guestRoleBtn = document.querySelector("#guestRoleBtn");
const chefRoleBtn = document.querySelector("#chefRoleBtn");
const guestPanel = document.querySelector("#guestPanel");
const chefPanel = document.querySelector("#chefPanel");
const menuGrid = document.querySelector("#menuGrid");
const selectedCount = document.querySelector("#selectedCount");
const selectedItems = document.querySelector("#selectedItems");
const submitOrderBtn = document.querySelector("#submitOrderBtn");
const ordersList = document.querySelector("#ordersList");
const clearOrdersBtn = document.querySelector("#clearOrdersBtn");
const refreshOrdersBtn = document.querySelector("#refreshOrdersBtn");
const toast = document.querySelector("#toast");

async function requestJson(url, options) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "X-Restaurant-Password": state.password,
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "请求失败");
  }

  if (response.status === 204) {
    return undefined;
  }

  return response.json();
}

function formatTime(isoString) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(isoString));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function setAuthenticated(isAuthenticated) {
  localStorage.setItem(SESSION_KEY, isAuthenticated ? "true" : "false");
  loginView.hidden = isAuthenticated;
  restaurantView.hidden = !isAuthenticated;

  if (isAuthenticated) {
    renderMenu();
    renderOrders();
  } else {
    passwordInput.value = "";
    passwordInput.focus();
  }
}

function setRole(role) {
  state.currentRole = role;
  const isGuest = role === "guest";
  guestPanel.hidden = !isGuest;
  chefPanel.hidden = isGuest;
  guestRoleBtn.classList.toggle("active", isGuest);
  chefRoleBtn.classList.toggle("active", !isGuest);

  if (!isGuest) {
    renderOrders();
  }
}

function renderMenu() {
  menuGrid.innerHTML = dishes
    .map((dish) => {
      const isSelected = state.selected.has(dish.id);
      return `
        <article class="dish-card ${isSelected ? "selected" : ""}" data-dish-id="${dish.id}">
          <img src="${dish.image}" data-fallback="${dish.fallback}" alt="${dish.name}" loading="lazy" />
          <div class="dish-body">
            <p class="dish-name">${dish.name}</p>
            <button class="select-button" type="button" aria-label="${isSelected ? "取消选择" : "选择"}${dish.name}">
              ${isSelected ? "✓" : "+"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
  renderSelection();
}

function renderSelection() {
  const selectedDishes = dishes.filter((dish) => state.selected.has(dish.id));
  selectedCount.textContent = String(selectedDishes.length);
  selectedItems.textContent = selectedDishes.length
    ? selectedDishes.map((dish) => dish.name).join("、")
    : "还没有选择菜品";
  submitOrderBtn.disabled = selectedDishes.length === 0;
}

async function renderOrders() {
  if (!ordersList) {
    return;
  }

  ordersList.innerHTML = `<div class="empty-state">正在读取订单...</div>`;

  try {
    const orders = await requestJson("/api/orders");

    if (!orders.length) {
      ordersList.innerHTML = `<div class="empty-state">还没有客人下单</div>`;
      return;
    }

    ordersList.innerHTML = orders
      .slice()
      .reverse()
      .map((order, index) => {
        const orderNumber = orders.length - index;
        const tags = order.items.map((item) => `<li>${item}</li>`).join("");
        return `
          <article class="order-card">
            <div class="order-meta">
              <h3>订单 ${orderNumber}</h3>
              <span>${formatTime(order.createdAt)}</span>
            </div>
            <ul class="dish-tags">${tags}</ul>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    ordersList.innerHTML = `<div class="empty-state">订单读取失败，请稍后刷新</div>`;
    showToast(error.message || "订单读取失败");
  }
}

async function submitOrder() {
  const selectedDishes = dishes.filter((dish) => state.selected.has(dish.id));

  if (!selectedDishes.length) {
    return;
  }

  submitOrderBtn.disabled = true;
  submitOrderBtn.textContent = "提交中...";

  try {
    await requestJson("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        items: selectedDishes.map((dish) => dish.name),
      }),
    });

    state.selected.clear();
    renderMenu();
    renderOrders();
    showToast("订单已提交，厨师后台可以查看");
  } catch (error) {
    showToast(error.message || "提交失败，请重试");
  } finally {
    submitOrderBtn.textContent = "提交订单";
    renderSelection();
  }
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (passwordInput.value.trim() === PASSWORD) {
    state.password = passwordInput.value.trim();
    localStorage.setItem("yinkunRestaurantPassword", state.password);
    loginError.textContent = "";
    setAuthenticated(true);
    return;
  }

  loginError.textContent = "密码不正确，请重新输入";
  passwordInput.select();
});

logoutBtn.addEventListener("click", () => {
  state.password = "";
  localStorage.removeItem("yinkunRestaurantPassword");
  setAuthenticated(false);
});

guestRoleBtn.addEventListener("click", () => {
  setRole("guest");
});

chefRoleBtn.addEventListener("click", () => {
  setRole("chef");
});

menuGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".dish-card");

  if (!card) {
    return;
  }

  const dishId = card.dataset.dishId;
  if (state.selected.has(dishId)) {
    state.selected.delete(dishId);
  } else {
    state.selected.add(dishId);
  }

  renderMenu();
});

menuGrid.addEventListener(
  "error",
  (event) => {
    const image = event.target;
    if (image.tagName !== "IMG" || image.dataset.usedFallback === "true") {
      return;
    }

    image.dataset.usedFallback = "true";
    image.src = image.dataset.fallback;
  },
  true,
);

submitOrderBtn.addEventListener("click", submitOrder);

refreshOrdersBtn.addEventListener("click", renderOrders);

clearOrdersBtn.addEventListener("click", async () => {
  try {
    await requestJson("/api/orders", { method: "DELETE" });
    renderOrders();
    showToast("订单已清空");
  } catch (error) {
    showToast(error.message || "清空失败，请重试");
  }
});

if (localStorage.getItem(SESSION_KEY) === "true") {
  setAuthenticated(true);
} else {
  setAuthenticated(false);
}

window.setInterval(() => {
  if (!restaurantView.hidden && state.currentRole === "chef") {
    renderOrders();
  }
}, 10000);
