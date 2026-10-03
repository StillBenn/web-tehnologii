// ЛР6'dan: siparişin geçerli bir kombo olup olmadığını kontrol eder ve bildirim gösterir.
// ЛР8: form başka sayfaya taşındığı için submit dinleyicisi buradan order.js'e geçti. Bu dosyada sadece
// iki sayfanın ortak kullandığı kontrol kaldı; sipariş nesnesi artık parametre olarak geliyor.

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
function selectedCategories(order) {
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
function validateOrder(order) {
  const selected = selectedCategories(order);
  const hasSoup = selected.includes('soup');
  const hasMain = selected.includes('main-course');
  const hasSalad = selected.includes('salad');
  const hasDrink = selected.includes('drink');
  const hasDessert = order['dessert'] !== null;

  if (selected.length === 0 && !hasDessert) {
    return 'Ничего не выбрано. Выберите блюда для заказа';   // hiçbir yemek eklenmemiş
  }

  if (matchesCombo(selected)) {
    return null;                                              // geçerli kombo
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

// Bildirimi sıfırdan oluşturup sayfaya ekler (ЛР6: her seferinde dinamik olarak yaratılır).
// ЛР8'de hata ve başarı mesajları da bununla gösteriliyor
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
