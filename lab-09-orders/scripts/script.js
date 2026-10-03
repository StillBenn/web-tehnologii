// «Собрать ланч» sayfası. Yemekler sunucudan gelir (api.js), seçim localStorage'da saklanır (storage.js).
// ЛР8: sipariş formu «Оформить заказ» sayfasına taşındı; burada sadece seçim ve alttaki panel kaldı.

// Sunucudan gelen yemekler. Başta boş: veri gelene kadar çizilecek bir şey yok
let dishes = [];

// Kullanıcının seçtiği yemekler (kategori → yemek nesnesi). Açılışta localStorage'daki id'lerden kurulur
let order = emptyOrder();

// ----- 1. Yemekleri sayfaya çizme -----

// Tek bir kategoriyi çizer. kind verilirse sadece o türdeki yemekler kalır; verilmezse (null) hepsi.
// Filtre değişince aynı fonksiyon yeniden çağrılıyor: önce kapsayıcı boşaltılır, sonra dolar.
function renderCategory(section, kind) {
  const category = section.dataset.category;             // data-category="soup" → 'soup'

  section.replaceChildren();                              // Eski kartları siler; yoksa filtrede kartlar üst üste birikirdi

  const list = dishes
    .filter(function (dish) { return dish.category === category; })   // Sadece bu bölümün yemekleri
    .filter(function (dish) { return kind === null || dish.kind === kind; }) // Filtre seçiliyse türe göre süz
    .sort(function (a, b) { return a.name.localeCompare(b.name); });   // Alfabetik; localeCompare Kiril'i doğru sıralar

  list.forEach(function (dish) {
    const card = createDishCard(dish, 'Добавить');

    // Kartın herhangi bir yerine tıklayınca yemek seçilir. Yemek karttaki data-dish ile diziden bulunuyor
    card.addEventListener('click', function () {
      selectDish(card.dataset.dish);
    });

    section.append(card);                                 // Kartı sayfaya (DOM'a) ekler, artık görünür
  });

  markSelected();                                         // Filtreden sonra da seçili kart vurgulu kalsın
}

// Sayfa açılınca bütün kategorileri filtresiz çizer
function renderDishes() {
  document.querySelectorAll('.dishes').forEach(function (section) {
    renderCategory(section, null);
  });
}

// ----- 2. Filtreler (ЛР5) -----

// Bir filtre bloğundaki tıklamayı işler. Dinleyici tek tek düğmelere değil kapsayıcıya bağlı
// (делегирование): tıklama düğmeden yukarı kabarır, burada event.target ile hangi düğme olduğuna bakılır.
function handleFilterClick(event) {
  const button = event.target.closest('button');          // Düğmenin içindeki yazıya tıklansa da düğmeyi bulur
  if (!button) {
    return;                                               // Düğmeler arası boşluğa tıklandı: hiçbir şey yapma
  }

  const filters = event.currentTarget;                    // Dinleyicinin bağlı olduğu .filters kapsayıcısı
  const wasActive = button.classList.contains('active');

  // Aynı kategoride en fazla bir filtre seçili olabilir: önce hepsinden active'i kaldır
  filters.querySelectorAll('button').forEach(function (b) {
    b.classList.remove('active');
  });

  // Seçili düğmeye tekrar tıklandıysa filtre kapanır; değilse bu düğme aktif olur
  if (!wasActive) {
    button.classList.add('active');
  }

  // Bu kategorinin kapsayıcısını bul ve yeni filtreyle baştan çiz
  const category = filters.dataset.category;
  const section = document.querySelector('.dishes[data-category="' + category + '"]');
  renderCategory(section, wasActive ? null : button.dataset.kind);
}

// Her filtre bloğuna tek bir dinleyici: 5 blok = 5 dinleyici, 14 düğme için ayrı ayrı gerekmedi
document.querySelectorAll('.filters').forEach(function (filters) {
  filters.addEventListener('click', handleFilterClick);
});

// ----- 3. Yemek seçme -----

// Tıklanan yemeği kendi kategorisine yazar; aynı kategoriden ikinci seçim öncekinin yerine geçer.
// ЛР8: her seçimden sonra id'ler localStorage'a yazılıyor — sayfa yenilense de seçim kaybolmaz
function selectDish(keyword) {
  const dish = dishes.find(function (item) { return item.keyword === keyword; });
  order[dish.category] = dish;
  saveOrder(order);
  markSelected();
  updatePanel();
}

// Seçili yemeklerin kartlarına selected sınıfı verir, diğerlerinden kaldırır (ödev: seçilenler menüde vurgulu)
function markSelected() {
  document.querySelectorAll('.dish').forEach(function (card) {
    const dish = dishes.find(function (item) { return item.keyword === card.dataset.dish; });
    const isSelected = order[dish.category] !== null && order[dish.category].id === dish.id;
    card.classList.toggle('selected', isSelected);       // ikinci parametre true → ekle, false → kaldır
  });
}

// ----- 4. «Перейти к оформлению» paneli (ЛР8) -----

const panel = document.querySelector('.checkout-panel');
const checkoutLink = document.querySelector('.checkout-link');

// Paneli siparişe göre günceller: görünürlük, toplam fiyat, linkin açık/kapalı olması
function updatePanel() {
  const chosen = Object.values(order).filter(function (dish) { return dish !== null; });

  // Hiç yemek eklenmemişse panel tamamen gizli (ödev şartı)
  panel.style.display = chosen.length > 0 ? '' : 'none';

  const total = chosen.reduce(function (sum, dish) { return sum + dish.price; }, 0);
  panel.querySelector('.checkout-price').textContent = total + '₽';

  // Seçim bir komboya uymuyorsa link kapalı: validateOrder uyarı metni döndürüyorsa kombo eksik demek
  const isValid = validateOrder(order) === null;
  checkoutLink.classList.toggle('disabled', !isValid);
  checkoutLink.setAttribute('aria-disabled', String(!isValid));   // ekran okuyucuya da "kapalı" bilgisini verir
}

// CSS'teki pointer-events fareyi durduruyor ama klavyeyle (Tab + Enter) link yine açılabilir; burada onu da engelliyoruz
checkoutLink.addEventListener('click', function (event) {
  if (checkoutLink.classList.contains('disabled')) {
    event.preventDefault();
  }
});

// ----- 5. Sayfa yüklenince çalıştır -----

// Önce yemekleri sunucudan al, sonra localStorage'daki seçimi onlarla eşleştir, en son çiz
async function init() {
  try {
    dishes = await loadDishes();
    order = buildOrder(dishes);   // ödev: sayfa açılınca mevcut sipariş dikkate alınsın
    renderDishes();
    updatePanel();
  } catch (error) {
    showNotification('Не удалось загрузить меню. ' + error.message);
  }
}

updatePanel();   // Veri beklenirken panel gizli dursun
init();
