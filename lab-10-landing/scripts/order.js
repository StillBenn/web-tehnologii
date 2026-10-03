// «Оформить заказ» sayfası (ЛР8). Seçilen yemeklerin id'leri localStorage'dan, bilgileri sunucudan gelir.
// Kartlarda «Удалить» düğmesi var; form gönderilince sipariş kaydedilir ve seçim temizlenir.

let dishes = [];
let order = emptyOrder();

const form = document.querySelector('.order form');

// ----- 1. «Состав заказа»: seçilen yemeklerin kartları -----

function renderOrderDishes() {
  const container = document.querySelector('.order-dishes .dishes');
  const emptyText = document.querySelector('.empty-order');

  container.replaceChildren();   // Eski kartları sil, baştan çiz

  // Object.values sırayı korur: çorba, ana yemek, salata, içecek, tatlı — maketteki sıra
  const chosen = Object.values(order).filter(function (dish) { return dish !== null; });

  // Hiç yemek yoksa «Ничего не выбрано…» metni görünür (ödev şartı)
  emptyText.style.display = chosen.length > 0 ? 'none' : '';

  chosen.forEach(function (dish) {
    const card = createDishCard(dish, 'Удалить');

    // «Удалить»: yemek siparişten ve localStorage'dan silinir, kart sayfadan kalkar
    card.querySelector('button').addEventListener('click', function () {
      removeDish(dish.category);
    });

    container.append(card);
  });
}

function removeDish(category) {
  order[category] = null;
  saveOrder(order);        // localStorage'da da artık bu yemeğin id'si yok
  renderOrderDishes();     // kart kaybolur
  updateSummary();         // formda «Не выбран» yazar, toplam yeniden hesaplanır
}

// ----- 2. Formun sol tarafı: «Ваш заказ» -----

function updateSummary() {
  let total = 0;

  document.querySelectorAll('.chosen[data-category]').forEach(function (block) {
    const dish = order[block.dataset.category];
    const line = block.querySelector('.chosen-dish');

    if (dish) {
      line.textContent = dish.name + ' ' + dish.price + '₽';   // "Гаспачо 195₽"
      total += dish.price;
    } else {
      line.textContent = block.dataset.empty;                  // «Не выбран» / «Не выбрано»
    }
  });

  document.querySelector('.chosen-price').textContent = total + '₽';
}

// ----- 3. Gönderim -----

// Formdaki değerleri API'nin beklediği nesneye çevirir. FormData input'ları name'lerine göre okur
function collectOrderData() {
  const formData = new FormData(form);
  const deliveryType = formData.get('delivery_type');

  // Seçilmemiş kategori için null gider; API bunu "bu yemek yok" diye anlıyor
  function idOf(category) {
    return order[category] ? order[category].id : null;
  }

  return {
    full_name: formData.get('full_name').trim(),
    email: formData.get('email').trim(),
    subscribe: formData.get('subscribe') ? 1 : 0,
    phone: formData.get('phone').trim(),
    delivery_address: formData.get('delivery_address').trim(),
    delivery_type: deliveryType,
    // Saat sadece «к указанному времени» seçildiyse anlamlı; «как можно скорее»de gönderilmiyor
    delivery_time: deliveryType === 'by_time' ? formData.get('delivery_time') : null,
    comment: formData.get('comment').trim(),
    soup_id: idOf('soup'),
    main_course_id: idOf('main-course'),
    salad_id: idOf('salad'),
    drink_id: idOf('drink'),
    dessert_id: idOf('dessert')
  };
}

form.addEventListener('submit', async function (event) {
  event.preventDefault();   // Sayfa yenilenmesin: gönderimi kendimiz yapıyoruz

  // ЛР6'daki kombo kontrolü gönderimden önce (ödev şartı)
  const message = validateOrder(order);
  if (message !== null) {
    showNotification(message);
    return;
  }

  try {
    await createOrder(collectOrderData());

    // Başarılı: seçim localStorage'dan silinir (ödev şartı), sayfa boş sipariş hâline döner
    clearSelectedIds();
    order = emptyOrder();
    form.reset();
    renderOrderDishes();
    updateSummary();
    showNotification('Заказ успешно оформлен! Его можно посмотреть на странице «Заказы»');
  } catch (error) {
    // Başarısız: seçim olduğu gibi kalır, kullanıcı hatayı düzeltip tekrar gönderebilir
    showNotification('Не удалось оформить заказ. ' + error.message);
  }
});

// ----- 4. Sayfa yüklenince çalıştır -----

async function init() {
  try {
    dishes = await loadDishes();
    order = buildOrder(dishes);
  } catch (error) {
    showNotification('Не удалось загрузить данные о блюдах. ' + error.message);
  }
  renderOrderDishes();
  updateSummary();
}

init();
