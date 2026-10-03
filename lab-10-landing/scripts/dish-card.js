// Bir yemek nesnesinden kart (div.dish) üretir. ЛР8'de iki sayfa kullanıyor: «Собрать ланч»da düğme
// «Добавить», «Оформить заказ»da «Удалить» (ödev: kart görünümü aynı, sadece düğme farklı).
// Tıklayınca ne olacağını kartı kullanan sayfa belirliyor; burada sadece görünüm var.
function createDishCard(dish, buttonText) {
  const card = document.createElement('div');   // Boş bir div oluşturur; henüz sayfada değil
  card.classList.add('dish');                    // ЛР2'deki stiller .dish sınıfına bağlı
  card.dataset.dish = dish.keyword;              // data-dish="gazpacho": tıklayınca yemeği dizide bununla buluyoruz

  const image = document.createElement('img');
  image.src = dish.image;                        // JSON'da yol tam geliyor: 'images/soups/gazpacho.jpg'
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
  button.textContent = buttonText;

  card.append(image, price, name, weight, button); // Parçaları karta bu sırayla ekler (sıra maketle aynı)
  return card;
}
