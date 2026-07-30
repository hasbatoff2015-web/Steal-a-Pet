# Последний выполненный этап

Этап 2 — Progression, Park Unlock and Multiple Pets.

## Что сделано

- Сохранён и расширен core loop Этапа 1: кража, following, погоня, поимка, повторная попытка и доставка работают для нескольких encounters.
- Добавлена первая прогрессионная арка: Собака → доход → 25 монет → открытие PARK → Кот → суммарный доход → цель CENTRAL HUB.
- Добавлен отдельный `ProgressionSystem` с этапами `FIRST_PET`, `EARN_FOR_PARK`, `UNLOCK_PARK`, `STEAL_PARK_PET`, `RETURN_PARK_PET`, `PARK_COMPLETE`.
- Созданы централизованные definitions питомцев, четырёх редкостей, encounters и zone gates.
- Собака имеет редкость `COMMON` и доход `+1/сек`; Кот — `UNCOMMON` и `+2/сек`.
- Добавлен Кот с отдельным силуэтом, размером, цветом и idle motion.
- `CoreLoopSystem` расширен до одной активной кражи среди нескольких encounters без отдельного сценария на каждый вид.
- Каждый encounter связывает конкретные `Pet`, `OwnerNpc`, домашние позиции и параметры `ChaseSystem`.
- PARK физически закрыт воротами на мосту и открывается contextual interaction за 25 монет; деньги реально списываются.
- Реализована reusable модель `ZoneGateDefinition` / `ZoneGate` / `ZoneGateSystem`, пригодная для следующих зон.
- PARK наполнен отличимым prototype-окружением: дорожки, деревья, кусты, пруд, лавочки, павильон и отдельная NPC-зона.
- Восточная prototype-граница PARK блокирует обход закрытого моста.
- Погоня владельца Кота использует существующую систему с отдельными data-параметрами: чуть большей скоростью и меньшим head-start.
- Доставленные Собака и Кот остаются видимыми в разных местах базы и продолжают idle movement.
- `EconomySystem` поддерживает несколько источников, `canAfford`, `spend` и суммарный доход `+3/сек`.
- HUD автоматически показывает цель текущего этапа прогрессии; markers ведут к PARK, Коту и затем к CENTRAL HUB.
- Mobile contextual interaction работает для покупки PARK и кражи Кота; существующие joystick, dash и multitouch-конфигурация сохранены.
- Добавлен `SaveSystem` с `saveVersion: 1`, периодическим сохранением денег и сохранением после ключевых событий.
- После reload восстанавливаются деньги, PARK, доставленные питомцы, их места на базе, источники дохода, этап и objective.
- Отсутствующий или повреждённый save безопасно заменяется новой игрой.
- В `?dev=1` добавлены F4 и `RESET SAVE`, а также инструменты перехода к обоим encounters и gate.
- Обновлены GDD, карта, экономика, фактическая архитектура и журнал долгосрочных решений.

## Изменённые/созданные файлы

Созданы:

- `src/game/data/encounters.ts`
- `src/game/data/pets.ts`
- `src/game/data/zones.ts`
- `src/game/systems/PetEncounter.ts`
- `src/game/systems/ProgressionSystem.ts`
- `src/game/systems/SaveSystem.ts`
- `src/game/systems/ZoneGateSystem.ts`
- `src/game/world/ZoneGate.ts`

Изменены:

- `src/game/config/gameplay.ts`
- `src/game/data/worldLayout.ts`
- `src/game/entities/OwnerNpc.ts`
- `src/game/entities/Pet.ts`
- `src/game/input/InputController.ts`
- `src/game/input/VirtualControls.ts`
- `src/game/scenes/WorldScene.ts`
- `src/game/systems/BaseSystem.ts`
- `src/game/systems/ChaseSystem.ts`
- `src/game/systems/CoreLoopSystem.ts`
- `src/game/systems/EconomySystem.ts`
- `src/game/ui/Hud.ts`
- `src/game/utils/DeveloperTools.ts`
- `src/game/utils/createPrototypeTextures.ts`
- `src/game/world/WorldBuilder.ts`
- `docs/GAME_DESIGN.md`
- `docs/MAP.md`
- `docs/ECONOMY.md`
- `docs/TECH_ARCHITECTURE.md`
- `docs/DEVELOPMENT_LOG.md`
- `tasks/CURRENT_TASK.md`
- `tasks/LAST_REPORT.md`

## Технические решения

- `PetDefinition` хранит id, имя, редкость, доход, visual key, prototype color и зону. Игровые классы не дублируют баланс.
- `PetEncounterDefinition` связывает питомца, владельца, домашние координаты и настраиваемые параметры погони.
- `PetEncounter` инкапсулирует runtime-связь `Pet + OwnerNpc + ChaseSystem`; глобальная прогрессия и экономика остаются снаружи.
- `CoreLoopSystem` хранит только текущий active encounter. При поимке питомец возвращается к своему encounter, при доставке помещается в data-defined base slot, затем active theft очищается.
- `ProgressionSystem` отделён от HUD, Player и Economy. Objective выводится из доставленных питомцев, открытых зон, денег и активной кражи.
- Gate состоит из data definition, world object и system. Коллизия удаляется только после успешного списания цены и открытия зоны.
- `EconomySystem` использует именованные источники дохода, поэтому повторное восстановление одного питомца не удваивает доход.
- Save key: `steal-a-pet.save.v1`. Формат содержит `saveVersion`, `money`, `parkUnlocked`, `deliveredPetIds`, `unlockedZones`, `campaignStage`.
- Запись save происходит после доставки/открытия, раз в 5 секунд для денег и перед закрытием; запись каждый кадр исключена.
- При загрузке состояние мира восстанавливается из фактов сохранения, включая Pet states, gate collider и income sources.
- Breadcrumb-following Этапа 1 используется текущим активным питомцем без дополнительных update loops и игровых breadcrumb-объектов.

## Проверки

Запускалось:

- `npm run typecheck` — успешно, ошибок TypeScript нет.
- `npm run build` — успешно; Vite обработал 32 модуля и создал production-сборку.
- `git diff --check` — успешно, whitespace errors нет.
- Проверено, что `dist/` и `node_modules/` не входят в изменённые/добавленные файлы Git.

Desktop runtime:

- новая игра с 0 монет, закрытым PARK, Собакой и физически недоступным Котом;
- кража Собаки, following, старт погони, поимка, возврат и повторная попытка;
- доставка Собаки и фактический доход около `+1/сек`;
- запрет покупки до 25 монет и сообщение «Нужно 25 монет»;
- накопление 25 монет, списание 25 и удаление физической коллизии gate;
- переход в PARK и отдельный визуальный язык зоны;
- кража Кота, более быстрый владелец, поимка и повторная попытка;
- доставка Кота, оба питомца в отдельных slots и суммарный доход около `+3/сек`;
- celebratory message PARK и следующая цель CENTRAL HUB;
- reload после периодического save: деньги, PARK, оба питомца, income sources и objective восстановлены;
- dev reset: новая игра восстановлена с 0 монет, закрытым PARK и обоими питомцами на NPC-позициях.

Mobile/runtime:

- mobile HUD визуально проверен на ширине 320 px и в portrait 390 px: objective, money и controls не пересекаются;
- верхний desktop dash indicator отсутствует, cooldown виден затемнением и восстанавливающимся кольцом на кнопке «РЫВОК»;
- joystick реагирует на pointer drag;
- contextual touch-кнопкой выполнены кража Собаки, покупка PARK и кража Кота;
- строка активного дохода помещается в отдельную money panel;
- resize/orientation layout пересчитывается существующей responsive-системой.

Накопление 25 монет при `+1/сек` в runtime занимает примерно 25 секунд. За время теста оно не выглядело сломанным или чрезмерным, цена не менялась; окончательное ощущение темпа требует review Game Director.

## Остались проблемы

- Vite сохраняет предупреждение о Phaser bundle больше 500 kB. Сборка успешна; это не runtime-ошибка, но production-оптимизацию нужно выполнить ближе к публикации.
- Автоматизированная browser-среда не воспроизводит настоящее одновременное удержание двумя физическими пальцами. Независимые pointer ID, `activePointers: 3` и отдельные touch interactions сохранены; нужен короткий hands-on тест joystick + purchase/theft на реальном телефоне.
- Погони используют прямое Arcade Physics-преследование и открытые маршруты. Это соответствует этапу, но фактическая сложность PARK-погони требует игрового playtest.
- Автоматические unit/integration tests и lint пока не настроены.

## Требуется решение Game Director

- Оценить темп ожидания 25 монет и не менять утверждённые значения без нового решения.
- Оценить сложность погони Кота относительно Собаки и при необходимости назначить балансировочные значения.
- Принять визуальную читаемость PARK, gate, Кота и навигационных markers как prototype layout.
- Подтвердить этап после короткой проверки на реальном touch-устройстве.

## Предложения Codex

- После принятия этапа зафиксировать результаты playtest как data-правки encounter/gate definitions без изменения архитектуры.
- До появления несовместимого формата сохранения определить простое правило миграции с `saveVersion: 1` на следующую версию.
