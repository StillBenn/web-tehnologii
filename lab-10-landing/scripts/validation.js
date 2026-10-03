// ЛР6: form gönderilirken siparişin geçerli bir kombo olup olmadığını kontrol eder,
// değilse gönderimi durdurup eksik yemeği söyleyen bir bildirim gösterir.
// script.js'teki "order" nesnesini okuyor; o yüzden bu dosya ondan sonra yükleniyor.

// Sipariş edilebilecek kombolar — sayfadaki «Доступные для заказа комбо» bloğuyla birebir aynı.
// Tatlı burada yok: herhangi bir komboya eklenebilir, kontrolü etkilemez.
const LUNCH_COMBOS = [
  ['soup', 'main-course', 'salad', 'drink'],
  ['soup', 'main-course', 'drink'],
  ['soup', 'salad', 'drink'],
  ['main-course', 'salad', 'drink'],
  ['main-course', 'drink']
];

// Seçilen kategorilerin listesi, örn. ['soup', 'drink']. Tatlı ayrı ele alındığı için dışarıda.
function selectedCategories() {
  return Object.keys(order).filter(function (category) {
    return order[category] !== null && category !== 'dessert';
  });
}

// Seçim bir komboya birebir uyuyor mu? Uzunluklar eşit ve kombodaki her kategori seçilmiş olmalı
function matchesCombo(selected) {
  return LUNCH_COMBOS.some(function (combo) {
    return combo.length === selected.length &&
      combo.every(function (category) { return selected.includes(category); });
  });
}

// Ödevdeki tabloya göre uyarı metnini seçer; sipariş geçerliyse null döner.
// Sıra önemli: önce "hiç seçim yok", sonra "geçerli", sonra eksiklere göre özel mesajlar.
function validateOrder() {
  const selected = selectedCategories();
  const hasSoup = selected.includes('soup');
  const hasMain = selected.includes('main-course');
  const hasSalad = selected.includes('salad');
  const hasDrink = selected.includes('drink');
  const hasDessert = order['dessert'] !== null;

  if (selected.length === 0 && !hasDessert) {
    return 'Ничего не выбрано. Выберите блюда для заказа';   // hiçbir yemek eklenmemiş
  }

  if (matchesCombo(selected)) {
    return null;                                              // geçerli kombo, form gidebilir
  }

  if (hasSoup && !hasMain && !hasSalad) {
    return 'Выберите главное блюдо/салат/стартер';            // çorba var, yanına ana yemek ya da salata yok
  }

  if (hasSalad && !hasSoup && !hasMain) {
    return 'Выберите суп или главное блюдо';                  // salata var, çorba ya da ana yemek yok
  }

  if (!hasSoup && !hasMain && !hasSalad) {
    return 'Выберите главное блюдо';                          // sadece içecek ve/veya tatlı seçilmiş
  }

  if (!hasDrink) {
    return 'Выберите напиток';                                // yemekler tamam, içecek eksik
  }

  return 'Выберите главное блюдо';                            // kalan tek durum: çorba + salata + içecek dışı bileşimler
}

// Bildirimi sıfırdan oluşturup sayfaya ekler (ödev: her seferinde dinamik olarak yaratılacak)
function showNotification(message) {
  const box = document.createElement('div');
  box.classList.add('notification');            // CSS: position fixed, ortalı, z-index ile en üstte

  const text = document.createElement('p');
  text.textContent = message;

  const button = document.createElement('button');
  button.type = 'button';                       // form içinde değil ama yine de submit sayılmasın
  button.textContent = 'Окей 👌';               // makettekiyle aynı emoji

  // Düğmeye basınca kutu hem görünmez olur hem DOM'dan silinir (ödev: "исчезает и удаляется")
  button.addEventListener('click', function () {
    box.remove();
  });

  box.append(text, button);
  document.body.append(box);                    // body'nin sonuna: fixed olduğu için yeri önemli değil
}

// Form gönderilirken çalışır. Geçersizse preventDefault gönderimi durdurur, bildirim çıkar.
const orderForm = document.querySelector('.order form');

orderForm.addEventListener('submit', function (event) {
  const message = validateOrder();

  if (message !== null) {
    event.preventDefault();                     // tarayıcının varsayılan işi (formu göndermek) iptal
    showNotification(message);
  }
  // message null ise hiçbir şey yapmıyoruz: form normal şekilde httpbin'e gidiyor
});
