// Bütün yemekler tek bir dizide (массив) tutuluyor. HTML'de artık kart yok: sayfa açılınca
// script.js bu diziyi okuyup kartları kendisi üretiyor. Yeni yemek eklemek = buraya bir nesne eklemek.
// Ödevin şartı: dizi ayrı bir js dosyasında dursun.
const dishes = [
  {
    keyword: 'gazpacho',                 // Latin harfli benzersiz ad: karttaki data-dish ile yemeği burada buluyoruz
    name: 'Гаспачо',                     // Ekranda görünen isim
    price: 195,                          // Sayı olarak tutuyoruz: toplam fiyatı hesaplarken metin toplanamaz
    category: 'soup',                    // Hangi bölüme çizileceğini belirler (soup / main-course / drink)
    count: '350 г',                      // Ağırlık ya da hacim, olduğu gibi yazılır
    image: 'soups/gazpacho'              // images/ klasörüne göre yol, uzantı script'te ekleniyor
  },
  {
    keyword: 'mushroom-soup',
    name: 'Грибной суп-пюре',
    price: 185,
    category: 'soup',
    count: '330 г',
    image: 'soups/mushroom'
  },
  {
    keyword: 'norwegian-soup',
    name: 'Норвежский суп',
    price: 270,
    category: 'soup',
    count: '330 г',
    image: 'soups/norwegian'
  },
  {
    keyword: 'fried-potatoes',
    name: 'Жареная картошка с грибами',
    price: 150,
    category: 'main-course',
    count: '250 г',
    image: 'main-courses/potatoes'
  },
  {
    keyword: 'lasagna',
    name: 'Лазанья',
    price: 385,
    category: 'main-course',
    count: '310 г',
    image: 'main-courses/lasagna'
  },
  {
    keyword: 'chicken-cutlets',
    name: 'Котлеты из курицы с картофельным пюре',
    price: 225,
    category: 'main-course',
    count: '280 г',
    image: 'main-courses/cutlets'
  },
  {
    keyword: 'orange-juice',
    name: 'Апельсиновый сок',
    price: 120,
    category: 'drink',
    count: '300 мл',
    image: 'drinks/orange'
  },
  {
    keyword: 'apple-juice',
    name: 'Яблочный сок',
    price: 90,
    category: 'drink',
    count: '300 мл',
    image: 'drinks/apple'
  },
  {
    keyword: 'carrot-juice',
    name: 'Морковный сок',
    price: 110,
    category: 'drink',
    count: '300 мл',
    image: 'drinks/carrot'
  }
];
