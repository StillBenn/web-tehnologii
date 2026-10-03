// Yemek listesini "sunucudan" alan tek yer. ЛР7'deki loadDishes() buraya taşındı, çünkü ЛР8'de
// iki sayfa da («Собрать ланч» ve «Оформить заказ») yemek verisine ihtiyaç duyuyor.
//
// Hocanın API'si kapalı — СДО'daki duyuru: «API для ЛР 7-9 недоступен, делайте через локальное хранилище».
// api/dishes.json, API'nin döndürdüğü JSON'un birebir aynısı. API açılırsa sadece bu adres değişir:
// https://edu.std-900.ist.mospolytech.ru/labs/api/dishes
const API_URL = 'api/dishes.json';

// fetch ile yemek listesini getirir ve diziyi döndürür. Kartları çizmek her sayfanın kendi script'inin işi
async function loadDishes() {
  const response = await fetch(API_URL);   // GET isteği; cevap gelene kadar bekler, sayfa donmaz

  // fetch sadece ağ kopunca hata fırlatır; 404 ya da 500'de ok = false olur, onu elle kontrol ediyoruz
  if (!response.ok) {
    throw new Error('Сервер ответил с ошибкой ' + response.status);
  }

  return response.json();                   // Gövdeyi JSON'dan JS dizisine çevirir
}
