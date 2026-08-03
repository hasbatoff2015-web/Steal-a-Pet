# Техническая архитектура

## Текущее состояние

Репозиторий содержит законченную playable prototype-кампанию на Phaser + TypeScript:

`Собака → PARK → Кот → CENTRAL HUB → Лиса → Fast Dash → RICH DISTRICT → Павлин/Панда → Double Dash → VIP ESTATE → VIP A/VIP B → Дракон → победа`.

Реализованы восемь питомцев, пять физических зон, encounters с одним–тремя преследователями, два постоянных dash upgrades, локальное сохранение v2, статистика прохождения, финальный экран и post-victory free roam. Графика остаётся программной prototype-графикой; production-ассетов нет.

## Ключевые технологии

| Технология | Версия | Назначение |
| --- | --- | --- |
| Phaser | 4.2.1 | runtime, rendering, input, Arcade Physics |
| TypeScript | 7.0.2 | strict typing |
| Vite | 8.2.0 | dev server и статическая production build |
| Vitest | 4.1.10 | targeted tests чистой логики |
| npm | версия среды | зависимости и scripts |

Vite требует Node.js `^20.19.0` или `>=22.12.0`.

## Команды

- `npm run dev` — Vite dev server.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run test` — Vitest suite.
- `npm run build` — typecheck и production build.
- `npm run preview` — Vite preview собранного `dist/`.
- `base: './'` сохраняет относительные пути статической сборки.
- Серверная логика отсутствует; `node_modules/`, `dist/`, coverage, логи и временные файлы исключены из Git.

## Структура

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
      RunStatsSystem.ts
      SaveSystem.ts
      UpgradeSystem.ts
      ZoneGateSystem.ts
    ui/
      Hud.ts
      VictoryOverlay.ts
    utils/
      createPrototypeTextures.ts
      DeveloperTools.ts
    world/
      DragonCourtyard.ts
      UpgradeStation.ts
      WorldBuilder.ts
      ZoneGate.ts
tests/
  dash-charges.test.ts
  gate-prerequisites.test.ts
  progression.test.ts
  run-stats.test.ts
  save-validation.test.ts
  upgrade-prerequisites.test.ts
docs/
  ASSET_PLAN.md
```

## Composition root

`WorldScene` остаётся единственной игровой сценой и composition root. Она:

- загружает save до построения мира;
- создаёт economy, upgrades, progression и run stats;
- строит мир в состоянии, выведенном из сохранённых фактов;
- создаёт восемь `PetEncounter` и их pursuers;
- восстанавливает питомцев на базе и income sources;
- связывает colliders, input, HUD, victory overlay и camera;
- выполняет единый update без ECS/DI framework;
- сохраняет ключевые события, периодический money snapshot, stats и beforeunload state.

Transient active theft, pursuer states и UI overlay не восстанавливаются.

## Rename-ready content layer

`PetDefinition` — единственный источник пользовательской идентичности питомца:

- stable `id`;
- `displayName`;
- rarity;
- income;
- отдельный `visualKey`;
- zone;
- prototype visual profile.

Текущие stable ids:

- `dog`, `cat`, `fox`, `peacock`, `panda`;
- `vip-a`, `vip-b`;
- `dragon`.

Gameplay-код не сравнивает `displayName`. Objectives, prompts, toasts, world markers и developer tools берут имя из definition. Prototype motion, scale, shadow и base tint также описаны data profile, поэтому замена display name, visual key и animation не меняет progression, economy, encounter или save.

Технический контракт будущих ассетов зафиксирован в `docs/ASSET_PLAN.md`. Следующий визуальный этап должен начать с одного законченного vertical slice.

## Питомцы и following

`Pet` имеет состояния:

- `AT_NPC_BASE`;
- `FOLLOWING_PLAYER`;
- `AT_PLAYER_BASE`.

`PlayerPathHistory` хранит ограниченный breadcrumb-маршрут реально пройденного игроком пути. Следующий питомец идёт по этим данным с задержкой, не срезает обычные крупные препятствия и получает safe correction при чрезмерном отставании. Navmesh не используется.

Idle prototype motion обновляется с ограниченной частотой и не использует physics. Восемь base pets создают лёгкий income feedback с увеличенным интервалом, чтобы не перегенерировать Phaser Text слишком часто.

## Encounters и несколько pursuers

`PetEncounterDefinition` связывает:

- стабильный `petId`;
- required zone;
- optional required pet ids;
- pet home;
- `pursuers[]`.

Каждый `PursuerDefinition` хранит id, home, visual key, chase parameters, optional activation delay/message, return routes и optional `returnResetAfterMs`.

Состав:

- Dog, Cat, Fox, Peacock — один pursuer;
- Panda — owner + delayed guard;
- VIP A — owner + garden guard через 750 мс;
- VIP B — owner + intercept guard через 1000 мс;
- Dragon — boss сразу, Guard A через 700 мс, Guard B через 1400 мс.

Delayed activation основана на timestamps внутри `PetEncounter.update`, а не на неотменяемых timers. Fail/delivery сразу сбрасывает `theftActive`, pending activations и activation feedback. Любая поимка обрабатывается централизованно один раз, после чего все pursuers прекращают chase.

`CoreLoopSystem` хранит только одну active theft. Поэтому игрок переносит одного питомца, а остальные encounters, gates и station interactions остаются недоступны до завершения или провала.

## NPC chase и return

`OwnerNpc` имеет `IDLE`, `CHASING`, `RETURNING`. `ChaseSystem` применяет параметры конкретного pursuer и не хранит глобальный сценарий.

Возврат:

- выбирает ближайшую точку data-defined route;
- идёт по waypoints к своему home;
- сохраняет общий stuck fail-safe `1,8 с без прогресса / 30 с максимум`;
- для дальних VIP/Dragon pursuers применяет `returnResetAfterMs = 6000`;
- после честной попытки возврата выполняет короткий alpha fade, восстанавливает NPC дома и возвращает `IDLE`;
- обычные encounters не используют ускоренный reset.

Timing delayed alarms, return, dash и retry сдвигается на hidden-tab interval, если Phaser clock получил abnormal jump. Physics при скрытии вкладки приостанавливается.

## Player, dash и input

`Player` инкапсулирует Arcade body, нормализованное движение, last direction, dash, trail, orientation и Y-depth.

`DashChargeController` отделяет runtime charges от upgrades. До Double Dash максимум один; после effect `MaxDashCharges` — два. Заряды расходуются отдельными press и восстанавливаются последовательно по 650 мс. Hidden-tab timing shift не превращается в ошибочный мгновенный recharge.

Desktop: WASD/стрелки, Space, E, F2.

`VirtualControls` реализует joystick, dash и contextual interaction без сторонней библиотеки. Phaser использует `activePointers: 3`; joystick закреплён за pointer id. Mobile cooldown/charges рисуются на dash button, desktop использует segmented indicator.

## BaseSystem

`BaseSystem` знает только delivery geometry и `PetId → slot`. Восемь slots заданы в `worldLayout.ts` тремя рядами; Дракон занимает увеличенное центральное место. `CoreLoopSystem` не содержит координат или отдельных условий размещения.

После delivery питомец остаётся видимым, income source регистрируется по stable id и не может задублироваться.

## EconomySystem

Система отделена от HUD и предоставляет:

- cached total income;
- `canAfford`;
- atomic `spend`;
- `addIncomeSource` / `removeIncomeSource`;
- display money.

Total income пересчитывается только при изменении sources. Abnormal frame delta ограничивается 100 мс, поэтому возврат к скрытой вкладке не выдаёт крупный доход одним frame.

## ProgressionSystem

Прогрессия выводится из delivered pet ids, unlocked zones, purchased upgrades, active pet и money.

Финальные stages:

- `EARN_FOR_VIP_ESTATE`;
- `UNLOCK_VIP_ESTATE`;
- `STEAL_VIP_PETS`;
- `RETURN_VIP_PET`;
- `DRAGON_AVAILABLE`;
- `RETURN_DRAGON`;
- `CAMPAIGN_COMPLETE`.

Свободный порядок VIP A/VIP B не создаёт отдельные branches: счёт и missing target выводятся из `deliveredPetIds`. Dragon availability требует оба id. Campaign complete выводится только из доставки `dragon`.

Objectives формируются data-driven и не используют склонение имён: «Укради питомца: X», «Верни питомца на базу: X».

## Zone gates

`ZoneGateDefinition` задаёт стоимость и data-driven required pets/upgrades/zones. `ZoneGateSystem` общий для PARK, CENTRAL HUB, RICH DISTRICT и VIP ESTATE.

VIP gate:

- стоит 800;
- требует RICH DISTRICT, Dog/Cat/Fox/Peacock/Panda, Fast Dash и Double Dash;
- до prerequisites физически закрыт и не становится interaction/navigation target;
- после покупки списывает деньги, уничтожает collider, проигрывает feedback и сохраняет `ZoneId.VipEstate`.

## VIP Estate и Dragon Courtyard

`WorldBuilder` создаёт полноценный prototype VIP Estate: главный gate, центральную аллею, два крыла, фонтан/сад, tower court, редкие растения, охранные позиции и центральный двор.

`DragonCourtyard` владеет двумя visual seal indicators и двумя физическими проходами. Состояние вызывается из `isPetDelivered('vip-a'/'vip-b')`; отдельный save flag не существует. После `2/2` оба barriers уничтожаются, visuals открываются и Dragon encounter становится доступным благодаря `requiredPetIds`.

Navigation markers:

- VIP gate появляется только после prerequisites;
- после открытия показывает обе недоставленные VIP-цели;
- после первой оставляет вторую;
- после `2/2` ведёт к Дракону;
- во время active theft и после победы campaign markers скрыты.

## Victory и RunStats

`RunStatsSystem` — лёгкая pure TypeScript система:

- считает active gameplay elapsed time с clamp 100 мс/frame;
- не считает hidden tab, victory overlay и post-completion time;
- считает failed thefts и successful deliveries;
- отмечает campaign completion для итоговой статистики, но gameplay victory по-прежнему выводится из delivered Dragon.

`VictoryOverlay` — Phaser UI без отдельного framework. Он создаётся один раз и не обновляет строки каждый frame. Показывает title, число питомцев, время, failures и итоговый income.

- Continue закрывает overlay и возвращает free roam.
- New Game включает confirmation; подтверждение очищает save и безопасно reload-ит игру.
- Enter/N/Escape и pointer/touch поддерживаются.
- Полный save не показывает overlay автоматически после reload.

## Сохранение v2

Ключ: `steal-a-pet.save.v2`.

```text
saveVersion: 2
money
deliveredPetIds[]
unlockedZones[]
purchasedUpgradeIds[]
runStats? {
  elapsedMs
  failedThefts
  successfulDeliveries
  campaignCompleted
}
```

`runStats` optional, поэтому корректный Stage 4 save остаётся v2 и получает safe defaults. V1 migration сохранена.

Validation требует:

- последовательность PARK → HUB → RICH;
- Fast Dash после Fox;
- Double Dash после Peacock/Panda + Fast Dash;
- VIP Estate после RICH, первых пяти pets и обоих upgrades;
- `vip-a`/`vip-b` только после VIP unlock;
- `dragon` только после VIP unlock и обоих VIP pets;
- при наличии run stats `campaignCompleted` согласован с Dragon fact.

Не сохраняются active theft, pursuer states, pending alarms, dash charges и overlay state.

## Runtime performance

- Phaser loop: `target: 60`, `limit: 60`.
- Movement, chase и following остаются delta/time based.
- HUD money/objective/prompt использует dirty strings.
- Dash bar/ring квантизированы на 24 шага.
- Income cached; economy delta clamped.
- Pet idle visuals throttled; idle owners обновляют визуал не чаще 10 раз/сек.
- Developer DOM и F2 обновляются 4 раза/сек только при изменении текста.
- Повторяющиеся Rich/VIP decorations используют generated textures.
- Idle pursuers не выполняют physics path calculations; недоступные encounters не вычисляют activation logic.
- Victory overlay не выполняет frame-by-frame text generation.

Большие ground Graphics пока не переведены в chunk textures: текущий world остаётся ограниченным числом слоёв, а предыдущий профиль не показал отдельного Graphics bottleneck. Перепроверка нужна на реальном мобильном GPU.

## Debug и tests

`?dev=1` предоставляет data-driven кнопки всех pet targets, gates, VIP prerequisites, +800, три catch actions, quick delivery, seal state и run stats. Dev panel отсутствует в обычном runtime.

Vitest покрывает:

- single/double dash и hidden-tab recharge shift;
- Rich/VIP gate prerequisites;
- оба порядка Rich и VIP pets;
- Dragon availability и campaign completion;
- Stage 3/4/final save validation;
- old-save run stats defaults;
- upgrade prerequisites.

Phaser rendering не unit-тестируется; layout, encounters, overlay и mobile UI проверяются в production preview.

## Не реализовано

- production brainrot identities и sprite sheets;
- финальный UI art, audio, music;
- SDK Яндекс Игр, реклама, cloud save;
- магазин, строительство, inventory, combat, health, stealth;
- navmesh или сложный pathfinding;
- новые зоны, pets или upgrades после кампании;
- lint и полноценные Phaser integration tests;
- production bundle splitting и финальный профиль на целевых телефонах.
