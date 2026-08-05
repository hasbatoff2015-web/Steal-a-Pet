# Манифест визуальных ассетов

## Источник истины

Runtime-манифест находится в `src/game/assets/assetManifest.ts`. Он связывает стабильные игровые id с texture key, публичным PNG-путём, экранным размером, origin, offset, допустимостью отражения и prototype fallback. Загрузка выполняется централизованно из `WorldScene.preload()`.

## Подключённые группы

- Игрок: `player_world.png`.
- Питомцы: все 14 игровых id — Собака, Кот, Лиса, Павлин, Панда, два VIP-питомца, Дракон и шесть roaming-питомцев.
- NPC: владельцы Собака/Кот/Лиса/Павлин/Панда, два VIP-владельца, босс Дракона, Rich guard и общий VIP guard.
- Здания: дом игрока, starter house, park pavilion, hub building, rich estate и VIP palace.
- Интерактивные объекты: единый pet pen, delivery pad, одна переиспользуемая station texture и одна universal gate texture.
- Декор: дерево, куст, фонарь, лавочка, фонтан, автомобиль и табличка.

Фактическое имя файла станции в поставке — `public/assets/world/interactive/update_station.png`; manifest сохраняет логический id `upgrade-station`.

## Осознанное переиспользование

- `pet_pen.png` используется один раз как общий большой загон для всех 14 сохранённых слотов базы.
- `update_station.png` используется для трёх веток улучшений с различными tint.
- `universal_gate.png` используется для PARK, CENTRAL HUB, RICH DISTRICT и VIP ESTATE с tint/rotation.
- `guard_vip.png` используется обеими VIP-ролями охраны.
- Здания и декор могут отражаться, масштабироваться или тонироваться только если это разрешено manifest.

## Отсутствующие файлы и fallback

В переданном наборе отсутствуют `bridge.png`, `fence_segment.png` и `security_booth.png`. Для них сохранена существующая процедурная Phaser-графика. В development режиме отсутствие отмечается одним предупреждением на asset id; production runtime не падает и не показывает ошибку игроку. При добавлении файлов достаточно указать путь в manifest — gameplay-код и collision geometry менять не требуется.

## Инварианты

- PNG лежат только в `public/assets/`; manifest не дублирует бинарные файлы.
- Визуальный origin привязан к нижней опорной точке изображения, а игровой physics body остаётся прежним.
- Замена изображения не меняет координаты, размеры коллизий, navigation blockers, encounter routes, экономику или save id.
- Новый asset регистрируется в manifest; прямое размножение строковых путей по игровым классам запрещено.
