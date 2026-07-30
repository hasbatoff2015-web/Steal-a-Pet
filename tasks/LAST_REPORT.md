# Последний выполненный этап

## Что сделано

Завершён Этап 1 — Playable Core Vertical Slice.

Из практически пустого репозитория создан запускаемый browser/mobile-first проект на Phaser 4.2.1 + TypeScript 7.0.2 + Vite 8.2.0.

Реализован полный цикл:

`НАЙТИ → УКРАСТЬ → УБЕЖАТЬ → ДОСТАВИТЬ НА БАЗУ → ПОЛУЧАТЬ ДЕНЬГИ`.

### Архитектура

- Одна композиционная `WorldScene`, которая создаёт и связывает модули.
- Отдельные entities: `Player`, `Pet`, `OwnerNpc`.
- Отдельные системы: `CoreLoopSystem`, `ChaseSystem`, `BaseSystem`, `EconomySystem`.
- Отдельные модули input, mobile controls, HUD, конфигурации и построения мира.
- Явные состояния core loop, питомца и NPC без ECS или тяжёлого framework.

### Мир

- Arcade Physics world размером 3840 × 2560 px.
- Прототипная планировка STARTER SUBURB, PARK, CENTRAL HUB, RICH DISTRICT и VIP ESTATE.
- Вода, проходимый мост, дороги, ворота, здания, базы, деревья, кусты и названия зон.
- Камера следует за игроком, ограничена границами мира и адаптирует zoom.
- Вода, здания, крупные деревья и ворота имеют геймплейные коллизии.
- Персонажи и подходящие объекты используют Y-based depth.

### Управление и Player

- `WASD` и стрелки.
- Нормализация диагонального движения.
- `Space` — dash по текущему или последнему направлению.
- Dash имеет cooldown, ускорение, squash/stretch и trail.
- Виртуальный joystick, mobile dash button и contextual interaction button.
- Touch UI адаптируется после resize/orientation change.

### Питомец, NPC и core loop

- Один обычный питомец — Собака.
- Состояния `AT_NPC_BASE`, `FOLLOWING_PLAYER`, `AT_PLAYER_BASE`.
- Contextual prompt `E — УКРАСТЬ` и mobile-кнопка.
- Плавное следование с catch-up скоростью и коррекцией большого отставания.
- После кражи владелец начинает погоню.
- При поимке питомец и NPC возвращаются на NPC-базу, а игрок может повторить попытку без game over.
- При доставке питомец остаётся видимым в delivery zone, погоня завершается, NPC возвращается домой.

### Экономика и UI

- Экономика отделена от HUD и суммирует независимые источники дохода.
- Доставленная Собака добавляет `TECHNICAL PROTOTYPE VALUE` `+1 монета/сек`.
- HUD показывает деньги, доход, текущую цель, dash cooldown, prompts и короткие сообщения.
- После доставки показывается будущая цель PARK.

### Debug

- `F2` включает FPS, координаты игрока и состояния систем.
- `?dev=1` включает выключенную по умолчанию QA-панель для ускоренной проверки core loop.

## Изменённые/созданные файлы

- `.gitignore`
- `index.html`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `vite.config.ts`
- `README.md`
- `src/main.ts`
- `src/style.css`
- `src/game/config/gameConfig.ts`
- `src/game/config/gameplay.ts`
- `src/game/data/worldLayout.ts`
- `src/game/entities/Player.ts`
- `src/game/entities/Pet.ts`
- `src/game/entities/OwnerNpc.ts`
- `src/game/input/InputController.ts`
- `src/game/input/VirtualControls.ts`
- `src/game/scenes/WorldScene.ts`
- `src/game/systems/BaseSystem.ts`
- `src/game/systems/ChaseSystem.ts`
- `src/game/systems/CoreLoopSystem.ts`
- `src/game/systems/EconomySystem.ts`
- `src/game/ui/Hud.ts`
- `src/game/utils/createPrototypeTextures.ts`
- `src/game/utils/DeveloperTools.ts`
- `src/game/world/WorldBuilder.ts`
- `docs/DEVELOPMENT_LOG.md`
- `docs/MAP.md`
- `docs/ECONOMY.md`
- `docs/TECH_ARCHITECTURE.md`
- `tasks/CURRENT_TASK.md`
- `tasks/LAST_REPORT.md`

## Технические решения

- Использована одна сцена мира и небольшие специализированные классы вместо огромного `GameScene`.
- `CoreLoopSystem` координирует системы, но Pet, NPC, economy и UI не управляют глобальной игрой самостоятельно.
- Временная карта и текстуры создаются программно без внешних ассетов.
- Прямое преследование NPC выбрано для открытого прототипного маршрута между двумя базами; navmesh отложен.
- `Vite base` установлен в `./` для статической сборки.
- Сохранение не добавлялось, чтобы не расширять этап; деньги и доставка сбрасываются после reload.
- SDK Яндекс Игр и audio не интегрировались.
- Все параметры движения, dash, погони, следования и дохода вынесены в config/data.
- Head-start NPC после кражи увеличен до 900 мс после browser QA: при меньшем значении игрок мог быть пойман раньше понятной реакции.

## Проверки

- `npm install`: зависимости установлены, `0 vulnerabilities`.
- `npm run typecheck`: успешно, ошибок TypeScript нет.
- `npm run build`: успешно, production build Vite создан.
- Обычный запуск через `npm run dev`: сцена загружается, console errors/warnings отсутствуют.
- Проверены визуальная загрузка карты, база игрока, NPC-база, персонажи, вода, мост, дороги, препятствия и HUD.
- Browser QA подтвердил состояния кражи: Pet `FOLLOWING_PLAYER`, NPC `CHASING`.
- Проверены поимка, возврат питомца, возврат NPC и доступность повторной попытки.
- Проверены успешная доставка, Pet `AT_PLAYER_BASE`, завершение погони и регистрация источника дохода.
- Подтверждено увеличение денег от доставленного питомца.
- Проверены HUD, contextual prompt, сообщения и следующая цель PARK.
- Проверены mobile layout 430 × 800 и landscape layout 844 × 430; controls и HUD перестраиваются без runtime errors.
- Проверен обычный runtime 1280 × 720 после финальной сборки; console errors/warnings отсутствуют.
- Проверены `git diff --check`, состав файлов и отсутствие `node_modules`/`dist` среди tracked files.
- Lint не запускался: lint не добавлялся, чтобы не расширять инфраструктуру первого среза.
- Полноценное удержание клавиш/joystick и прохождение всех коллизионных маршрутов не удалось надёжно автоматизировать в браузерном контроллере; реализация проверена по коду, typecheck и визуальному responsive QA, но требует короткого ручного playtest на desktop и реальном touch-устройстве.

## Остались проблемы

- Точная настройка скорости игрока, dash, NPC и расстояния между базами требует hands-on playtest.
- Прямое преследование NPC рассчитано на открытый маршрут vertical slice и не подходит для будущей сложной карты без дополнительной навигации.
- Состояние не сохраняется после reload.
- Production JS bundle включает Phaser и остаётся крупным; оптимизацию следует оценивать перед публикацией.
- Автоматические тесты и lint пока не настроены.

## Требуется решение Game Director

- Проверить ощущение движения, dash, угрозу NPC и честность 900 мс head-start.
- Проверить удобство joystick и кнопок на реальном мобильном устройстве.
- Проверить prototype layout, путь между базами и вход RICH DISTRICT около `x = 1760`.
- Подтвердить, достаточно ли визуально читаются временные зоны, база, NPC-база и следующая цель PARK.
- Помнить, что `+1 монета/сек` и все числовые параметры являются только technical prototype values.

## Предложения Codex

- Перед расширением контента провести короткий ручной review vertical slice на desktop и телефоне и зафиксировать корректировки управления/погони.
- После утверждения feel добавить небольшие автоматические тесты для переходов core loop и экономики.
- Persistence, SDK Яндекс Игр и полный баланс планировать отдельными этапами, не смешивая их с наполнением карты.
