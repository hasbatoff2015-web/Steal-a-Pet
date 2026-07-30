# Техническая архитектура

## Текущее состояние

Репозиторий содержит запускаемую первую прогрессионную арку на Phaser + TypeScript:

`Собака → доход → открытие PARK → Кот → суммарный доход → цель CENTRAL HUB`.

Реализованы несколько питомцев и NPC encounters, физический zone gate, прогрессия и восстановление мира через `localStorage`. Графика остаётся программной prototype-графикой; финальных ассетов нет.

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
      ZoneGateSystem.ts
    ui/
      Hud.ts
    utils/
      createPrototypeTextures.ts
      DeveloperTools.ts
    world/
      WorldBuilder.ts
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
- Дракон — только долгосрочная `LEGENDARY` data-цель без созданной сущности и без придуманного дохода.

`PetEncounterDefinition` связывает конкретного питомца, его домашнюю позицию, владельца, визуальный вариант и параметры погони. `PetEncounter` является runtime-композицией `Pet + OwnerNpc + ChaseSystem`.

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

Собака и Кот используют разные prototype-текстуры, размеры и idle motion. На базе они занимают отдельные data-defined slots.

`PlayerPathHistory` хранит ограниченную breadcrumb-историю реально пройденного игроком маршрута только как TypeScript-данные. Активный питомец проходит точки с задержкой, повторяя путь вокруг крупных препятствий. При чрезмерном отставании выполняется коррекция к безопасной trailing-точке. Navmesh не используется.

## NPC и погоня

Каждый `OwnerNpc` имеет собственные состояния `IDLE`, `CHASING`, `RETURNING`.

`ChaseSystem` получает параметры из encounter definition: скорость погони, скорость возврата, дистанцию поимки, head-start и grace period. PARK encounter использует немного более высокую скорость и меньший head-start, не создавая отдельной AI-системы.

NPC использует прямое Arcade Physics-преследование; игровые маршруты спроектированы открытыми. Сложный pathfinding отсутствует.

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

Доставленные Собака и Кот остаются видимыми, используют idle movement и не накладываются друг на друга.

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
- `PARK_COMPLETE`.

Objective вычисляется из состояния прогрессии, денег и активной кражи, а не хранится в HUD.

## Zone gates

`ZoneGateDefinition` задаёт id, открываемую зону, цену, позицию и радиус взаимодействия.

`ZoneGate` отвечает за физический и визуальный объект: закрытый gate имеет статический collider, после открытия collider удаляется и проигрывается короткая реакция.

`ZoneGateSystem` ищет ближайший gate, проверяет и списывает деньги через `EconomySystem`, открывает зону через `ProgressionSystem` и возвращает результат взаимодействия. PARK не зашит как уникальная покупка в HUD.

## Карта и UI

- Arcade Physics world: 3840 × 2560 px.
- `WorldBuilder` создаёт пять prototype-зон, дороги, реку, мост, базы, PARK encounter, окружение, gates и markers.
- PARK визуально отличается дорожками, деревьями, кустами, прудом, лавочками и павильоном.
- Закрытый PARK gate физически блокирует мост; восточная prototype-граница предотвращает обход.
- CENTRAL HUB пока только будущая цель и закрытый путь.
- Координаты из `worldLayout.ts` являются prototype layout.

`Hud` показывает деньги, суммарный доход, текущую цель, contextual prompt, dash cooldown и короткие сообщения. Он не изменяет экономику или прогрессию.

## Сохранение

`SaveSystem` использует ключ `steal-a-pet.save.v1`.

Формат `saveVersion: 1`:

```text
saveVersion
money
parkUnlocked
deliveredPetIds[]
unlockedZones[]
campaignStage
```

Сохранение выполняется после доставки питомца, открытия gate, периодически для денег и перед закрытием страницы. Запись не происходит каждый кадр.

При загрузке восстанавливаются:

- деньги;
- доставленные питомцы и их места на базе;
- источники дохода;
- открытый PARK и отсутствие его collider;
- этап прогрессии и objective.

Отсутствующий, повреждённый, несовместимый или неполный save отбрасывается безопасно, после чего начинается новая игра. В dev-режиме `?dev=1` клавиша `F4` и кнопка `RESET SAVE` очищают сохранение и перезапускают сцену.

## Debug и QA

- `F2` — FPS, координаты и состояния runtime.
- `?dev=1` — dev-only панель для перемещения к encounters/gate, выдачи 25 монет, interaction, dash, доставки, поимки и reset save.
- `?touch=1` — принудительный mobile input для технической проверки.
- Debug выключен по умолчанию.

## Реализовано

- полный core loop Этапа 1;
- несколько pet definitions и NPC encounters;
- Собака и Кот с отдельными погонями;
- первая прогрессионная арка и contextual objectives;
- PARK gate за 25 монет;
- PARK prototype-контент;
- несколько источников дохода и списание денег;
- оба питомца на базе;
- навигационные markers до PARK, Кота и CENTRAL HUB;
- versioned localStorage save и dev reset;
- desktop/mobile input, multitouch config и responsive HUD.

## Ещё не реализовано

- gameplay CENTRAL HUB, RICH DISTRICT и VIP ESTATE;
- `RARE` питомцы, Дракон и завершение кампании;
- финальный баланс после PARK;
- магазин, строительство и сложные улучшения базы;
- финальные художественные ассеты и audio;
- SDK Яндекс Игр и реклама;
- сложный NPC pathfinding;
- автоматические unit/integration tests и lint;
- production-оптимизация размера Phaser bundle.
