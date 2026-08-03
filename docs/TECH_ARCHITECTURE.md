# Техническая архитектура

## Текущее состояние

Репозиторий содержит запускаемую прогрессию пяти питомцев на Phaser + TypeScript:

`Собака → PARK → Кот → CENTRAL HUB → Лиса → Fast Dash → RICH DISTRICT → Павлин/Панда → Double Dash → preview VIP ESTATE`.

Реализованы пять питомцев, encounters с одним или несколькими преследователями, три физических zone gates, два постоянных улучшения, безопасный возврат NPC и восстановление мира через `localStorage` v2. Графика остаётся программной prototype-графикой; финальных ассетов нет.

## Ключевые технологии

| Технология | Версия | Назначение |
| --- | --- | --- |
| Phaser | 4.2.1 | runtime, рендеринг, ввод, Arcade Physics |
| TypeScript | 7.0.2 | строгая типизация |
| Vite | 8.2.0 | dev-сервер и статическая production-сборка |
| Vitest | 4.1.10 | targeted tests чистой логики |
| npm | версия среды | зависимости и scripts |

Vite требует Node.js `^20.19.0` или `>=22.12.0`.

## Сборка

- `npm run dev` — локальный Vite dev-сервер.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run test` — targeted Vitest suite.
- `npm run build` — typecheck и production-сборка Vite.
- `npm run preview` — локальный запуск собранного `dist/` через Vite preview.
- `base: './'` обеспечивает относительные пути статической сборки.
- Серверная логика отсутствует.
- `node_modules/`, `dist/`, логи и временные файлы исключены через `.gitignore`.

## Структура исходного кода

```text
src/
  main.ts
  style.css
  game/
    config/
      gameConfig.ts
      gameplay.ts
    data/
      encounters.ts
      pets.ts
      upgrades.ts
      worldLayout.ts
      zones.ts
    entities/
      OwnerNpc.ts
      Pet.ts
      Player.ts
    input/
      InputController.ts
      VirtualControls.ts
    scenes/
      WorldScene.ts
    systems/
      BaseSystem.ts
      ChaseSystem.ts
      CoreLoopSystem.ts
      DashChargeController.ts
      EconomySystem.ts
      PetEncounter.ts
      PlayerPathHistory.ts
      ProgressionSystem.ts
      SaveSystem.ts
      UpgradeSystem.ts
      ZoneGateSystem.ts
    ui/
      Hud.ts
    utils/
      createPrototypeTextures.ts
      DeveloperTools.ts
    world/
      WorldBuilder.ts
      UpgradeStation.ts
      VipEstatePreview.ts
      ZoneGate.ts
tests/
  dash-charges.test.ts
  gate-prerequisites.test.ts
  progression.test.ts
  save-validation.test.ts
  upgrade-prerequisites.test.ts
```

## Сцена и композиция

`WorldScene` — composition root и единственная игровая сцена. Она:

- загружает сохранение до построения мира;
- создаёт мир, сущности и системы;
- восстанавливает доставленных питомцев, открытые gates и источники дохода;
- связывает Arcade Physics colliders и камеру;
- вызывает системы в общем update;
- сохраняет ключевые события, периодический снимок денег и состояние перед закрытием страницы.

Механики распределены по отдельным классам; сцена не содержит реализации всей игры.

## Данные питомцев и encounters

`PetDefinition` централизованно задаёт:

- `id`;
- отображаемое имя;
- редкость;
- доход в секунду;
- prototype visual key, цвет и зону.

Текущие definitions:

- Собака — `COMMON`, `+1/сек`, STARTER SUBURB;
- Кот — `UNCOMMON`, `+2/сек`, PARK;
- Лиса — `RARE`, `+5/сек`, CENTRAL HUB;
- Павлин — `RARE`, `+10/сек`, RICH DISTRICT;
- Панда — `RARE`, `+14/сек`, RICH DISTRICT;
- Дракон — только долгосрочная `LEGENDARY` data-цель без созданной сущности и без придуманного дохода.

`PetEncounterDefinition` связывает конкретного питомца и массив `pursuers[]`. Каждый pursuer имеет собственные `id`, home, visual key, chase parameters, необязательную задержку активации и data-driven `returnRoutes`. `PetEncounter` является runtime-композицией `Pet + EncounterPursuer[]`, где каждый преследователь содержит `OwnerNpc + ChaseSystem`.

В мире одновременно находятся несколько питомцев и владельцев, но `CoreLoopSystem` допускает только одну активную кражу. Dog, Cat, Fox и Peacock используют по одному pursuer; Panda — владельца и охранника. После завершения или провала ссылка на active encounter очищается.

## Player и input

`Player` инкапсулирует Arcade body, нормализованное движение, последнее направление, dash, cooldown, trail, world bounds, ориентацию и Y-depth.

Desktop:

- `WASD` / стрелки — движение;
- `Space` — dash;
- `E` — contextual interaction;
- `F2` — debug overlay.

`VirtualControls` без сторонней библиотеки реализует joystick, dash и contextual interaction. В Phaser настроено `input.activePointers: 3`; joystick закрепляется за своим pointer ID, поэтому action-кнопки не сбрасывают его состояние. Mobile dash cooldown отображается на самой кнопке, desktop indicator остаётся только на desktop. Раскладка пересчитывается после resize/orientation change.

`DashChargeController` хранит runtime-состояние зарядов независимо от конкретных upgrades: максимум, текущее число, время следующего восстановления и cooldown. До Double Dash максимум равен одному; после эффекта `MaxDashCharges` — двум. Отдельный press расходует один заряд, активный dash нельзя наложить на предыдущий, восстановление идёт последовательно по 650 мс.

## Питомцы и следование

`Pet` хранит состояния:

- `AT_NPC_BASE`;
- `FOLLOWING_PLAYER`;
- `AT_PLAYER_BASE`.

Собака, Кот, Лиса, Павлин и Панда используют разные prototype-текстуры, силуэты, размеры и idle motion. На базе они занимают пять отдельных data-defined slots в два ряда и показывают лёгкий периодический income feedback.

`PlayerPathHistory` хранит ограниченную breadcrumb-историю реально пройденного игроком маршрута только как TypeScript-данные. Активный питомец проходит точки с задержкой, повторяя путь вокруг крупных препятствий. При чрезмерном отставании выполняется коррекция к безопасной trailing-точке. Navmesh не используется.

## NPC и погоня

Каждый `OwnerNpc` имеет собственные состояния `IDLE`, `CHASING`, `RETURNING`.

`ChaseSystem` получает параметры конкретного pursuer из encounter definition: скорость погони, скорость возврата, дистанцию поимки, head-start и grace period. Все зоны используют общий класс без отдельных AI-систем.

Panda guard активируется через timestamp внутри `PetEncounter.update`, без `delayedCall`. Завершение, fail, shutdown/reload или очистка active theft сбрасывают pending activation, поэтому поздний alarm не может запустить завершённую погоню. Любой активный pursuer может сообщить поимку; `CoreLoopSystem` обрабатывает событие один раз и останавливает всех участников encounter.

Во время погони NPC использует прямое Arcade Physics-преследование; игровые маршруты спроектированы открытыми. При возврате каждый `OwnerNpc` независимо выбирает ближайшую точку собственного data-defined маршрута и последовательно идёт к home. Если расстояние до текущей цели не уменьшается 1,8 секунды либо возврат превышает 30 секунд, общий fail-safe безопасно восстанавливает конкретного NPC дома в `IDLE`. Encounter снова доступен, когда все pursuers готовы и закончился grace period. Сложный pathfinding отсутствует.

## Core loop

`CoreLoopSystem` координирует только текущую активную кражу и общие переходы:

- contextual interaction с ближайшим доступным encounter или gate;
- запуск following и погони;
- возврат питомца и всех pursuers после поимки;
- доставка активного питомца в общий `BaseSystem`;
- регистрация дохода и прогресса;
- очистка active theft;
- objective, toast и навигационные markers.

Класс не содержит отдельного большого сценария для каждого будущего питомца.

## База

`BaseSystem` знает геометрию delivery zone и data-defined места доставленных питомцев. Он не управляет экономикой или погоней.

Доставленные Собака, Кот, Лиса, Павлин и Панда остаются видимыми, используют ограниченное idle movement вокруг пяти slots и не накладываются друг на друга.

## Экономика

`EconomySystem` не зависит от HUD. Он:

- хранит деньги;
- суммирует именованные источники дохода;
- проверяет `canAfford`;
- выполняет атомарное `spend`;
- добавляет источники через `addIncomeSource`.

Баланс берётся из pet/gate definitions. HUD только отображает результат.

## Прогрессия

`ProgressionSystem` отдельно хранит открытые зоны, доставленных питомцев, активную цель и этап кампании:

- `FIRST_PET`;
- `EARN_FOR_PARK`;
- `UNLOCK_PARK`;
- `STEAL_PARK_PET`;
- `RETURN_PARK_PET`;
- `EARN_FOR_CENTRAL_HUB`;
- `UNLOCK_CENTRAL_HUB`;
- `STEAL_HUB_PET`;
- `RETURN_HUB_PET`;
- `EARN_FOR_DASH_UPGRADE`;
- `BUY_DASH_UPGRADE`;
- `EARN_FOR_RICH_DISTRICT`;
- `UNLOCK_RICH_DISTRICT`;
- `STEAL_RICH_PETS`;
- `RETURN_RICH_PET`;
- `EARN_FOR_DOUBLE_DASH`;
- `BUY_DOUBLE_DASH`;
- `RICH_DISTRICT_COMPLETE`.

Objective вычисляется из состояния прогрессии, денег и активной кражи, а не хранится в HUD. Rich progression выводит результат из `deliveredPetIds`, поэтому Peacock → Panda и Panda → Peacock используют одну модель без комбинаторных campaign states.

## Zone gates

`ZoneGateDefinition` задаёт id, открываемую зону, цену, позицию и радиус взаимодействия.

`ZoneGate` отвечает за физический и визуальный объект: закрытый gate имеет статический collider, после открытия collider удаляется и проигрывается короткая реакция.

`ZoneGateSystem` ищет ближайший доступный gate, проверяет data-driven `requiredPetIds`, `requiredUpgradeIds` и `requiredZones`, списывает деньги через `EconomySystem`, открывает зону через `ProgressionSystem` и возвращает результат interaction. PARK, CENTRAL HUB и RICH DISTRICT используют одну систему; до выполнения prerequisites interaction не показывается.

## Улучшения игрока

`UpgradeDefinition` хранит id, отображаемое имя, цену, prerequisites, effect id и значение. `UpgradeSystem` владеет купленными upgrades, выполняет списание и применяет типизированный effect target, не зашивая покупки в `Player` или HUD.

`UpgradeStation` — один физический world object на базе. Он получает последовательное состояние от `UpgradeSystem`: future, Fast Dash offer, Rich District prerequisite, Double Dash offer и complete. `fast-dash` стоит 50 монет и меняет cooldown `900 → 650 мс`; `double-dash` стоит 250 монет и применяет эффект `MaxDashCharges = 2`. При reload оба эффекта повторно применяются в Player, заряды стартуют полными.

## Карта и UI

- Arcade Physics world: 3840 × 2560 px.
- `WorldBuilder` создаёт пять prototype-зон, дороги, реку, мост, базы, encounters, окружение, gates, upgrade station, markers и VIP preview.
- PARK визуально отличается дорожками, деревьями, кустами, прудом, лавочками и павильоном.
- Закрытый PARK gate физически блокирует мост; восточная prototype-граница предотвращает обход.
- CENTRAL HUB содержит физический gate за 75 монет, площадь, фонтан, здания, городской дворик и Fox encounter.
- RICH DISTRICT содержит физический gate за 200, светлый главный бульвар, Estate A с фонтаном/Павлином и Estate B с бассейном/Пандой/охраной.
- Повторяющиеся Rich decorations используют общие generated textures вместо уникальной Graphics geometry для каждого экземпляра.
- `VipEstatePreview` остаётся неинтерактивным и после Double Dash меняет подпись на «ФИНАЛЬНАЯ ЗОНА · СКОРО» без active marker.
- Координаты из `worldLayout.ts` являются prototype layout.

`Hud` показывает деньги, суммарный доход, текущую цель, contextual prompt, dash charges/recharge и короткие сообщения. Desktop рисует 1–2 segments; mobile показывает `current/max` на кнопке. Он не изменяет экономику или прогрессию.

## Runtime performance

- Phaser loop явно настроен как `target: 60`, `limit: 60`; игровой update не выполняется чаще 60 раз/сек.
- Movement, dash, following, chase и economy используют `delta`/время Phaser, поэтому ограничение FPS не меняет игровые скорости.
- `Hud` кэширует реально отображаемые money, objective и interaction prompt и не вызывает `Text.setText`/`setVisible` для одинакового состояния.
- Desktop segments и mobile dash ring квантизированы на 24 визуальных шага. `Graphics.clear` и redraw выполняются только при смене шага, числа зарядов, максимума или layout.
- `EconomySystem` кэширует суммарный income и пересчитывает его только при добавлении, замене или удалении источника.
- `InputController` переиспользует объект `FrameInput`; mobile joystick переиспользует рабочий `Vector2`.
- Навигационные markers меняют visibility только при реальном переходе состояния; ссылки на Cat/Fox/Peacock/Panda encounters кэшируются.
- Неактивный `OwnerNpc` не выполняет повторные velocity/shadow/depth updates, пока стоит на месте.
- HTML snapshot `DeveloperTools` и F2 debug Text обновляются не чаще четырёх раз в секунду и только при изменении текста.
- F2 показывает current update FPS, rolling FPS и среднее frame time за последнее окно измерения.

`WorldBuilder` проверен отдельно. Статический мир состоит из небольшого числа постоянных `Graphics`-слоёв и ограниченного количества простых Game Objects; baseline throughput превышал целевые 60 FPS. Переход на chunked RenderTexture/DynamicTexture не выполнен, потому что он не устраняет найденные CPU/dirty-update bottlenecks и потребовал бы неоправданного rewrite карты. При росте контента этот вопрос нужно перепроверить профилированием на целевых мобильных устройствах.

## Сохранение

`SaveSystem` использует ключ `steal-a-pet.save.v2`.

Формат `saveVersion: 2`:

```text
saveVersion
money
deliveredPetIds[]
unlockedZones[]
purchasedUpgradeIds[]
```

Сохранение выполняется после доставки питомца, открытия gate, периодически для денег и перед закрытием страницы. Запись не происходит каждый кадр.

При загрузке восстанавливаются:

- деньги;
- до пяти доставленных питомцев и их места на базе;
- источники дохода;
- открытые PARK/CENTRAL HUB/RICH DISTRICT и отсутствие их colliders;
- Fast Dash и Double Dash, cooldown 650 мс и полные runtime charges;
- выведенные из сохранённых фактов этап прогрессии и objective.

Корректный v1 автоматически мигрирует деньги, PARK, Dog/Cat и открытые зоны в v2, добавляя пустые defaults для новых фактов. Этап 4 сохраняет `saveVersion: 2`: Rich zone, Peacock/Panda и Double Dash помещаются в существующие массивы. Validation проверяет зависимости зон, питомцев и upgrades. V2 не сохраняет active theft, dash charges, pursuer states или alarm timer. Отсутствующий, повреждённый, несовместимый или логически противоречивый save безопасно заменяется новой игрой.

## Debug и QA

- `F2` — current/rolling FPS, frame time, координаты и состояния runtime; текст обновляется 4 раза/сек.
- `?dev=1` — dev-only панель для перемещения к пяти encounters, трём gates и upgrade station, добавления 200/250, interaction, dash, быстрой доставки, отдельной поимки owner/guard, return regression positions, v1 migration test и reset save. Snapshot показывает состояния всех pursuers.
- `?touch=1` — принудительный mobile input для технической проверки.
- Debug выключен по умолчанию.

## Реализовано

- полный core loop Этапа 1;
- несколько pet definitions и NPC encounters;
- Собака и Кот с отдельными погонями;
- Лиса `RARE` и третья вариация погони вокруг объектов CENTRAL HUB;
- Павлин и Панда `RARE` в свободном порядке внутри RICH DISTRICT;
- Panda encounter с владельцем, delayed guard alarm и общим завершением кражи;
- первая прогрессионная арка и contextual objectives;
- PARK gate за 25 монет;
- PARK prototype-контент;
- CENTRAL HUB gate за 75 и городской prototype-контент;
- RICH DISTRICT gate за 200, два estate и VIP ESTATE preview;
- несколько источников дохода и списание денег;
- пять питомцев на базе и суммарный доход `+32/сек`;
- `UpgradeSystem`, physical station и сохраняемый Fast Dash;
- сохраняемый Double Dash с двумя последовательными charges;
- waypoint return routes и общий stuck fail-safe;
- контекстные markers до gates, недоставленных питомцев и станции улучшений;
- localStorage save v2, миграция v1 и dev reset;
- desktop/mobile input, multitouch config и responsive HUD.
- ограниченный 60 FPS loop и dirty/quantized UI updates;
- lightweight performance display и production preview script.
- targeted Vitest tests progression, prerequisites, save validation и dash charges.

## Ещё не реализовано

- gameplay VIP ESTATE;
- Дракон и завершение кампании;
- баланс VIP ESTATE, Дракона и финального этапа;
- магазин, строительство и сложные улучшения базы;
- финальные художественные ассеты и audio;
- SDK Яндекс Игр и реклама;
- сложный NPC pathfinding;
- lint и полноценные Phaser integration tests;
- production-оптимизация размера Phaser bundle и повторный GPU-профиль при существенном росте карты.
