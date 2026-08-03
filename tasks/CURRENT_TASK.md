# Этап 6 — World Expansion, Roaming Pet AI, Upgrade Paths and Economy Rebalance

## Статус

IMPLEMENTED — AWAITING GAME DIRECTOR RE-REVIEW

## Цель

Расширить существующую законченную кампанию до финального системного vertical slice перед визуальным производством: увеличить и осмысленно перераспределить мир, добавить шесть roaming-питомцев с лёгким data-driven AI, расширить базу до 14 питомцев, построить три ветки улучшений и перевести чистое прохождение на утверждённый `balanceRevision: 2` с целевым временем первого прохождения 16–22 минуты.

Существующие восемь heist encounters, их механика кражи/погони, пять основных зон и победа через доставку Дракона должны сохраниться. Новые системы должны расширять текущую архитектуру, а не заменять работающий core loop.

## Объём

- Увеличить мир до `4608 × 3072`, сохранить пять утверждённых зон и добавить шесть различимых roaming-территорий, безопасные маршруты, четыре data-driven shortcut и расширенную базу.
- Добавить шесть стабильных roaming encounters: Прыгун, Енот, Альпака, Хамелеон, Газель и Мини-грифон.
- Реализовать состояния roaming AI, waypoint graphs, лёгкое бегство, stamina/tired/capture loop, stuck/reset fail-safe и снижение частоты offscreen-решений.
- Использовать общую сущность `Pet` после захвата: один активный переносимый питомец, существующий breadcrumb follow, доставка, база, доход и сохранение.
- Добавить data-driven источник питомца `HEIST` / `ROAMING`, общие prerequisites и поддержку 14 раздельных base slots.
- Утвердить и реализовать `balanceRevision: 2`: новые доходы восьми core pets, шести roaming pets, цены зон и пяти дополнительных upgrades без самовольной корректировки значений.
- Создать три физические станции: Mobility, Tracking и Stealth; реализовать Tracker, Lure, Fast Dash, Runner Shoes, Double Dash и Quiet Shoes через типизированные `effects[]`.
- Добавить требования по числу roaming pets к gates/upgrades и сохранить уже открытый прогресс мигрированных save через grandfathering.
- Мигрировать `saveVersion: 2` в `saveVersion: 3`, безопасно восстанавливать факты мира и не сохранять транзиентное AI/active-carry состояние.
- Сохранить победу через Дракона, сделать счёт коллекции динамическим `x/14`, поддержать старые завершённые save и отдельное завершение коллекции после победы.
- Добавить честный `?playtest=1` режим с milestone telemetry и экспортируемым отчётом без cheats или изменения gameplay.
- Расширить dev-only инструменты для AI, prerequisites, roaming deliveries и `balanceRevision`.
- Добавить unit tests экономики, roaming AI, prerequisites/effects, progression и миграции save.
- Создать `docs/BALANCE_MODEL.md`, обновить фактическую проектную документацию и итоговый отчёт.

## Критерии готовности

- [x] Мир имеет размер `4608 × 3072`, читаемые пять зон, шесть roaming-территорий, расширенную базу и доступные маршруты без лабиринтов.
- [x] Четыре shortcut открываются только из фактов доставленных питомцев и не обходят исходные платные gates.
- [x] Шесть roaming pets имеют утверждённые ids, зоны, редкости, доходы, отдельные безопасные waypoint graphs и data-driven behavior profiles.
- [x] Roaming AI покрывает idle/wander/alert/flee/tired/follow/base, не использует navmesh и имеет безопасный reset при застревании/выходе из территории.
- [x] Захват доступен только в tired window; один активный питомец блокирует остальные theft/capture/gate/upgrade interactions.
- [x] После захвата питомец следует по PlayerPathHistory, доставляется существующим core loop и восстанавливается на базе после reload.
- [x] На базе видимы до 14 питомцев, roaming pen показывает прогресс `0/6…6/6`, станции и питомцы не накладываются.
- [x] Экономика точно соответствует `balanceRevision: 2`; итог core income `95`, roaming `12`, общий `107`.
- [x] PARK/HUB/RICH/VIP и все upgrades используют общую prerequisite model и утверждённые цены/условия.
- [x] Tracker, Lure, Runner Shoes и Quiet Shoes дают только утверждённые эффекты; Fast/Double Dash сохраняют утверждённое поведение.
- [x] Save v3 валидируется, повреждённый save безопасно отвергается, v2 мигрирует без потери прогресса и с grandfathered zones/upgrades.
- [x] Старый completed save остаётся победой при `8/14`; чистая новая победа требует фактически открыть VIP через шесть roaming pets и даёт `14/14`.
- [x] Progression/objectives/navigation ведут игрока по новой кампании без hardcoded switch на каждый питомец.
- [x] `?playtest=1` не меняет игру, собирает утверждённые milestones и формирует обезличенный отчёт; dev run явно помечается невалидным для времени.
- [x] Unit tests покрывают AI, суммы дохода, prerequisites/effects, progression, reload без дублей и v2→v3 migration.
- [x] Desktop/mobile interactions, восемь heists, шесть roaming captures, gates, stations, shortcuts, victory/reload и performance проходят runtime QA доступными средствами.
- [x] `npm run typecheck`, `npm run test`, `npm run build`, `npm run preview` и `git diff --check` проходят.
- [x] Документация и `tasks/LAST_REPORT.md` соответствуют фактической реализации.

## Ограничения

- Не начинать визуальный vertical slice или следующий этап.
- Не создавать production sprites, финальные brainrot-дизайны, audio или Yandex SDK.
- Не менять утверждённые цены, доходы, скорости heist encounters, механику кражи/погони и условия победы.
- Не удалять и не переименовывать пять существующих `ZoneId`; новые территории являются подзонами.
- Не применять navmesh, procedural generation, сложный stealth/combat/inventory и тяжёлые AI/framework решения.
- Не хранить в save текущую stamina, waypoint, active pet, pursuers, dash charges, tracker target или UI state.
- Не выдавать dev/cheat прохождение за честный normal run и не использовать прежний результат `1:06`.
- Не переписывать работающие системы без необходимости и не начинать следующий этап самостоятельно.
