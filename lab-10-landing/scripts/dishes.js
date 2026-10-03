// Bütün yemekler tek bir dizide (массив) tutuluyor. HTML'de kart yok: sayfa açılınca
// script.js bu diziyi okuyup kartları kendisi üretiyor. Yeni yemek eklemek = buraya bir nesne eklemek.
// ЛР5: her nesneye "kind" eklendi — filtre düğmesindeki data-kind ile aynı değer, süzme buna göre.
// Beş kategori, her birinde 6 yemek; kind dağılımı ödevdeki tabloyla aynı.
const dishes = [
  // ---------- Супы: рыбный 2, мясной 2, вегетарианский 2 ----------
  {
    keyword: 'gazpacho',                 // Latin harfli benzersiz ad: karttaki data-dish ile yemeği burada buluyoruz
    name: 'Гаспачо',                     // Ekranda görünen isim
    price: 195,                          // Sayı olarak tutuyoruz: toplam fiyatı hesaplarken metin toplanamaz
    category: 'soup',                    // Hangi bölüme çizileceğini belirler
    count: '350 г',                      // Ağırlık ya da hacim, olduğu gibi yazılır
    image: 'soups/gazpacho',             // images/ klasörüne göre yol, uzantı script'te ekleniyor
    kind: 'veg'                          // Filtre değeri: düğmedeki data-kind="veg" ile eşleşir
  },
  {
    keyword: 'mushroom-soup',
    name: 'Грибной суп-пюре',
    price: 185,
    category: 'soup',
    count: '330 г',
    image: 'soups/mushroom',
    kind: 'veg'
  },
  {
    keyword: 'norwegian-soup',
    name: 'Норвежский суп',
    price: 270,
    category: 'soup',
    count: '330 г',
    image: 'soups/norwegian',
    kind: 'fish'
  },
  {
    keyword: 'tom-yum',
    name: 'Том ям с креветками',
    price: 650,
    category: 'soup',
    count: '500 г',
    image: 'soups/tom-yum',
    kind: 'fish'
  },
  {
    keyword: 'ramen',
    name: 'Рамен',
    price: 375,
    category: 'soup',
    count: '425 г',
    image: 'soups/ramen',
    kind: 'meat'
  },
  {
    keyword: 'chicken-soup',
    name: 'Куриный суп',
    price: 330,
    category: 'soup',
    count: '350 г',
    image: 'soups/chicken',
    kind: 'meat'
  },

  // ---------- Главные блюда: рыбное 2, мясное 2, вегетарианское 2 ----------
  {
    keyword: 'fried-potatoes',
    name: 'Жареная картошка с грибами',
    price: 150,
    category: 'main-course',
    count: '250 г',
    image: 'main-courses/potatoes',
    kind: 'veg'
  },
  {
    keyword: 'lasagna',
    name: 'Лазанья',
    price: 385,
    category: 'main-course',
    count: '310 г',
    image: 'main-courses/lasagna',
    kind: 'meat'
  },
  {
    keyword: 'chicken-cutlets',
    name: 'Котлеты из курицы с картофельным пюре',
    price: 225,
    category: 'main-course',
    count: '280 г',
    image: 'main-courses/cutlets',
    kind: 'meat'
  },
  {
    keyword: 'fish-cutlet',
    name: 'Рыбная котлета с рисом и спаржей',
    price: 320,
    category: 'main-course',
    count: '270 г',
    image: 'main-courses/fish-cutlet',
    kind: 'fish'
  },
  {
    keyword: 'pizza-margherita',
    name: 'Пицца Маргарита',
    price: 450,
    category: 'main-course',
    count: '470 г',
    image: 'main-courses/pizza',
    kind: 'veg'
  },
  {
    keyword: 'shrimp-pasta',
    name: 'Паста с креветками',
    price: 340,
    category: 'main-course',
    count: '280 г',
    image: 'main-courses/shrimp-pasta',
    kind: 'fish'
  },

  // ---------- Салаты и стартеры: рыбный 1, мясной 1, вегетарианский 4 ----------
  {
    keyword: 'korean-salad',
    name: 'Корейский салат с овощами и яйцом',
    price: 330,
    category: 'salad',
    count: '250 г',
    image: 'salads/korean',
    kind: 'veg'
  },
  {
    keyword: 'caesar-chicken',
    name: 'Цезарь с цыплёнком',
    price: 370,
    category: 'salad',
    count: '220 г',
    image: 'salads/caesar',
    kind: 'meat'
  },
  {
    keyword: 'caprese',
    name: 'Капрезе с моцареллой',
    price: 350,
    category: 'salad',
    count: '235 г',
    image: 'salads/caprese',
    kind: 'veg'
  },
  {
    keyword: 'tuna-salad',
    name: 'Салат с тунцом',
    price: 480,
    category: 'salad',
    count: '250 г',
    image: 'salads/tuna',
    kind: 'fish'
  },
  {
    keyword: 'fries-caesar',
    name: 'Картофель фри с соусом Цезарь',
    price: 280,
    category: 'salad',
    count: '235 г',
    image: 'salads/fries-caesar',
    kind: 'veg'
  },
  {
    keyword: 'fries-ketchup',
    name: 'Картофель фри с кетчупом',
    price: 260,
    category: 'salad',
    count: '235 г',
    image: 'salads/fries-ketchup',
    kind: 'veg'
  },

  // ---------- Напитки: холодный 3, горячий 3 ----------
  {
    keyword: 'orange-juice',
    name: 'Апельсиновый сок',
    price: 120,
    category: 'drink',
    count: '300 мл',
    image: 'drinks/orange',
    kind: 'cold'
  },
  {
    keyword: 'apple-juice',
    name: 'Яблочный сок',
    price: 90,
    category: 'drink',
    count: '300 мл',
    image: 'drinks/apple',
    kind: 'cold'
  },
  {
    keyword: 'carrot-juice',
    name: 'Морковный сок',
    price: 110,
    category: 'drink',
    count: '300 мл',
    image: 'drinks/carrot',
    kind: 'cold'
  },
  {
    keyword: 'cappuccino',
    name: 'Капучино',
    price: 180,
    category: 'drink',
    count: '300 мл',
    image: 'drinks/cappuccino',
    kind: 'hot'
  },
  {
    keyword: 'green-tea',
    name: 'Зелёный чай',
    price: 100,
    category: 'drink',
    count: '300 мл',
    image: 'drinks/green-tea',
    kind: 'hot'
  },
  {
    keyword: 'black-tea',
    name: 'Чёрный чай',
    price: 90,
    category: 'drink',
    count: '300 мл',
    image: 'drinks/black-tea',
    kind: 'hot'
  },

  // ---------- Десерты: маленькая порция 3, средняя 2, большая 1 ----------
  {
    keyword: 'cheesecake',
    name: 'Чизкейк',
    price: 240,
    category: 'dessert',
    count: '125 г',
    image: 'desserts/cheesecake',
    kind: 'small'
  },
  {
    keyword: 'chocolate-cheesecake',
    name: 'Шоколадный чизкейк',
    price: 260,
    category: 'dessert',
    count: '125 г',
    image: 'desserts/chocolate-cheesecake',
    kind: 'small'
  },
  {
    keyword: 'chocolate-cake',
    name: 'Шоколадный торт',
    price: 270,
    category: 'dessert',
    count: '140 г',
    image: 'desserts/chocolate-cake',
    kind: 'small'
  },
  {
    keyword: 'baklava',
    name: 'Пахлава',
    price: 220,
    category: 'dessert',
    count: '300 г',
    image: 'desserts/baklava',
    kind: 'medium'
  },
  {
    keyword: 'donuts-3',
    name: 'Пончики (3 штуки)',
    price: 410,
    category: 'dessert',
    count: '350 г',
    image: 'desserts/donuts-3',
    kind: 'medium'
  },
  {
    keyword: 'donuts-6',
    name: 'Пончики (6 штук)',
    price: 650,
    category: 'dessert',
    count: '700 г',
    image: 'desserts/donuts-6',
    kind: 'large'
  }
];
