# Последний выполненный этап

## Что сделано

Завершён Этап 6 — World Expansion, Roaming Pet AI, Upgrade Paths and Economy Rebalance.

- Мир расширен с `3840 × 2560` до `4608 × 3072`; добавлены внешний маршрут, шесть именованных roaming-территорий и дополнительные prototype-слои без world-sized texture.
- Сохранены пять основных ZoneId и восемь heist encounters. Скорости владельцев, catch distance, dash speed/duration и основная механика кражи/погони не менялись.
- Добавлены шесть roaming pets со стабильными ids `roam-01…06`, source type ROAMING, утверждёнными зонами/редкостями/доходом и различимыми prototype silhouettes.
- Реализован лёгкий AI: IDLE/WANDERING/ALERT/FLEEING/TIRED/FOLLOWING/AT_PLAYER_BASE, безопасные waypoint graphs, выбор связанной цели дальше от игрока, stamina, tired capture window, recovery, territory/stuck reset и throttled offscreen update.
- Захваченный roaming pet переходит в общий `Pet`, использует существующий `PlayerPathHistory`, delivery/base/economy/save pipeline. Одновременно активен только один heist/capture; остальные interactions блокируются.
- База расширена до 14 раздельных slots. Добавлен roaming-загон на шесть мест с dirty label `x/6` и три physical upgrade stations.
- Добавлены четыре derived shortcuts: после Кота, Лисы, пары Павлин+Панда и пары VIP A+VIP B. Отдельные save flags не используются; первичные платные gates не обходятся.
- Введён `balanceRevision: 2` со всеми утверждёнными доходами, ценами зон и upgrades. Итоговые суммы: core `95/сек`, roaming `12/сек`, коллекция `107/сек`.
- Upgrade definitions переведены на типизированные `effects[]`. Реализованы Трекер питомцев, Улучшенная приманка, Быстрый рывок, Беговые кроссовки, Двойной рывок и Тихие кроссовки.
- Общий prerequisite evaluator поддерживает required pets, zones, upgrades и roaming count; его используют gates и upgrades.
- Трекер показывает приблизительное восьминаправленное направление к ближайшему доступному roaming pet, скрывается при active carry и не ведёт в закрытую зону.
- Quiet Shoes применяет data-driven bonuses при старте encounter: head start `+200 мс`, pursuer activation delay `+300 мс`; скорости/catch distance не меняются.
- Save переведён на v3. Реализованы v2→v3 migration, v1 chain, `balanceRevision`, grandfathered zones/upgrades, строгая validation, сохранение milestone/run counters и восстановление мира/дохода из definitions.
- Старый completed save остаётся победой при `8/14`. Чистая новая кампания приходит к Дракону через шесть roaming pets; Victory Overlay показывает динамический `x/14`. Последний roaming pet после старой победы даёт «КОЛЛЕКЦИЯ ЗАВЕРШЕНА!» без второго overlay.
- Добавлен честный `?playtest=1`: compact snapshot ≤4 Hz, 18 one-shot milestones и копируемый обезличенный отчёт. Existing-save run помечается TIME INVALID; `?dev=1` начинается с `DEV RUN — TIME INVALID`.
- Dev tools расширены переходами к roaming pets, force tired/reset, delivery/precondition controls и snapshot AI/balance state.

## Изменённые/созданные файлы

Основные новые файлы:

- `docs/BALANCE_MODEL.md`;
- `src/game/data/prerequisites.ts`;
- `src/game/data/roamingPets.ts`;
- `src/game/data/shortcuts.ts`;
- `src/game/systems/RoamingAiModel.ts`;
- `src/game/systems/RoamingPetController.ts`;
- `src/game/systems/RoamingPetSystem.ts`;
- `src/game/systems/PetTrackerSystem.ts`;
- `src/game/systems/PlaytestSystem.ts`;
- `src/game/world/ProgressShortcut.ts`;
- `tests/economy-balance.test.ts`;
- `tests/roaming-ai.test.ts`.

Существенно обновлены:

- `src/game/data/pets.ts`, `upgrades.ts`, `zones.ts`, `worldLayout.ts`;
- `src/game/entities/Player.ts`, `Pet.ts`;
- `src/game/systems/CoreLoopSystem.ts`, `ProgressionSystem.ts`, `UpgradeSystem.ts`, `SaveSystem.ts`, `RunStatsSystem.ts`, `PetEncounter.ts`, `ZoneGateSystem.ts`;
- `src/game/scenes/WorldScene.ts`;
- `src/game/world/WorldBuilder.ts`, `UpgradeStation.ts`-compatible station flow;
- `src/game/ui/VictoryOverlay.ts`, prototype textures и DeveloperTools;
- unit tests prerequisites/progression/save/run stats;
- `README.md`, `docs/GAME_DESIGN.md`, `MAP.md`, `ECONOMY.md`, `TECH_ARCHITECTURE.md`, `ASSET_PLAN.md`, `DEVELOPMENT_LOG.md`;
- `tasks/CURRENT_TASK.md`, `tasks/LAST_REPORT.md`.

## Технические решения

- `PetDefinition.sourceType` различает HEIST/ROAMING, но после capture сущность и downstream-системы общие.
- Roaming state transition/stamina logic вынесена в pure `RoamingAiModel`; Phaser movement/render находится в controller.
- Waypoints — данные, а не Phaser objects. Каждый graph содержит 7–10 узлов, только соседние безопасные связи; решения принимаются по interval, движение остаётся delta-based.
- Offscreen roaming update выполняется примерно 3.3 раза/сек. Cached waypoint maps и cached upgrade effect arrays устраняют ненужные per-frame allocations.
- `UpgradeSystem` кэширует effect values при покупке; Player не проверяет upgrade ids в update.
- Runner `×1.10` применяется только к обычной скорости. Существующий pet catch-up быстрее новой скорости игрока, поэтому breadcrumb following сохраняет запас.
- Shortcuts выводятся из delivered facts и поэтому автоматически восстанавливаются после reload без расширения save schema.
- v3 migration grandfathering разрешает только уже существующие факты старого save; новые покупки/зоны проходят revision-2 prerequisites.
- Income не сохраняется числом: все sources восстанавливаются из delivered ids и актуальных definitions, исключая дубли.
- World static art остаётся prototype Graphics/маленькими generated textures; одна текстура `4608 × 3072` не создаётся.

## Проверки

### Автоматические

- `npm run typecheck` — успешно.
- `npm test` — успешно: 8 test files, 26 tests.
- `npm run build` — успешно: 48 modules, production JS около 1.54 MB / gzip около 402 KB.
- `npm run preview -- --host 127.0.0.1` — Vite preview успешно запустился на `127.0.0.1:4173`; процесс остановлен по контрольному timeout.
- `git diff --check` — успешно; остаются только информационные Windows LF→CRLF warnings.
- Проверены unit-сценарии waypoint neighbor/flee choice, stamina/tired/recovery/capture/delivery, точные income checkpoints, отсутствие duplicate income source, thresholds gates/upgrades, typed effects, campaign stages, строгий v3 save, v2 migration/grandfathering и completed `8/14` compatibility.

### Функциональный QA

- Статически проверены единый active-pet arbitration, touch interaction path, breadcrumb follow, delivery, income restore, shortcut derivation, station branches, Tracker zone filtering, Quiet encounter modifiers, dynamic victory count и post-victory collection.
- Production/dev server startup подтверждён.
- Полноценную интерактивную браузерную сессию и console capture выполнить не удалось: локальный URL был отклонён политикой встроенного browser-control окружения. Это ограничение инструмента, а не обнаруженная runtime-ошибка игры.
- Поэтому физическое прохождение всех 8 heists + 6 roaming captures, ручная проверка mobile 320/360/390/430 и landscape 844×430, субъективная читаемость subareas и FPS при `14/14` требуют ручного Game Director QA.

### Normal run

`REAL NORMAL-RUN TIME NOT MEASURED`.

Результат `1:06` не использовался. Таблица observed normal runs в `docs/BALANCE_MODEL.md` оставлена пустой до честного прохождения с чистого save без dev/teleports/add money/forced delivery.

## Остались проблемы

- Vite предупреждает о production chunk больше 500 KB; основная причина — Phaser bundle. Это не ошибка build и не блокирует статическую публикацию, но размер следует учитывать перед релизом.
- Нужен ручной runtime/mobile/performance pass на реальном браузере и устройстве, особенно для длинных маршрутов roaming AI, взаимного расположения новых prototype-territories, трёх stations, tracker indicator и Victory Overlay с третьей кнопкой.
- Фактическое время clean campaign и ощущение утверждённых ожиданий 25/40/67/80 секунд не измерены; баланс не менялся.
- Prototype coordinates, силуэты и декоративная плотность требуют визуального review перед production art.

## Требуется решение Game Director

- Принять или скорректировать prototype layout шести subareas и расположение roaming-загон/трёх stations после ручного просмотра.
- Провести честный `?playtest=1` run и решить, попадает ли revision 2 в целевые 16–22 минуты без изменения утверждённых значений до получения измерения.
- Утвердить финальные brainrot-концепты/имена `vip-a`, `vip-b`, `roam-01…06` перед визуальным этапом.

## Предложения Codex

- Перед стартом visual vertical slice выполнить один desktop и один mobile clean run с копированием playtest report; сначала проверять активность между покупками, а не менять цены по субъективному ожиданию без milestone данных.
- На визуальном этапе сохранить stable PetId/visualKey separation и общий roaming state indicator set, чтобы 14 production pets не потребовали изменения gameplay-кода.
