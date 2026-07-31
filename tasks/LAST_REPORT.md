# Последний выполненный этап

Этап 2 — Performance Optimization Pass.

## Что сделано

- Игровой цикл Phaser явно ограничен максимумом 60 FPS через `target: 60` и `limit: 60`; движение, dash, погоня и экономика остались time/delta-based.
- HUD переведён на dirty updates: деньги, цель, contextual prompt и visibility меняются только при изменении отображаемого состояния.
- Desktop и mobile cooldown dash квантизированы на 24 визуальных шага; `Graphics` больше не очищаются и не рисуются заново каждый кадр.
- Debug overlay F2 и HTML DeveloperTools обновляются не чаще четырёх раз в секунду и не присваивают повторно неизменившийся текст.
- В F2/dev snapshot добавлены current FPS, rolling FPS и frame time.
- `EconomySystem` кэширует суммарный доход и пересчитывает его только при добавлении, замене или удалении источника.
- Убраны безопасные лишние операции в основном update path: переиспользуются `FrameInput` и joystick `Vector2`, видимость progression-маркера меняется только при переходе состояния, idle NPC не повторяет неизменные physics/visual setters.
- Добавлен `npm run preview` для проверки production build.
- Проведён аудит статического мира. Текущие постоянные `Graphics` и количество объектов не показали подтверждённого GPU bottleneck, поэтому карту не переписывали в texture chunks без необходимости.
- Геймдизайн, карта, баланс, скорости, цена PARK, доходы и механики кражи/погони не изменялись.

## Изменённые/созданные файлы

- `src/game/config/gameConfig.ts`
- `src/game/entities/OwnerNpc.ts`
- `src/game/input/InputController.ts`
- `src/game/input/VirtualControls.ts`
- `src/game/scenes/WorldScene.ts`
- `src/game/systems/CoreLoopSystem.ts`
- `src/game/systems/EconomySystem.ts`
- `src/game/ui/Hud.ts`
- `src/game/utils/DeveloperTools.ts`
- `package.json`
- `README.md`
- `docs/TECH_ARCHITECTURE.md`
- `docs/DEVELOPMENT_LOG.md`
- `tasks/CURRENT_TASK.md`
- `tasks/LAST_REPORT.md`

## Технические решения

- Phaser loop использует 60 FPS как целевой и максимальный update rate без перехода на 30 FPS.
- Текстовые компоненты хранят последнюю реально показанную строку и вызывают `setText` только при изменении.
- Cooldown использует 24 шага: визуально остаётся плавным, но число перерисовок ограничено реальными изменениями шага.
- Performance sampling работает с интервалом 250 мс. Rolling FPS рассчитывается сглаживанием, frame time — по фактическим update delta.
- Суммарный income является производным кэшем `EconomySystem`; HUD читает готовое значение и не обходит Map.
- Большие prototype Graphics пока оставлены как есть: baseline подтвердил достаточный запас до лимита, а chunked textures добавили бы крупный рискованный rewrite без измеренной пользы.

## Проверки

До оптимизации в автоматизированной browser-среде loop был неограниченным и заметно менялся между сценариями:

- обычный STARTER SUBURB: около 82 FPS / 12,2 мс;
- dev STARTER SUBURB: около 170 FPS / 5,9 мс;
- погоня: около 172 FPS / 5,8 мс;
- PARK: около 171 FPS / 5,85 мс;
- оба питомца на базе: около 170 FPS / 5,9 мс.

Эти значения показывали лишнюю частоту update, а не полезную частоту выше частоты экрана.

После оптимизации:

- dev, оба питомца на базе: current 60 FPS, rolling 57,3 FPS, 16,73 мс;
- обычный dev runtime: current 60 FPS, rolling 57,5 FPS, 16,79 мс;
- production preview после чистой загрузки: current 59 FPS, rolling 57,7–59,1 FPS, 16,84–16,89 мс;
- dev snapshot подтверждает `limit=60`.

Во время активных действий browser automation встречались краткие выборки 45–47 FPS / 21–22 мс из-за нагрузки инструмента и фонового планирования вкладки; после прекращения автоматизации показатели возвращались к 59–60 FPS.

Запускалось:

- `npm run typecheck` — успешно, ошибок TypeScript нет.
- `npm run build` — успешно, production bundle создан.
- `npm run preview` — production build успешно запущен и проверен.
- `git diff --check` — успешно, whitespace errors нет.

Runtime проверен в dev и production preview:

- загрузка обычного и `?dev=1` режимов;
- перемещение и dash без изменения наблюдаемой дистанции;
- кража Собаки, погоня, поимка, повторная попытка и доставка;
- покупка PARK и физическое открытие прохода;
- кража и доставка Кота;
- оба питомца на базе и суммарный доход `+3/сек`;
- reload с восстановлением PARK, питомцев, денег, income sources и objective;
- mobile layout 390×780, joystick UI, contextual interaction и cooldown кнопки dash;
- browser console — ошибок и предупреждений runtime не обнаружено.

## Остались проблемы

- Vite по-прежнему предупреждает, что Phaser bundle больше 500 kB. Сборка успешна; это вопрос будущей загрузочной оптимизации, не текущий runtime defect.
- Автоматизированная browser-среда не заменяет profiling на физическом слабом/среднем телефоне и может сама влиять на frame scheduling.
- При дальнейшем наполнении мира статические `Graphics` могут потребовать повторного профилирования и перехода на chunked textures 512–1024 px, но подтверждённой необходимости сейчас нет.
- Lint и автоматические unit/integration tests пока не настроены.

## Требуется решение Game Director

Нет. Для принятия Этапа 2 желательна короткая проверка стабильности и multitouch на реальном мобильном устройстве, но менять утверждённые параметры не требуется.

## Предложения Codex

- Перед добавлением следующего крупного слоя контента записать профиль на одном среднем и одном слабом мобильном устройстве; texture chunking применять только при подтверждённой GPU/render нагрузке.
- При подготовке публикации отдельно проверить стартовый размер Phaser bundle и время загрузки в окружении Яндекс Игр.
