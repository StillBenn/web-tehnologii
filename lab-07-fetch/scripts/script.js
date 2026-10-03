// ЛР7: yemekler artık dishes.js dizisinden değil, loadDishes() ile JSON olarak "sunucudan" yükleniyor.
//
// Hocanın API'si (edu.std-900.ist.mospolytech.ru) kapalı — СДО'daki duyuru: «API для ЛР 7-9 недоступен».
// Bu yüzden API'nin döndürdüğü JSON'un birebir aynısı sitenin içindeki api/dishes.json dosyasında duruyor
// ve fetch ona istek atıyor. API açılırsa sadece aşağıdaki adres değişir, kodun geri kalanı aynı kalır:
// https://edu.std-900.ist.mospolytech.ru/labs/api/dishes
const API_URL = 'api/dishes.json';

// Sunucudan gelen yemekler buraya yazılır. Başta boş: veri gelene kadar çizilecek bir şey yok
let dishes = [];

// Kullanıcının seçtiği yemekler. Başta hiçbiri seçili değil (null = boş).
// Anahtarlar dizideki category değerleriyle aynı: böylece yemeğin kategorisiyle doğrudan buraya yazabiliyoruz.
// ЛР5: iki yeni kategori eklendi — salad ve dessert.
const order = {
  'soup': null,
  'main-course': null,
  'salad': null,
  'drink': null,
  'dessert': null
};

// ----- 1. Yemekleri sayfaya çizme -----

// Bir yemek nesnesinden kart (div.dish) üretir. Eski statik kartla birebir aynı yapı:
// img, fiyat, isim, ağırlık, düğme. Yapı aynı olunca ЛР2'nin CSS'i değişmeden çalışıyor.
function createDishCard(dish) {
  const card = document.createElement('div');   // Boş bir div oluşturur; henüz sayfada değil
  card.classList.add('dish');                    // ЛР2'deki stiller .dish sınıfına bağlı
  card.dataset.dish = dish.keyword;              // data-dish="gazpacho": tıklayınca yemeği dizide bununla buluyoruz

  const image = document.createElement('img');
  image.src = dish.image;                       // JSON'da yol tam geliyor: 'images/soups/gazpacho.jpg'
  image.alt = dish.name;                         // Resim yüklenmezse ismi gösterir

  const price = document.createElement('p');
  price.classList.add('price');
  price.textContent = dish.price + '₽';          // textContent: içeriği düz yazı olarak koyar, HTML olarak yorumlamaz

  const name = document.createElement('p');
  name.classList.add('name');
  name.textContent = dish.name;

  const weight = document.createElement('p');
  weight.classList.add('weight');
  weight.textContent = dish.count;

  const button = document.createElement('button');
  button.type = 'button';                        // Yazmazsak tarayıcı onu submit sayar ve formu göndermeye kalkar
  button.textContent = 'Добавить';

  card.append(image, price, name, weight, button); // Parçaları karta bu sırayla ekler (sıra maketle aynı)

  // Kartın herhangi bir yerine tıklayınca yemek seçilir (ödev: "при клике на карточку").
  // Nesneyi doğrudan vermiyoruz: karttaki data-dish okunuyor, yemek diziden bununla bulunuyor (ödev şartı)
  card.addEventListener('click', function () {
    selectDish(card.dataset.dish);
  });

  return card;
}

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
    section.append(createDishCard(dish));                 // Kartı sayfaya (DOM'a) ekler, artık görünür
  });
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

  // Seçili düğmeye tekrar tıklandıysa filtre kapanır (ödev şartı); değilse bu düğme aktif olur
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

// ----- 3. Yemek seçme ve "Ваш заказ" bloğu (ЛР4) -----

// Tıklanan yemeği kendi kategorisine yazar; aynı kategoriden ikinci seçim öncekinin yerine geçer.
// Filtre kartları yeniden çizse bile order nesnesi değişmez: seçim kaybolmaz (ödev: eski işlevler çalışsın)
function selectDish(keyword) {
  // data-dish'teki Latin adı dizideki keyword ile karşılaştırıp yemeği buluyoruz.
  // find: koşulu sağlayan İLK nesneyi döndürür; keyword benzersiz olduğu için tek sonuç var
  const dish = dishes.find(function (item) { return item.keyword === keyword; });
  order[dish.category] = dish;
  updateOrder();
}

// "Ваш заказ" bloğunu order nesnesine göre baştan çizer. Tek bir yerde karar veriliyor:
// ne gösterilir, ne gizlenir, toplam kaç. Sayfa açılırken de bir kez çağrılıyor.
function updateOrder() {
  const nothing = document.querySelector('.nothing');         // "Ничего не выбрано" satırı
  const totalBlock = document.querySelector('.total');        // "Стоимость заказа" bloğu
  const chosenBlocks = document.querySelectorAll('.chosen[data-category]'); // Beş kategori satırı

  // En az bir yemek seçilmiş mi? Object.values → [null, null, dish, ...]; some → biri null değilse true
  const anySelected = Object.values(order).some(function (dish) { return dish !== null; });

  // Hiç seçim yoksa: sadece "Ничего не выбрано" görünür, kategori satırları ve toplam gizli
  nothing.style.display = anySelected ? 'none' : '';
  totalBlock.style.display = anySelected ? '' : 'none';

  let total = 0;

  chosenBlocks.forEach(function (block) {
    const category = block.dataset.category;
    const dish = order[category];
    const line = block.querySelector('.chosen-dish');

    block.style.display = anySelected ? '' : 'none';

    if (dish) {
      line.textContent = dish.name + ' ' + dish.price + '₽';   // "Гаспачо 195₽"
      total += dish.price;
    } else {
      line.textContent = block.dataset.empty;                  // "Блюдо не выбрано" / "Напиток не выбран" HTML'de duruyor
    }

    // Formla birlikte giden gizli alan: seçili yemeğin keyword'ü, yoksa boş
    const hiddenInput = document.querySelector('input[name="' + category + '"]');
    hiddenInput.value = dish ? dish.keyword : '';
  });

  totalBlock.querySelector('.chosen-price').textContent = total + '₽';
}

// ----- 4. Verileri sunucudan yükleme (ЛР7) -----

// fetch isteği gönderir ve cevabı bekler. async/await: cevap gelene kadar fonksiyon "durur",
// ama sayfa donmaz — tarayıcı bu arada başka işleri yapmaya devam eder
async function loadDishes() {
  try {
    const response = await fetch(API_URL);             // GET isteği; cevabın başlıkları gelince devam eder

    // fetch sadece ağ kopunca hata fırlatır; 404 ya da 500 gibi cevaplarda ok = false olur, onu elle kontrol ediyoruz
    if (!response.ok) {
      throw new Error('Сервер ответил с ошибкой ' + response.status);
    }

    dishes = await response.json();                     // Cevabın gövdesini JSON'dan JS dizisine çevirir

    renderDishes();                                     // Veri geldi: kartları çiz
  } catch (error) {
    // İstek başarısız: kullanıcı boş sayfa yerine ne olduğunu görsün (bildirim validation.js'te)
    showNotification('Не удалось загрузить меню. ' + error.message);
  }
}

// ----- 5. Sayfa yüklenince çalıştır -----
updateOrder();    // Veri beklenirken de "Ваш заказ" doğru görünsün: "Ничего не выбрано"
loadDishes();     // İsteği gönder; kartlar cevap gelince çizilir
