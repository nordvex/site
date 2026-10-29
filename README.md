# ДворОнлайн — демо-лендинг

Статический прототип сервиса распознавания свободных парковочных мест во дворах (YOLO + камеры).
Один экран: чистый HTML, CSS и JavaScript, без сборки и зависимостей.

## Запуск

```bash
cd /home/blake/projects/dvoronline
python3 -m http.server 8080
```

Откройте http://localhost:8080

Важно: открывать через сервер, а не двойным кликом по `index.html` — иначе карта и шрифты могут не загрузиться из-за file://.

## Структура

```
index.html                  разметка всех секций
assets/css/fonts.css        локальные @font-face Manrope
assets/css/style.css        все стили (токены, секции, адаптив)
assets/js/data.js           демо-дворы для карты
assets/js/map.js            Leaflet: маркеры, фильтры, список
assets/js/main.js           меню, модалки, тарифы, демо YOLO, формы, анимации
assets/fonts/               Manrope 400–800 (woff2, SIL OFL)
assets/vendor/leaflet/      Leaflet 1.9.4 (BSD-2)
assets/img/favicon.svg      иконка
```

## Что сейчас является заглушкой

- Камеры не подключены: счётчики показывают 0, статус — «Пилот · 2026».
- Точность 96–99% — **целевая**, замеров ещё не было.
- Периодичность обновления не определена — в интерфейсе стоит «в пилоте».
- Карта и 7 дворов — вымышленные демо-данные (см. `data.js`), в секции есть пометка «демо-карта».
- Отзывы, тарифы, юридические тексты, контакты и формы — заглушки. Формы ничего не отправляют.
- Кнопки «Войти», «Выбрать тариф» открывают модалки-заглушки.

## Что заменить перед запуском

1. **Контакты** — `index.html`, секция `#contacts` и футер: email, Telegram, адрес.
2. **Тарифы** — блок `.plans`: цены в `data-price-month` / `data-price-year`, состав услуг.
3. **Юридические тексты** — объект `MODAL_CONTENT` в `assets/js/main.js`.
4. **Дворы** — `assets/js/data.js`: id, адрес, district, координаты, total/free.
5. **Метрики** — `dl.stats-row` в `index.html`.
6. **Отзывы** — секция `#reviews` (сейчас примеры, не реальные отзывы).
7. **Карта** — при публикации включите атрибуцию тайлов (сейчас `attributionControl:false` только для демо) и проверьте условия использования Esri/OSM.

## Хостинг на своём компьютере + Cloudflare

### Вариант 1. Временная ссылка (5 минут, без аккаунта)

```bash
cd /home/blake/projects/dvoronline
python3 -m http.server 8080
```

Во втором терминале:

```bash
# если cloudflared ещё не установлен:
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
  -o ~/.local/bin/cloudflared && chmod +x ~/.local/bin/cloudflared

cloudflared tunnel --url http://localhost:8080
```

В выводе появится ссылка вида `https://random-words.trycloudflare.com`.
Она живёт, пока запущены оба процесса. Компьютер должен быть включён, интернет — стабилен.

### Вариант 2. Постоянный домен

1. Добавьте домен в Cloudflare и переключите NS.
2. `cloudflared tunnel login`
3. `cloudflared tunnel create dvoronline`
4. `cloudflared tunnel route dns dvoronline dvoronline.ru`
5. Создайте `~/.cloudflared/config.yml`:

```yaml
tunnel: <UUID-из-шага-3>
credentials-file: /home/blake/.cloudflared/<UUID>.json
ingress:
  - hostname: dvoronline.ru
    service: http://localhost:8080
  - service: http_status:404
```

6. `cloudflared tunnel run dvoronline`
7. Автозапуск: `sudo cloudflared service install`

### Вариант 3. Без своего компьютера

Сайт полностью статический — его можно бесплатно положить на Cloudflare Pages:

```bash
npx wrangler pages deploy . --project-name dvoronline
```

Или загрузить папку через панель Cloudflare Pages (Direct Upload). Тогда ПК может быть выключен.

## Лицензии

- Manrope — SIL Open Font License 1.1.
- Leaflet — BSD-2-Clause.
- Тайлы карты — Esri (для демо); для продакшена нужна своя лицензия/атрибуция.
- Тексты и графика интерфейса — оригинальные, написаны для этого проекта.