# Последний выполненный этап

Этап 3 — Central Hub, Rare Pet and Player Upgrade.

## Что сделано

- Исправлен soft-lock владельца Кота за павильоном: возврат NPC больше не ограничен прямым движением к home.
- Encounter definitions поддерживают несколько data-driven `returnRoutes`; Owner выбирает ближайшую точку подходящего маршрута и последовательно возвращается домой.
- Добавлен общий return fail-safe для Dog, Cat и Fox: отсутствие прогресса 1,8 секунды или превышение 30 секунд безопасно восстанавливает владельца дома в `IDLE`.
- CENTRAL HUB стал полноценной третьей зоной с physical gate за 75 монет, collider, contextual interaction, сохранением и отдельным prototype-визуалом.
- Добавлены площадь, фонтан-ориентир, широкие дорожки, городские здания, клумбы, фонари и дворик Fox encounter.
- Добавлена Лиса `RARE`: отдельный оранжевый силуэт с вытянутой мордочкой и хвостом, доход `+5/сек`, владелец и encounter.
- Три питомца остаются в отдельных slots базы, используют лёгкое idle movement и периодический income feedback. Общий доход равен `+8/сек`.
- Добавлены `UpgradeDefinition`, `UpgradeSystem` и physical `UpgradeStation` на базе.
- «Быстрый рывок» открывается после Лисы, стоит 50 монет и меняет только dash cooldown `900 → 650 мс`.
- Прогрессия расширена до `CENTRAL_HUB_COMPLETE`; markers ведут только к PARK gate, Cat, CENTRAL HUB gate, Fox или upgrade station, когда цель реально выполнима.
- RICH DISTRICT остаётся физически закрытым preview «Следующий район · скоро» без interaction и active arrow.
- Save переведён на v2 с автоматической миграцией корректного v1 без потери денег, PARK, Dog и Cat.
- Сохранены 60 FPS config, dirty HUD, quantized dash graphics, cached income и throttled dev/debug updates.

## Изменённые/созданные файлы

Созданы:

- `src/game/data/upgrades.ts`
- `src/game/systems/UpgradeSystem.ts`
- `src/game/world/UpgradeStation.ts`

Изменены:

- `src/game/data/encounters.ts`
- `src/game/data/pets.ts`
- `src/game/data/worldLayout.ts`
- `src/game/data/zones.ts`
- `src/game/entities/OwnerNpc.ts`
- `src/game/entities/Pet.ts`
- `src/game/entities/Player.ts`
- `src/game/scenes/WorldScene.ts`
- `src/game/systems/CoreLoopSystem.ts`
- `src/game/systems/ProgressionSystem.ts`
- `src/game/systems/SaveSystem.ts`
- `src/game/systems/ZoneGateSystem.ts`
- `src/game/utils/DeveloperTools.ts`
- `src/game/utils/createPrototypeTextures.ts`
- `src/game/world/WorldBuilder.ts`
- `README.md`
- `docs/GAME_DESIGN.md`
- `docs/MAP.md`
- `docs/ECONOMY.md`
- `docs/TECH_ARCHITECTURE.md`
- `docs/DEVELOPMENT_LOG.md`
- `tasks/CURRENT_TASK.md`
- `tasks/LAST_REPORT.md`

## Технические решения

- `returnRoutes` — набор waypoint-полилиний в encounter data. При `RETURNING` выбираются маршрут и начальный waypoint с минимальной дистанцией до текущей позиции NPC. Простые encounters без маршрутов продолжают использовать прямой home target.
- Для Cat заданы маршруты от STARTER/моста, северной, восточной и южной сторон павильона. Для Fox задан маршрут через мост и CENTRAL HUB gate, а также короткий локальный маршрут из южной части HUB.
- Fail-safe отслеживает уменьшение расстояния до текущей точки. Он не является основным способом навигации и срабатывает только после фактической остановки либо чрезмерно долгого возврата.
- CENTRAL HUB использует существующие `ZoneGate`/`ZoneGateSystem`; prerequisite `cat` хранится в gate definition, а не в HUD.
- Fox использует существующую композицию `Pet + OwnerNpc + ChaseSystem`. Характер погони меняется прежде всего пространством вокруг площади и фонтана; параметры владельца близки к Cat.
- `UpgradeSystem` отделён от Player и Economy UI. Эффект применяется через типизированный `UpgradeEffectTarget`; Player хранит фактический текущий cooldown.
- Save v2 хранит только устойчивые факты: `money`, `deliveredPetIds`, `unlockedZones`, `purchasedUpgradeIds`. Active theft и campaign stage не сохраняются, а objective выводится заново.
- V1 migration читает прежние `money`, `parkUnlocked`, Dog/Cat, zones и валидирует старый stage; новые факты получают безопасные defaults. После миграции сразу записывается v2.
- Dev-only QA дополнен переходами к Fox/HUB/upgrade, Cat return regression positions, управлением деньгами и v1 migration fixture.

## Проверки

Запускалось:

- `npm run typecheck` — успешно.
- `npm run build` — успешно; Vite обработал 35 модулей и создал production bundle.
- `npm run preview` — успешно; production runtime проверен.
- `git diff --check` — успешно на промежуточном и финальном проходах.

Owner return regression:

- Cat fail перед павильоном — owner вернулся в `IDLE`, повторная кража доступна.
- Cat fail за павильоном — маршрут обошёл collision, owner вернулся в `IDLE`.
- Cat fail сбоку — owner вернулся в `IDLE`.
- Cat fail рядом с выходом — owner вернулся в `IDLE`.
- Cat fail далеко от home, на южной стороне моста — owner прошёл маршрут и вернулся в `IDLE`.
- Dog fail → return → повторная кража → доставка — успешно.
- Fox fail → return → повторная кража → доставка — успешно.
- Дальний Fox fail на базе: владелец вернулся через маршрут в `IDLE` примерно за 20 секунд; permanent `RETURNING` не возник.

Полный runtime:

- чистый save, Dog, fail/retry, delivery и `+1/сек`;
- отказ PARK при недостатке денег, покупка за 25 и reload;
- Cat, пять fail-позиций, retry, delivery и общий `+3/сек`;
- отказ CENTRAL HUB при 35 монетах, покупка за 75, collider removal и reload;
- Fox fail/retry, delivery, отдельный slot и общий `+8/сек`;
- отказ Fast Dash при балансе ниже 50, покупка за 50 и reload;
- до upgrade ранний повторный dash блокируется при cooldown 900 мс;
- после upgrade два dash с интервалом более 650 мс срабатывают; reload сохраняет 650 мс;
- после завершения objective показывает RICH DISTRICT как future preview без active marker.

Save checkpoints A–F проверены после Dog, PARK, Cat, CENTRAL HUB, Fox и Fast Dash. Мир, gates, питомцы, income, objective и cooldown восстанавливались. Повторная загрузка не удваивала источники дохода.

Миграция проверена на dev v1 fixture Этапа 2: 31 монета, открытый PARK, доставленные Dog/Cat и stage `PARK_COMPLETE`. После загрузки восстановились `+3/сек`, PARK, оба питомца и objective `EARN_FOR_CENTRAL_HUB`; следующий reload использовал сохранённый v2.

Ориентировочный темп по фактическим расстояниям, скорости и утверждённому доходу:

- новая игра → Dog: около 12–18 секунд;
- Dog → PARK: около 25–30 секунд, включая накопление;
- PARK → Cat: около 12–18 секунд;
- Cat → CENTRAL HUB: около 25–30 секунд, включая накопление 75 при `+3/сек`;
- CENTRAL HUB → Fox: около 18–25 секунд с маршрутом к цели и возвратом;
- Fox → Fast Dash: около 6–10 секунд при `+8/сек`.

Ускоренный automated проход с dev teleport занял около 80 секунд и не считается игровым playtime. Реальный темп требует hands-on review без изменения утверждённых значений.

Performance:

- предыдущий зафиксированный Stage 2 production baseline: 59–60 FPS / 16,7–16,9 мс;
- текущий in-app browser dev, STARTER/база с тремя питомцами: 49–51 FPS / 19,7–20,1 мс;
- текущий dev CENTRAL HUB: около 50 FPS / 19,9 мс;
- production preview с тремя питомцами и upgrade: 49–50 FPS / 20,0–20,3 мс;
- `limit=60` подтверждён, STARTER/PARK/HUB и chase не показали отдельного провала относительно друг друга.

Текущая browser-среда стабильно планировала страницу примерно на 50 Hz и могла сама ограничивать измерение. Новых per-frame `setText`, unconditional `Graphics.clear`, обходов income Map или тяжёлых update loops не добавлено. Статические слои не переписывались без доказанного GPU bottleneck.

Mobile/touch:

- forced `?touch=1` показывает joystick, dash и contextual Fox interaction;
- новые CENTRAL HUB/Fox/upgrade interactions используют тот же независимый action pointer, что PARK/Cat;
- `activePointers: 3`, pointer ownership joystick и responsive HUD сохранены;
- browser automation визуально проверил touch controls, но не смог достоверно воспроизвести два физических пальца и узкий viewport в этой сессии.

## Остались проблемы

- Нужен performance и multitouch playtest на реальном среднем/слабом телефоне: in-app browser в этой сессии работал около 50 Hz и не даёт надёжно отделить scheduling среды от GPU/render стоимости.
- Дальний возврат владельца Fox с базы занимает около 20 секунд. Он завершается корректно и не soft-lockится, но длительность повторной доступности encounter требует UX review без самостоятельного изменения скорости.
- Прямое расстояние от HUB gate до Fox короче целевого интервала 10–20 секунд; маршрут вокруг площади увеличивает путь, но фактическое ощущение требует hands-on review.
- Vite сохраняет предупреждение о Phaser bundle больше 500 kB. Сборка успешна.
- Автоматические unit/integration tests и lint пока не настроены.

## Требуется решение Game Director

- Принять или скорректировать prototype layout CENTRAL HUB и ощущение третьей погони после hands-on playtest.
- Оценить темп сегментов и длительность дальнего return Fox, не меняя утверждённый баланс без отдельного решения.
- Подтвердить mobile multitouch и производительность на реальном устройстве перед закрытием Этапа 3.

## Предложения Codex

- Перед Этапом 4 провести короткий профилируемый playtest на двух Android-классах устройств и записать FPS/frame time в STARTER, PARK, HUB и во время Fox chase.
- Если реальный профиль подтвердит GPU bottleneck, переводить только доказанно тяжёлые статические слои в chunks 512–1024 px, сохраняя entities и collisions отдельными.
- Добавить небольшие автоматические тесты для Save migration, progression derivation и return fail-safe до следующего расширения формата сохранения.
