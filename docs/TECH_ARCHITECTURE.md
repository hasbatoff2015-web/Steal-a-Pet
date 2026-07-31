# Техническая архитектура

## Текущее состояние

Репозиторий содержит запускаемую прогрессию трёх питомцев на Phaser + TypeScript:

`Собака → PARK → Кот → CENTRAL HUB → Лиса → Fast Dash → preview RICH DISTRICT`.

Реализованы три питомца и NPC encounters, два физических zone gates, постоянное улучшение, безопасный возврат NPC и восстановление мира через `localStorage` v2. Графика остаётся программной prototype-графикой; финальных ассетов нет.

## Ключевые технологии

| Технология | Версия | Назначение |
| --- | --- | --- |
| Phaser | 4.2.1 | runtime, рендеринг, ввод, Arcade Physics |
| TypeScript | 7.0.2 | строгая типизация |
| Vite | 8.2.0 | dev-сервер и статическая production-сборка |
| npm | версия среды | зависимости и scripts |

Vite требует Node.js `^20.19.0` или `>=22.12.0`.

## Сборка

- `npm run dev` — локальный Vite dev-сервер.
- `npm run typecheck` — `tsc --noEmit`.
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
      ZoneGate.ts
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
- Дракон — только долгосрочная `LEGENDARY` data-цель без созданной сущности и без придуманного дохода.

`PetEncounterDefinition` связывает конкретного питомца, его домашнюю позицию, владельца, визуальный вариант, параметры погони и необязательные data-driven `returnRoutes`. `PetEncounter` является runtime-композицией `Pet + OwnerNpc + ChaseSystem`.

В мире одновременно могут находиться несколько питомцев и владельцев, но `CoreLoopSystem` допускает только одну активную кражу. После завершения или провала ссылка на active encounter очищается.

## Player и input

`Player` инкапсулирует Arcade body, нормализованное движение, последнее направление, dash, cooldown, trail, world bounds, ориентацию и Y-depth.

Desktop:

- `WASD` / стрелки — движение;
- `Space` — dash;
- `E` — contextual interaction;
- `F2` — debug overlay.

`VirtualControls` без сторонней библиотеки реализует joystick, dash и contextual interaction. В Phaser настроено `input.activePointers: 3`; joystick закрепляется за своим pointer ID, поэтому action-кнопки не сбрасывают его состояние. Mobile dash cooldown отображается на самой кнопке, desktop indicator остаётся только на desktop. Раскладка пересчитывается после resize/orientation change.

## Питомцы и следование

`Pet` хранит состояния:

- `AT_NPC_BASE`;
- `FOLLOWING_PLAYER`;
- `AT_PLAYER_BASE`.

Собака, Кот и Лиса используют разные prototype-текстуры, силуэты, размеры и idle motion. На базе они занимают отдельные data-defined slots и показывают лёгкий периодический income feedback.

`PlayerPathHistory` хранит ограниченную breadcrumb-историю реально пройденного игроком маршрута только как TypeScript-данные. Активный питомец проходит точки с задержкой, повторяя путь вокруг крупных препятствий. При чрезмерном отставании выполняется коррекция к безопасной trailing-точке. Navmesh не используется.

## NPC и погоня

Каждый `OwnerNpc` имеет собственные состояния `IDLE`, `CHASING`, `RETURNING`.

`ChaseSystem` получает параметры из encounter definition: скорость погони, скорость возврата, дистанцию поимки, head-start и grace period. PARK и CENTRAL HUB encounters используют собственные параметры без отдельных AI-классов.

Во время погони NPC использует прямое Arcade Physics-преследование; игровые маршруты спроектированы открытыми. При возврате `OwnerNpc` выбирает ближайшую точку одного из data-defined маршрутов и последовательно идёт к home. Если расстояние до текущей цели не уменьшается 1,8 секунды либо возврат превышает 30 секунд, общий fail-safe безопасно восстанавливает NPC дома в `IDLE`. Отсутствие routes сохраняет прямой возврат для простого encounter. Сложный pathfinding отсутствует.

## Core loop

`CoreLoopSystem` координирует только текущую активную кражу и общие переходы:

- contextual interaction с ближайшим доступным encounter или gate;
- запуск following и погони;
- возврат питомца и владельца после поимки;
- доставка активного питомца в общий `BaseSystem`;
- регистрация дохода и прогресса;
- очистка active theft;
- objective, toast и навигационные markers.

Класс не содержит отдельного большого сценария для каждого будущего питомца.

## База

`BaseSystem` знает геометрию delivery zone и data-defined места доставленных питомцев. Он не управляет экономикой или погоней.

Доставленные Собака, Кот и Лиса остаются видимыми, используют ограниченное idle movement и не накладываются друг на друга.

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
- `CENTRAL_HUB_COMPLETE`.

Objective вычисляется из состояния прогрессии, денег и активной кражи, а не хранится в HUD.

## Zone gates

`ZoneGateDefinition` задаёт id, открываемую зону, цену, позицию и радиус взаимодействия.

`ZoneGate` отвечает за физический и визуальный объект: закрытый gate имеет статический collider, после открытия collider удаляется и проигрывается короткая реакция.

`ZoneGateSystem` ищет ближайший доступный gate, проверяет prerequisite-питомца, списывает деньги через `EconomySystem`, открывает зону через `ProgressionSystem` и возвращает результат interaction. PARK и CENTRAL HUB используют одну систему.

## Улучшения игрока

`UpgradeDefinition` хранит id, отображаемое имя, цену, effect id и значение. `UpgradeSystem` владеет купленными upgrades, выполняет списание и применяет типизированный effect target, не зашивая покупку в `Player` или HUD.

`UpgradeStation` — физический world object на базе с состояниями locked, available и purchased. Единственное текущее улучшение `fast-dash` стоит 50 монет и меняет только cooldown Player с 900 до 650 мс. HUD читает фактический cooldown через ready ratio автоматически.

## Карта и UI

- Arcade Physics world: 3840 × 2560 px.
- `WorldBuilder` создаёт пять prototype-зон, дороги, реку, мост, базы, PARK/CENTRAL HUB encounters, окружение, gates, upgrade station и markers.
- PARK визуально отличается дорожками, деревьями, кустами, прудом, лавочками и павильоном.
- Закрытый PARK gate физически блокирует мост; восточная prototype-граница предотвращает обход.
- CENTRAL HUB содержит физический gate за 75 монет, площадь, фонтан, здания, городской дворик и Fox encounter.
- RICH DISTRICT физически закрыт и обозначен статичным future preview без active marker.
- Координаты из `worldLayout.ts` являются prototype layout.

`Hud` показывает деньги, суммарный доход, текущую цель, contextual prompt, dash cooldown и короткие сообщения. Он не изменяет экономику или прогрессию.

## Runtime performance

- Phaser loop явно настроен как `target: 60`, `limit: 60`; игровой update не выполняется чаще 60 раз/сек.
- Movement, dash, following, chase и economy используют `delta`/время Phaser, поэтому ограничение FPS не меняет игровые скорости.
- `Hud` кэширует реально отображаемые money, objective и interaction prompt и не вызывает `Text.setText`/`setVisible` для одинакового состояния.
- Desktop и mobile dash cooldown квантизированы на 24 визуальных шага. `Graphics.clear` и redraw выполняются только при смене шага или layout.
- `EconomySystem` кэширует суммарный income и пересчитывает его только при добавлении, замене или удалении источника.
- `InputController` переиспользует объект `FrameInput`; mobile joystick переиспользует рабочий `Vector2`.
- Навигационные markers меняют visibility только при реальном переходе состояния; ссылки на Cat/Fox encounters кэшируются.
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
- доставленные питомцы и их места на базе;
- источники дохода;
- открытые PARK/CENTRAL HUB и отсутствие их colliders;
- Fast Dash и cooldown 650 мс;
- выведенные из сохранённых фактов этап прогрессии и objective.

Корректный v1 автоматически мигрирует деньги, PARK, Dog/Cat и открытые зоны в v2, добавляя пустые defaults для CENTRAL HUB, Fox и upgrades. V2 не сохраняет transient active theft. Отсутствующий, повреждённый, несовместимый или логически противоречивый save безопасно заменяется новой игрой. В dev-режиме `?dev=1` доступны reset и отдельный v1 migration fixture.

## Debug и QA

- `F2` — current/rolling FPS, frame time, координаты и состояния runtime; текст обновляется 4 раза/сек.
- `?dev=1` — dev-only панель для перемещения к трём encounters, двум gates и upgrade station, управления деньгами, interaction, dash, доставки, поимки, return regression positions, v1 migration test и reset save.
- `?touch=1` — принудительный mobile input для технической проверки.
- Debug выключен по умолчанию.

## Реализовано

- полный core loop Этапа 1;
- несколько pet definitions и NPC encounters;
- Собака и Кот с отдельными погонями;
- Лиса `RARE` и третья вариация погони вокруг объектов CENTRAL HUB;
- первая прогрессионная арка и contextual objectives;
- PARK gate за 25 монет;
- PARK prototype-контент;
- CENTRAL HUB gate за 75, городской prototype-контент и RICH DISTRICT preview;
- несколько источников дохода и списание денег;
- оба питомца на базе;
- три питомца на базе и суммарный доход `+8/сек`;
- `UpgradeSystem`, physical station и сохраняемый Fast Dash;
- waypoint return routes и общий stuck fail-safe;
- навигационные markers до PARK, Кота и CENTRAL HUB;
- localStorage save v2, миграция v1 и dev reset;
- desktop/mobile input, multitouch config и responsive HUD.
- ограниченный 60 FPS loop и dirty/quantized UI updates;
- lightweight performance display и production preview script.

## Ещё не реализовано

- gameplay RICH DISTRICT и VIP ESTATE;
- Дракон и завершение кампании;
- баланс после CENTRAL HUB;
- магазин, строительство и сложные улучшения базы;
- финальные художественные ассеты и audio;
- SDK Яндекс Игр и реклама;
- сложный NPC pathfinding;
- автоматические unit/integration tests и lint;
- production-оптимизация размера Phaser bundle и повторный GPU-профиль при существенном росте карты.
