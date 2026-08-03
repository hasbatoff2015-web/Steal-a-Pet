# Техническая архитектура

## Фактический стек

- Phaser `4.2.1`, Arcade Physics;
- TypeScript `7.0.2` со strict-настройками;
- Vite `8.2.0`;
- Vitest `4.1.10`;
- npm и статическая browser build без серверной логики.

Команды: `npm run dev`, `npm run typecheck`, `npm test`, `npm run build`, `npm run preview`.

GameConfig использует resize, три active touch pointers и loop target/limit 60 FPS. Мир `4608 × 3072`, камера ограничена bounds и следует за игроком.

## Структура

```text
src/game/
  config/       Phaser и gameplay constants
  data/         pets, encounters, roaming, upgrades, zones, shortcuts, layout, prerequisites
  entities/     Player, Pet, OwnerNpc
  input/        keyboard/touch abstraction и VirtualControls
  scenes/       WorldScene composition root
  systems/      core loop, AI, chase, progression, economy, save, upgrades, telemetry
  ui/           HUD и VictoryOverlay
  utils/        prototype textures и dev tools
  world/        WorldBuilder и физические world interactables
tests/          pure/data/system unit tests
```

## Composition root

`WorldScene` создаёт системы и связывает их через узкие context/callback interfaces. Scene управляет lifecycle, camera/physics/visibility/save cadence; gameplay rules остаются в data и системах.

## Entities и heist encounters

- `Player` нормализует keyboard/touch movement, использует Arcade velocity, отдельный `DashChargeController`; Runner multiplier влияет только на обычное движение.
- `Pet` — общая world-сущность HEIST и ROAMING после захвата: following через `PlayerPathHistory`, base idle, income feedback и Y-depth.
- `OwnerNpc` + `ChaseSystem` реализуют существующие pursuits/return/reset; скорости encounters Этапа 5 не менялись. CHASING использует отдельный `PursuerNavigation`: дешёвый LOS выбирает прямую погоню, а при перекрытии пути — authored graph текущего encounter.
- `PetEncounter` поддерживает массив pursuers. Quiet Shoes передаёт data-driven timing bonuses один раз при старте кражи.

### Навигация погони

`chaseNavigation.ts` хранит малые data-driven graphs для Starter, PARK pavilion, CENTRAL HUB, обеих RICH усадеб, обоих VIP крыльев и Dragon Courtyard. Pursuer ссылается на graph id и необязательный lane bias; encounter-specific ветвлений в `ChaseSystem` нет.

`ChaseNavigation.ts` содержит чистую геометрию segment/rectangle LOS, скомпилированный adjacency graph, A* и простое path smoothing. Крупные физические препятствия регистрируются `WorldBuilder` одновременно как collision object и упрощённый navigation blocker, поэтому LOS соответствует фактическим стенам. Уничтоженный barrier автоматически перестаёт блокировать LOS.

При открытом LOS NPC идёт к фактической позиции Player. При закрытом LOS маршрут перестраивается не чаще одного раза в `220 ms`; authored edges доверяются как проверенные проходы, а gate-conditioned edges доступны только при открытом PARK/CENTRAL/RICH/VIP gate или снятой защите Dragon Courtyard. LOS и smoothing продолжают проверять реальные blocker bounds. Node считается достигнутым в радиусе `34 px`.

Lane bias `-1/0/1` разводит равноценные левые/правые маршруты владельцев и guards без cooperative AI. Stuck detector дискретно проверяет движение и сокращение дистанции: сначала форсирует repath, затем исключает неудачный стартовый node, и только после повторного застревания допускает reset на видимый безопасный node не ближе `460 px` к Player. RETURNING по-прежнему использует прежние проверенные return routes и не строит A*.

## Roaming AI

`roamingPets.ts` содержит шесть `RoamingPetDefinition`: стабильный id, зона/территория, spawn, waypoint graph, behavior profile, capture mode и base slot.

`RoamingAiModel` — чистая тестируемая state model: IDLE, WANDERING, ALERT, FLEEING, TIRED, FOLLOWING, AT_PLAYER_BASE, RESETTING. Она управляет stamina/tired/recovery и не знает Phaser/экономику.

`RoamingPetController` связывает model и `Pet`, выбирает только соседние graph nodes, применяет лёгкую случайность и fail-safe при выходе из territory bounds/отсутствии прогресса. Offscreen update ограничен примерно 3.3 раза/сек; waypoint maps создаются один раз.

`RoamingPetSystem` обновляет контроллеры единым loop, применяет Lure modifiers и хранит единственный active capture. Транзиентные AI state/stamina/current waypoint не сохраняются; недоставленный pet после reload возвращается в свою территорию.

## Core loop и прогрессия

`CoreLoopSystem` арбитрирует взаимодействия: один active heist или roaming follow блокирует gates/stations/другие captures. Доставка обоих источников регистрирует общий `PetId`, income и base slot.

`ProgressionSystem` выводит stage/objective из delivered pets, unlocked zones, upgrades, денег и roaming count. Победа выводится из `dragon` delivered.

`prerequisites.ts` — общий evaluator required pets/upgrades/zones/roaming count. `ZoneGateSystem` и `UpgradeSystem` используют одну модель; добавление definition не требует encounter-specific switch в CoreLoop.

## Upgrades и stations

`UpgradeDefinition.effects[]` поддерживает DashCooldownMs, MaxDashCharges, MoveSpeedMultiplier, три Roaming multipliers, два Theft timing bonuses и TrackerEnabled.

Три `UpgradeStation` имеют branch id MOBILITY/TRACKING/STEALTH и dirty-rendered состояния. `PetTrackerSystem` разделяет target selection и visual transform: ближайшая доступная цель кэшируется с частотой 4 Гц, а world-space marker каждый кадр математически привязывается к текущей позиции Player и текущей позиции cached target. Marker не имеет physics body/tween/Text, состоит из ring диаметром `44 px` со stroke `3 px` и стрелки `14 px`, находится на `44 px` ниже центра Player и слегка увеличивается на mobile. Он скрывается при active carry, закрытой/отсутствующей цели и victory overlay.

## World

`WorldBuilder` создаёт prototype textures, статические ground/road/territory layers, collision geometry, четыре zone gates, четыре derived shortcuts, расширенную базу, три stations, markers и Dragon Courtyard. Единая texture размера мира не создаётся. Динамические объекты используют Y-depth.

## Economy

`EconomySystem` отделён от HUD, хранит money и Map income sources. Total income кэшируется при add/remove. Значения читаются из `PetDefinition`; действует `balanceRevision: 2`.

## Save v3

Ключ: `steal-a-pet.save.v3`.

```ts
{
  saveVersion: 3,
  balanceRevision: 2,
  money,
  deliveredPetIds,
  unlockedZones,
  purchasedUpgradeIds,
  grandfatheredZoneIds,
  grandfatheredUpgradeIds,
  runStats?: { elapsedMs, failures, deliveries, roaming counters, purchases, milestones }
}
```

Validation проверяет типы, уникальность и логические зависимости. v2 и прежний v1 мигрируются в v3. Уже открытые v2 zones/upgrades grandfathered без выдачи roaming pets; old completed Dragon save остаётся победой. Income totals, active AI/pet/pursuers, dash charges, tracker target и UI state не сохраняются.

## UI, telemetry и performance

- HUD использует dirty text и quantized dash graphics; mobile cooldown находится на touch button.
- VirtualControls поддерживает joystick + dash/interaction разными pointers.
- `RunStatsSystem` считает только active visible gameplay и хранит one-shot milestones.
- `?playtest=1` без dev показывает compact snapshot ≤4 Hz и формирует обезличенный отчёт; existing progress помечает время invalid.
- `?dev=1` содержит QA tools и всегда выводит `DEV RUN — TIME INVALID`.
- Debug/DOM refresh ограничены 4 Hz; economy/UI не выполняют лишних rebuild каждый frame.

## Реализовано

Восемь heist encounters, шесть roaming captures, 14 base pets, gates/shortcuts, шесть upgrades в трёх ветках, save migration, victory/post-victory collection, desktop/mobile input, debug/playtest tooling, tests и prototype graphics.

## Не реализовано

Production art, audio, Yandex SDK, ads, cloud save, analytics upload, localization framework, minimap, navmesh, combat, inventory и финальная device-performance сертификация.
