// Ödevin şartı: çizim script'i dizi dosyasından ayrı dursun. dishes.js önce yüklendiği için
// buradaki kod "dishes" dizisini doğrudan görüyor.

// Kullanıcının seçtiği yemekler. Başta hiçbiri seçili değil (null = boş).
// Anahtarlar dizideki category değerleriyle aynı: böylece yemeğin kategorisiyle doğrudan buraya yazabiliyoruz.
const order = {
  'soup': null,
  'main-course': null,
  'drink': null
};

// ----- 1. Yemekleri sayfaya çizme -----

// Bir yemek nesnesinden kart (div.dish) üretir. HTML'deki eski statik kartla birebir aynı yapı:
// img, fiyat, isim, ağırlık, düğme. Yapı aynı olunca ЛР2'nin CSS'i değişmeden çalışıyor.
function createDishCard(dish) {
  const card = document.createElement('div');   // Boş bir div oluşturur; henüz sayfada değil
  card.classList.add('dish');                    // ЛР2'deki stiller .dish sınıfına bağlı
  card.dataset.dish = dish.keyword;              // data-dish="gazpacho": tıklayınca yemeği dizide bununla buluyoruz

  const image = document.createElement('img');
  image.src = 'images/' + dish.image + '.jpg';  // Nesnedeki 'soups/gazpacho' → images/soups/gazpacho.jpg
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

  // Kartın herhangi bir yerine tıklayınca yemek seçilir (ödev: "при клике на карточку")
  card.addEventListener('click', function () {
    selectDish(dish);
  });

  return card;
}

// Her kategori için: diziyi süz → alfabetik sırala → kartları üret → ilgili bölüme ekle
function renderDishes() {
  const sections = document.querySelectorAll('.dishes');   // lunch.html'deki üç boş kapsayıcı

  sections.forEach(function (section) {
    const category = section.dataset.category;             // data-category="soup" → 'soup'

    const list = dishes
      .filter(function (dish) { return dish.category === category; })  // Sadece bu bölümün yemekleri
      .sort(function (a, b) { return a.name.localeCompare(b.name); });  // Alfabetik; localeCompare Kiril'i doğru sıralar

    list.forEach(function (dish) {
      section.append(createDishCard(dish));                // Kartı sayfaya (DOM'a) ekler, artık görünür
    });
  });
}

// ----- 2. Yemek seçme ve "Ваш заказ" bloğu -----

// Tıklanan yemeği kendi kategorisine yazar; aynı kategoriden ikinci seçim öncekinin yerine geçer
function selectDish(dish) {
  order[dish.category] = dish;
  updateOrder();
}

// "Ваш заказ" bloğunu order nesnesine göre baştan çizer. Tek bir yerde karar veriliyor:
// ne gösterilir, ne gizlenir, toplam kaç. Sayfa açılırken de bir kez çağrılıyor.
function updateOrder() {
  const nothing = document.querySelector('.nothing');         // "Ничего не выбрано" satırı
  const totalBlock = document.querySelector('.total');        // "Стоимость заказа" bloğu
  const chosenBlocks = document.querySelectorAll('.chosen[data-category]'); // Суп / Главное блюдо / Напиток

  // En az bir yemek seçilmiş mi? Object.values → [null, null, dish] gibi; some → biri null değilse true
  const anySelected = Object.values(order).some(function (dish) { return dish !== null; });

  // Hiç seçim yoksa: sadece "Ничего не выбрано" görünür, kategori satırları ve toplam gizli (maket 3)
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
      // Bu kategoride seçim yok ama başka kategoride var: ödevdeki iki farklı mesaj
      line.textContent = block.dataset.empty;                  // "Блюдо не выбрано" / "Напиток не выбран" HTML'de duruyor
    }

    // Formla birlikte giden gizli alan: seçili yemeğin keyword'ü, yoksa boş
    const hiddenInput = document.querySelector('input[name="' + category + '"]');
    hiddenInput.value = dish ? dish.keyword : '';
  });

  totalBlock.querySelector('.chosen-price').textContent = total + '₽';
}

// ----- 3. Sayfa yüklenince çalıştır -----
renderDishes();   // Kartları üret
updateOrder();    // Başlangıç durumu: "Ничего не выбрано", diğer bloklar gizli
