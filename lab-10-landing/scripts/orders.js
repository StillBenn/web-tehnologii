// «Заказы» sayfası (ЛР9): kullanıcının siparişleri listelenir; her satırda görüntüle, düzenle, sil.
// Siparişler orders-api.js'ten (API kapalı olduğu için localStorage), yemek bilgileri api.js'ten geliyor.

let dishes = [];
let orders = [];
let currentOrder = null;   // Hangi siparişin penceresi açık — kaydet/sil düğmeleri bunu kullanıyor

// Siparişteki yemek alanları ve pencerede görünen adları (sıra = maketteki sıra)
const DISH_FIELDS = [
  { field: 'soup_id', title: 'Суп' },
  { field: 'main_course_id', title: 'Основное блюдо' },
  { field: 'salad_id', title: 'Салат/стартер' },
  { field: 'drink_id', title: 'Напиток' },
  { field: 'dessert_id', title: 'Десерт' }
];

const viewModal = document.getElementById('view-modal');
const editModal = document.getElementById('edit-modal');
const deleteModal = document.getElementById('delete-modal');
const editForm = editModal.querySelector('.edit-form');

// ----- 1. Yardımcılar -----

// Siparişteki yemekler: [{title: 'Суп', dish: {...}}, ...]; seçilmemiş kategori listeye girmez
function orderDishes(order) {
  const list = [];
  DISH_FIELDS.forEach(function (item) {
    const dish = dishes.find(function (d) { return d.id === order[item.field]; });
    if (dish) {
      list.push({ title: item.title, dish: dish });
    }
  });
  return list;
}

// Sipariş tutarı sunucuda saklanmıyor (API'de de yok), yemek fiyatlarından hesaplanıyor
function orderCost(order) {
  return orderDishes(order).reduce(function (sum, item) { return sum + item.dish.price; }, 0);
}

// ISO tarih ("2026-10-03T19:34:44Z") → "03.10.2026 22:34" (kullanıcının saat diliminde)
function formatDate(isoString) {
  const date = new Date(isoString);
  const pad = function (n) { return String(n).padStart(2, '0'); };   // 3 → "03"
  return pad(date.getDate()) + '.' + pad(date.getMonth() + 1) + '.' + date.getFullYear() +
    ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
}

// Ödev: zamanlı siparişte saat, diğerlerinde «Как можно скорее (с 7:00 до 23:00)»
function deliveryText(order) {
  return order.delivery_type === 'by_time' ? order.delivery_time : 'Как можно скорее (с 7:00 до 23:00)';
}

// Pencere satırı: solda ad, sağda değer (maketteki iki sütun)
function modalRow(label, value) {
  const row = document.createElement('div');
  row.classList.add('modal-row');
  const name = document.createElement('span');
  name.textContent = label;
  const text = document.createElement('span');
  text.textContent = value;
  row.append(name, text);
  return row;
}

function modalHeading(text) {
  const heading = document.createElement('h4');
  heading.textContent = text;
  return heading;
}

// ----- 2. Liste -----

// Siparişleri "sunucudan" alıp tabloyu baştan çizer. Düzenleme ve silmeden sonra da çağrılıyor,
// böylece liste her zaman güncel (ödev şartı)
async function renderOrders() {
  orders = await getOrders();

  // Ödev: en yeni sipariş en üstte. ISO tarih metinleri alfabetik sırayla da doğru sıralanır,
  // ama Date'e çevirip çıkarmak niyeti daha açık gösteriyor
  orders.sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at); });

  const tbody = document.querySelector('.orders-table tbody');
  tbody.replaceChildren();

  document.querySelector('.empty-orders').style.display = orders.length > 0 ? 'none' : '';
  document.querySelector('.table-wrap').style.display = orders.length > 0 ? '' : 'none';

  orders.forEach(function (order, index) {
    const row = document.createElement('tr');

    const cells = [
      index + 1,                                                     // listedeki sıra numarası (id değil)
      formatDate(order.created_at),
      orderDishes(order).map(function (item) { return item.dish.name; }).join(', '),
      orderCost(order) + '₽',
      deliveryText(order)
    ];
    cells.forEach(function (value) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    });

    // İşlem düğmeleri: data-action hangi pencere, data-id hangi sipariş — tıklama tbody'de yakalanıyor
    const actions = document.createElement('td');
    actions.classList.add('actions');
    [
      { action: 'view', icon: 'bi-eye', label: 'Подробнее' },
      { action: 'edit', icon: 'bi-pencil', label: 'Редактирование' },
      { action: 'delete', icon: 'bi-trash', label: 'Удаление' }
    ].forEach(function (item) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.action = item.action;
      button.dataset.id = order.id;
      button.title = item.label;                 // fareyle üzerine gelince ipucu
      button.setAttribute('aria-label', item.label);   // ekran okuyucu ikonu bu adla okur

      const icon = document.createElement('i');
      icon.classList.add('bi', item.icon);
      button.append(icon);
      actions.append(button);
    });
    row.append(actions);

    tbody.append(row);
  });
}

// Tek dinleyici bütün satırların düğmelerine yetiyor (делегирование, ЛР5'teki filtrelerle aynı fikir)
document.querySelector('.orders-table tbody').addEventListener('click', function (event) {
  const button = event.target.closest('button');   // ikona tıklansa da düğmeyi bulur
  if (!button) {
    return;
  }

  currentOrder = orders.find(function (order) { return order.id === Number(button.dataset.id); });

  if (button.dataset.action === 'view') {
    openView(currentOrder);
  } else if (button.dataset.action === 'edit') {
    openEdit(currentOrder);
  } else {
    deleteModal.showModal();
  }
});

// ----- 3. «Подробнее» penceresi -----

function openView(order) {
  const body = viewModal.querySelector('.modal-body');
  body.replaceChildren();

  body.append(
    modalRow('Дата оформления', formatDate(order.created_at)),
    modalHeading('Доставка'),
    modalRow('Имя получателя', order.full_name),
    modalRow('Адрес доставки', order.delivery_address),
    modalRow('Время доставки', deliveryText(order)),
    modalRow('Телефон', order.phone),
    modalRow('Email', order.email)
  );

  // Yorum boşsa başlığıyla birlikte hiç gösterilmez
  if (order.comment) {
    const comment = document.createElement('p');
    comment.textContent = order.comment;
    body.append(modalHeading('Комментарий'), comment);
  }

  body.append(modalHeading('Состав заказа'));
  orderDishes(order).forEach(function (item) {
    body.append(modalRow(item.title, item.dish.name + ' (' + item.dish.price + '₽)'));
  });

  const total = document.createElement('p');
  total.classList.add('modal-total');
  total.textContent = 'Стоимость: ' + orderCost(order) + '₽';
  body.append(total);

  viewModal.showModal();   // modal olarak açar: arka plan kararır, sayfa tıklanamaz
}

// ----- 4. «Редактирование» penceresi -----

// Formun alanlarını siparişin değerleriyle doldurur (ödev şartı)
function openEdit(order) {
  editForm.querySelector('.edit-date').textContent = formatDate(order.created_at);
  editForm.elements.full_name.value = order.full_name;
  editForm.elements.delivery_address.value = order.delivery_address;
  editForm.elements.delivery_type.value = order.delivery_type;   // radio grubunda doğru seçeneği işaretler
  editForm.elements.delivery_time.value = order.delivery_time || '';
  editForm.elements.phone.value = order.phone;
  editForm.elements.email.value = order.email;
  editForm.elements.comment.value = order.comment || '';

  const dishesBlock = editForm.querySelector('.edit-dishes');
  dishesBlock.replaceChildren();
  orderDishes(order).forEach(function (item) {
    dishesBlock.append(modalRow(item.title, item.dish.name + ' (' + item.dish.price + '₽)'));
  });
  editForm.querySelector('.modal-total').textContent = 'Стоимость: ' + orderCost(order) + '₽';

  editModal.showModal();
}

// «Сохранить»: sadece değişen alanlar gönderilir (API: «достаточно передать только значения изменившихся полей»)
editForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  const changes = {};
  ['full_name', 'delivery_address', 'delivery_type', 'delivery_time', 'phone', 'email', 'comment'].forEach(function (field) {
    let value = editForm.elements[field].value.trim();
    if (field === 'delivery_time' && value === '') {
      value = null;                                  // boş saat = saat yok (siparişte de null tutuluyor)
    }
    if (value !== (currentOrder[field] === undefined ? null : currentOrder[field])) {
      changes[field] = value;
    }
  });

  try {
    await changeOrder(currentOrder.id, changes);
    editModal.close();
    showNotification('Заказ успешно изменён');
    await renderOrders();   // tablo yeni değerlerle
  } catch (error) {
    // Pencere açık kalıyor; hata kutusu pencerenin içine ekleniyor ki tıklanabilsin
    showNotification('Не удалось сохранить заказ. ' + error.message, editModal);
  }
});

// ----- 5. «Удаление» penceresi -----

deleteModal.querySelector('.modal-delete').addEventListener('click', async function () {
  try {
    await removeOrder(currentOrder.id);
    deleteModal.close();
    showNotification('Заказ успешно удалён');
    await renderOrders();   // silinen sipariş listeden kalkar
  } catch (error) {
    showNotification('Не удалось удалить заказ. ' + error.message, deleteModal);
  }
});

// ----- 6. Pencereleri kapatma -----

// Çarpı, «Ок» ve «Отмена» düğmeleri sadece pencereyi kapatır; hiçbir şey kaydedilmez
document.querySelectorAll('.modal-close, .modal-ok, .modal-cancel').forEach(function (button) {
  button.addEventListener('click', function () {
    button.closest('dialog').close();
  });
});

// ----- 7. Sayfa yüklenince çalıştır -----

async function init() {
  try {
    dishes = await loadDishes();   // tablodaki yemek adları ve fiyatlar için
    await renderOrders();
  } catch (error) {
    showNotification('Не удалось загрузить заказы. ' + error.message);
  }
}

init();
