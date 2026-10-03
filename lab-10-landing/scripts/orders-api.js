// Sipariş "sunucusu". Hocanın API'si kapalı (СДО: «API для ЛР 7-9 недоступен, делайте через локальное
// хранилище»), bu yüzden siparişler tarayıcının localStorage'ında tutuluyor.
// Fonksiyonlar API'nin uç noktalarının işini yapıyor: GET (liste, tek sipariş), POST (yeni), PUT (değiştir),
// DELETE (sil). Alanları kontrol eder, id ve tarih verir, kaydeder. async olduğu için çağıran kod fetch'le konuşuyormuş gibi await kullanıyor —
// API açılırsa sadece bu dosyanın içi fetch'e çevrilir, sayfaların kodu değişmez.
const ORDERS_STORAGE_KEY = 'food-construct-orders';
const MAX_ORDERS = 10;   // API kuralı: bir kullanıcının aynı anda en fazla 10 siparişi olabilir

// Kayıtlı siparişleri okur; hiç yoksa boş dizi
function readOrders() {
  const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

function writeOrders(orders) {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

// Teslimat saati kuralları API'deki tablodan: 07:00–23:00, 5 dakika adım, şu andan önce olamaz
function checkDeliveryTime(time) {
  if (!time) {
    throw new Error('Укажите время доставки');
  }

  const parts = time.split(':');                       // "12:35" → ["12", "35"]
  const minutesOfDay = Number(parts[0]) * 60 + Number(parts[1]);
  const now = new Date();

  if (minutesOfDay < 7 * 60 || minutesOfDay > 23 * 60) {
    throw new Error('Доставка возможна только с 7:00 до 23:00');
  }
  if (Number(parts[1]) % 5 !== 0) {
    throw new Error('Время доставки выбирается с шагом 5 минут');
  }
  if (minutesOfDay < now.getHours() * 60 + now.getMinutes()) {
    throw new Error('Время доставки не может быть раньше текущего времени');
  }
}

// API'nin sunucu tarafında yaptığı kontroller. Sorun varsa Error fırlatılır; mesajı kullanıcıya gösterilir
function checkOrder(data) {
  const required = {
    full_name: 'Имя',
    email: 'Email',
    phone: 'Номер телефона',
    delivery_address: 'Адрес доставки'
  };

  Object.keys(required).forEach(function (field) {
    if (!data[field]) {
      throw new Error('Не заполнено поле «' + required[field] + '»');
    }
  });

  if (data.drink_id === null) {
    throw new Error('В заказе должен быть напиток');   // drink_id — API'de zorunlu alan
  }
  if (data.delivery_type !== 'now' && data.delivery_type !== 'by_time') {
    throw new Error('Выберите время доставки');
  }
  if (data.delivery_type === 'by_time') {
    checkDeliveryTime(data.delivery_time);
  }
}

// POST /labs/api/orders karşılığı: yeni siparişi kaydeder ve kaydedilmiş hâlini döndürür
async function createOrder(data) {
  checkOrder(data);

  const orders = readOrders();
  if (orders.length >= MAX_ORDERS) {
    throw new Error('Нельзя хранить больше 10 заказов. Удалите старые заказы на странице «Заказы»');
  }

  // id ve tarihleri API'de sunucu koyuyor, burada da kullanıcı değil bu fonksiyon veriyor
  const lastId = orders.reduce(function (max, item) { return Math.max(max, item.id); }, 0);
  const now = new Date().toISOString();
  const newOrder = Object.assign({ id: lastId + 1 }, data, { created_at: now, updated_at: now });

  orders.push(newOrder);
  writeOrders(orders);
  return newOrder;
}

// ----- ЛР9: okuma, değiştirme, silme -----

// API'de sadece bu alanlar düzenlenebiliyor (ödev: full_name, email, phone, delivery_address,
// delivery_type, delivery_time, comment). Yemekler, id ve tarihler değişmez
const EDITABLE_FIELDS = ['full_name', 'email', 'phone', 'delivery_address', 'delivery_type', 'delivery_time', 'comment'];

// GET /labs/api/orders karşılığı: bütün siparişler
async function getOrders() {
  return readOrders();
}

// GET /labs/api/orders/{id} karşılığı: tek sipariş; yoksa hata (API'de 404)
async function getOrder(id) {
  const order = readOrders().find(function (item) { return item.id === id; });
  if (!order) {
    throw new Error('Заказ не найден');
  }
  return order;
}

// PUT /labs/api/orders/{id} karşılığı. API gibi sadece değişen alanlar gönderilir; kontrol de sadece onlara
async function changeOrder(id, changes) {
  const orders = readOrders();
  const index = orders.findIndex(function (item) { return item.id === id; });
  if (index === -1) {
    throw new Error('Заказ не найден');
  }

  // Düzenlenemeyen alanları at: istekte yemek ya da id gelse bile dokunulmaz
  const allowed = {};
  Object.keys(changes).forEach(function (field) {
    if (EDITABLE_FIELDS.includes(field)) {
      allowed[field] = changes[field];
    }
  });

  // Zorunlu alan boş bırakılamaz
  ['full_name', 'email', 'phone', 'delivery_address'].forEach(function (field) {
    if (field in allowed && !allowed[field]) {
      throw new Error('Обязательное поле не может быть пустым');
    }
  });

  const updated = Object.assign({}, orders[index], allowed);   // eski sipariş + değişenler

  // Teslimat değiştiyse saat kuralları yeniden kontrol edilir; «как можно скорее»de saat silinir
  if ('delivery_type' in allowed || 'delivery_time' in allowed) {
    if (updated.delivery_type === 'by_time') {
      checkDeliveryTime(updated.delivery_time);
    } else {
      updated.delivery_time = null;
    }
  }

  updated.updated_at = new Date().toISOString();
  orders[index] = updated;
  writeOrders(orders);
  return updated;
}

// DELETE /labs/api/orders/{id} karşılığı: silinen siparişi döndürür (API de öyle yapıyor)
async function removeOrder(id) {
  const orders = readOrders();
  const index = orders.findIndex(function (item) { return item.id === id; });
  if (index === -1) {
    throw new Error('Заказ не найден');
  }

  const removed = orders.splice(index, 1)[0];   // splice diziden çıkarır ve çıkarılanları döndürür
  writeOrders(orders);
  return removed;
}
