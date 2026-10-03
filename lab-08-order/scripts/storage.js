// ЛР8: kullanıcının seçimi localStorage'da saklanıyor, böylece sayfa yenilense de kaybolmuyor.
// Ödevin şartı: sadece yemeklerin id'leri tutulur, örn. {"soup":3,"drink":20}. Adı, fiyatı, resmi
// her açılışta sunucudan yeniden yüklenir — fiyat değişirse eski değer kalmaz.
const ORDER_STORAGE_KEY = 'food-construct-order';

// Boş sipariş: her kategori null (seçilmedi). Anahtarlar JSON'daki category değerleriyle aynı
function emptyOrder() {
  return {
    'soup': null,
    'main-course': null,
    'salad': null,
    'drink': null,
    'dessert': null
  };
}

// localStorage sadece metin saklar → JSON.parse ile nesneye çeviriyoruz. Hiç kayıt yoksa getItem null döner
function getSelectedIds() {
  const saved = localStorage.getItem(ORDER_STORAGE_KEY);
  return saved ? JSON.parse(saved) : {};
}

// Sipariş nesnesinden (kategori → yemek) sadece id'leri çıkarıp kaydeder
function saveOrder(order) {
  const ids = {};
  Object.keys(order).forEach(function (category) {
    if (order[category] !== null) {
      ids[category] = order[category].id;
    }
  });
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(ids));   // nesne → metin
}

// Sipariş başarıyla gönderilince seçim tamamen silinir (ödev şartı)
function clearSelectedIds() {
  localStorage.removeItem(ORDER_STORAGE_KEY);
}

// Kayıtlı id'leri, sunucudan gelen yemeklerle eşleştirip sipariş nesnesini kurar:
// {"soup":3} + yemek listesi → { soup: {id:3, name:'Норвежский суп', ...}, 'main-course': null, ... }
function buildOrder(dishes) {
  const ids = getSelectedIds();
  const order = emptyOrder();

  Object.keys(order).forEach(function (category) {
    const dish = dishes.find(function (item) { return item.id === ids[category]; });
    order[category] = dish || null;   // id kayıtlı ama böyle bir yemek artık yoksa seçim sayılmaz
  });
  return order;
}
