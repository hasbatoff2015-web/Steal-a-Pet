# Последний выполненный этап

Этап 4 — Rich District, Multiple Pursuers and Double Dash.

## Что сделано

- RICH DISTRICT стал четвёртой полноценной зоной с physical gate за 200 монет. Gate использует data-driven prerequisites: CENTRAL HUB, доставленная Лиса и купленный Fast Dash.
- Создан светлый богатый prototype-район с главным бульваром, фонарями, автомобилями, клумбами, изгородями и двумя визуально разными estate.
- Estate A содержит Павлина `RARE` с отдельным веерообразным силуэтом, круговой площадкой и фонтаном. Доход — `+10/сек`.
- Estate B содержит Панду `RARE` с чёрно-белым округлым силуэтом, особняком, бассейном, будкой охраны и несколькими открытыми направлениями выхода. Доход — `+14/сек`.
- Павлина и Панду можно доставить в любом порядке. Objective и markers выводятся из фактически доставленных питомцев; одновременно активна только одна кража.
- Encounter-модель расширена до `pursuers[]`. Dog, Cat, Fox и Peacock используют одного pursuer, Panda — владельца и охранника.
- Panda owner запускается сразу, guard — через 800 мс. При активации показывается «СРАБОТАЛА СИГНАЛИЗАЦИЯ!» и короткая красная вспышка.
- Поимка любым активным pursuer обрабатывается один раз: Панда возвращается, pending alarm отменяется, оба NPC прекращают chase и независимо возвращаются домой.
- База поддерживает пять slots в два ряда. Все питомцы остаются видимыми и дают суммарный доход `+32/сек`.
- Станция базы поддерживает последовательность Fast Dash → ожидание RICH DISTRICT → Double Dash → все доступные upgrades куплены.
- «Двойной рывок» стоит 250 монет и задаёт `MaxDashCharges = 2`; cooldown Fast Dash остаётся 650 мс, скорость и длительность dash не менялись.
- Desktop HUD показывает 1–2 dash segments, mobile-кнопка — `current/max` и quantized recharge ring.
- VIP ESTATE остаётся неинтерактивным preview. После Double Dash подпись меняется на «ФИНАЛЬНАЯ ЗОНА · СКОРО»; active marker не создаётся.
- Добавлен Vitest 4.1.10 и targeted test suite чистой логики.

## Изменённые/созданные файлы

Созданы:

- `src/game/systems/DashChargeController.ts`
- `src/game/world/VipEstatePreview.ts`
- `tests/dash-charges.test.ts`
- `tests/gate-prerequisites.test.ts`
- `tests/progression.test.ts`
- `tests/save-validation.test.ts`
- `tests/upgrade-prerequisites.test.ts`

Изменены:

- `package.json`, `package-lock.json`, `tsconfig.json`
- `src/game/data/encounters.ts`
- `src/game/data/pets.ts`
- `src/game/data/upgrades.ts`
- `src/game/data/worldLayout.ts`
- `src/game/data/zones.ts`
- `src/game/entities/Pet.ts`
- `src/game/entities/OwnerNpc.ts`
- `src/game/entities/Player.ts`
- `src/game/input/InputController.ts`
- `src/game/input/VirtualControls.ts`
- `src/game/scenes/WorldScene.ts`
- `src/game/systems/CoreLoopSystem.ts`
- `src/game/systems/PetEncounter.ts`
- `src/game/systems/ProgressionSystem.ts`
- `src/game/systems/SaveSystem.ts`
- `src/game/systems/UpgradeSystem.ts`
- `src/game/systems/ZoneGateSystem.ts`
- `src/game/ui/Hud.ts`
- `src/game/utils/DeveloperTools.ts`
- `src/game/utils/createPrototypeTextures.ts`
- `src/game/world/UpgradeStation.ts`
- `src/game/world/WorldBuilder.ts`
- `src/game/world/ZoneGate.ts`
- `README.md`
- `docs/GAME_DESIGN.md`
- `docs/MAP.md`
- `docs/ECONOMY.md`
- `docs/TECH_ARCHITECTURE.md`
- `docs/DEVELOPMENT_LOG.md`
- `tasks/CURRENT_TASK.md`
- `tasks/LAST_REPORT.md`

## Технические решения

- `PetEncounterDefinition` теперь содержит `pursuers[]`. Каждый pursuer имеет собственные home, visual key, chase parameters, `activationDelayMs` и `returnRoutes`; отдельный Panda-specific core loop не создавался.
- Delayed guard activation хранится как timestamp и проверяется в `PetEncounter.update`. Phaser `delayedCall` не используется, поэтому fail/delivery/reload не оставляют живой callback.
- Active theft очищается централизованно в `CoreLoopSystem`; gates, другие кражи и station interactions недоступны, пока активен encounter.
- После fail/delivery `PetEncounter` отключает pending activation и вызывает return для всех pursuers. Повторная кража разрешается только после `arePursuersReady()` и общего grace period.
- Существующие return routes и fail-safe `1,8 с stuck / 30 с max` сохранены для каждого `OwnerNpc`. У Panda owner и guard независимые маршруты и home positions.
- Rich progression не кодирует два порядка отдельными states. `getRichPetDeliveryCount()` и missing pet выводятся из `deliveredPetIds`.
- `ZoneGateDefinition` поддерживает `requiredPetIds`, `requiredUpgradeIds` и `requiredZones`; общий helper используется runtime и тестами.
- `UpgradeDefinition` поддерживает prerequisites и эффекты `DashCooldownMs`/`MaxDashCharges`. `UpgradeSystem` остаётся единственным источником постоянных эффектов.
- `DashChargeController` хранит только runtime charge state. Player получает параметры через `UpgradeEffectTarget`, а не проверяет purchase id.
- Save остаётся v2: Rich zone, Peacock/Panda и Double Dash представлены существующими массивами. Transient theft, charges, pursuers и alarm не сохраняются.
- Save validation требует логически согласованные zone/pet/upgrade facts; корректный Stage 3 v2 save остаётся валидным.
- Повторяющиеся Rich decoration используют generated textures (`rich-hedge`, `rich-lamp`, `rich-car`, `rich-flowerbed`), а интерактивные объекты и collision geometry остаются отдельными.
- Начальный depth idle pursuers устанавливается в конструкторе `OwnerNpc`, поэтому владельцы и guard видимы до первой погони и не скрываются под ground layers.

## Проверки

Команды:

- `npm run typecheck` — успешно.
- `npm run test` — успешно: 5 файлов, 11 тестов.
- `npm run build` — успешно: 37 модулей, production bundle создан.
- `npm run preview` — production preview запущен и проверен в браузере.
- `git diff --check` — успешно на финальном проходе перед commit.

Targeted tests:

- Progression: Peacock → Panda и Panda → Peacock.
- Double Dash появляется только после обоих Rich pets и Fast Dash.
- Rich gate закрыт без Fast Dash и доступен при полном наборе prerequisites.
- Корректный Stage 3 v2 save принимается; противоречивый Rich save отклоняется; полный Stage 4 save принимается.
- До upgrade сохраняется один dash charge; после upgrade два отдельных press расходуют два charges, третий блокируется, восстановление идёт на 650 и 1300 мс.

Runtime production preview:

- Stage 3 v2 save загрузился без сброса и предложил RICH DISTRICT.
- Gate открылся, collider исчез, Rich zone стала доступна и состояние пережило reload.
- Peacock delivery подняла доход `+8 → +18`.
- Panda-first delivery подняла доход `+8 → +22`; второй Peacock довёл доход до `+32`.
- Оба порядка завершили Rich progression и открыли Double Dash objective.
- Panda owner и guard одновременно наблюдались в `CHASING`; alarm активировался после задержки.
- Поимка guard вернула обоих pursuers через `RETURNING → IDLE`; питомец оказался дома и retry снова стал доступен.
- Поимка owner до 800 мс оставила guard в `IDLE`; поздний alarm после завершения не появился.
- Проверены fail около estate, у Rich gate/выхода и далеко от Panda home; в каждом завершённом сценарии питомец вернулся, оба NPC стали `IDLE`, повторная кража сработала.
- Double Dash purchase сразу дал `2/2`; reload восстановил Fast Dash, Double Dash, `2/2`, пять питомцев и `+32/сек` без удвоения sources.
- Dog fail/retry/delivery — успешно.
- Cat fail за павильоном, return в `IDLE`, retry/delivery — успешно; прежний pavilion soft-lock не воспроизвёлся.
- Fox fail у дальнего прохода, return в `IDLE`, retry/delivery — успешно.
- Browser console: ошибок и warning runtime нет.

Mobile/responsive:

- Forced touch mode визуально проверен на `320`, `360`, `390`, `430` px и landscape `844×430`.
- Money с `+32/сек`, objective и dash UI не пересекаются; пять питомцев читаются на базе.
- Mobile dash показывает `2/2`; joystick и interaction остаются независимыми pointer targets при `activePointers: 3`.
- Физический two-finger multitouch не может быть достоверно эмулирован текущим browser tool и требует контрольного теста на устройстве.

Performance production preview после warm-up:

- база с пятью питомцами: примерно `49–50 FPS`, rolling `49–50`, `20,1–20,5 мс`;
- RICH DISTRICT / Peacock area: примерно `47–49 FPS`, `20,5–21,3 мс`;
- Panda chase с двумя активными pursuers: около `47 FPS`, rolling `46–47`, `21,5 мс`;
- отдельной подтверждённой просадки от второго pursuer относительно Rich area не обнаружено;
- для сравнения Stage 3 в той же in-app среде фиксировал примерно `49–50 FPS / 20,0–20,3 мс`.

Среда браузерной автоматизации планирует страницу примерно на 46–50 Hz, поэтому эти числа подходят для регрессии между этапами, но не заменяют профиль реального мобильного устройства.

Ориентировочное время текущего playable-контента без dev teleport — около 4–6 минут по утверждённым накоплениям и prototype-дистанциям. Автоматизированный QA-проход использовал teleport/fast delivery и не является измерением реального playtime. Полная 20-минутная кампания пока невозможна без VIP ESTATE и финального этапа.

## Остались проблемы

- Prototype-расстояние от Rich gate до ближайшего encounter по прямому маршруту ощущается короче ориентира 10–18 секунд (примерно несколько секунд при текущей скорости). Удлинять путь искусственным maze без pathfinding не стал; требуется layout review Game Director.
- Нужны physical multitouch и performance tests на среднем/слабом телефоне; browser tool не подтверждает одновременные реальные пальцы и GPU-профиль устройства.
- Vite сохраняет предупреждение о Phaser bundle больше 500 kB. Сборка и runtime успешны.
- Финальный hands-on баланс Panda chase и читаемость двух выходов требуют review без самостоятельного изменения скоростей.

## Требуется решение Game Director

- Принять или скорректировать prototype layout RICH DISTRICT, особенно фактическую длину пути от gate до encounters.
- Подтвердить ощущение честности Peacock/Panda chase и расположение guard после hands-on playtest.
- Подтвердить mobile multitouch и производительность на реальном устройстве.

## Предложения Codex

- Перед VIP ESTATE провести короткий instrumented playtest на двух Android-классах устройств и записать FPS/frame time отдельно на базе, в Rich District и в Panda chase.
- Если Rich travel time нужно увеличить, сначала скорректировать границы/точку входа района совместно с Game Director; не строить длинный искусственный лабиринт, который ухудшит прямой Arcade Physics chase.
- Сохранить текущую pure-logic test boundary и при проектировании финала добавить tests на victory derivation и следующую save validation, не пытаясь unit-тестировать Phaser rendering.
