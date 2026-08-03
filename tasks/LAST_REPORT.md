# Последний выполненный этап

Этап 5 — VIP Estate, Final Heist and Campaign Completion.

## Что сделано

- `VIP ESTATE` превращён из preview в полноценную prototype-зону: gate за 800 монет, центральная аллея, западное и восточное крыло, сады, фонтаны, охранные посты и закрытый двор Дракона.
- Gate использует общую data-driven модель и требует RICH DISTRICT, пять доставленных питомцев, Fast Dash и Double Dash. Деньги реально списываются, а физическая коллизия прохода снимается.
- Добавлены стабильные gameplay ids `vip-a`, `vip-b`, `dragon`. Временные имена, визуальные ключи, редкость, доход и prototype motion хранятся в `PetDefinition`, поэтому замена персонажей не требует менять progression или encounters.
- Добавлены два независимых VIP encounters. Золотая Капибара `RARE` даёт `+24/сек`, Королевская Сова `RARE` — `+36/сек`; их можно доставить в любом порядке.
- Каждый VIP-питомец отключает один визуальный seal. При `2/2` центральный двор физически открывается и появляется цель Дракона.
- Финальная кража Дракона использует существующую модель `pursuers[]`: boss стартует сразу, Guard A — через 700 мс, Guard B — через 1400 мс. Поимка любым активным NPC обрабатывается один раз, отменяет остальные delayed activations и оставляет возможность повторной попытки.
- Для дальних VIP/Dragon pursuers добавлен data-driven визуальный reset через 6 секунд после начала возврата. Обычные encounters Этапов 1–4 продолжают использовать прежнее поведение.
- База расширена до восьми раздельных slots. Все питомцы видимы, имеют лёгкое idle-движение; Дракон занимает выделенное крупное место. Итоговый доход после кампании — `+192/сек`.
- `ProgressionSystem` расширен до `CAMPAIGN_COMPLETE`. Порядок VIP-питомцев выводится из `deliveredPetIds`, без отдельных комбинаторных веток.
- Добавлен `RunStatsSystem`: активное время прохождения, успешные доставки, провалы и факт завершения. Скрытое/paused время не начисляется, а abnormal delta ограничен.
- Save остаётся `saveVersion: 2`; `runStats` добавлен как совместимое optional-поле. Старые корректные Stage 4 saves принимаются с безопасными defaults, а нелогичные VIP/Dragon facts отклоняются.
- После доставки Дракона показывается responsive victory overlay со статистикой, действиями «Продолжить играть» и подтверждаемым «Начать заново». Continue переводит игру в свободное исследование; полный save при reload восстанавливается без повторного overlay.
- Dev-инструменты расширены переходами к VIP/Dragon, подготовкой prerequisites, выдачей 800 монет и проверкой третьего преследователя.
- HUD проверен с итоговой строкой `+192/сек`; для landscape добавлен безопасный зазор между money и objective panels.
- Создан подробный `docs/ASSET_PLAN.md` для последующей замены prototype-графики. Финальные изображения и Stage 6 не создавались.

## Изменённые/созданные файлы

Созданы:

- `docs/ASSET_PLAN.md`
- `src/game/systems/RunStatsSystem.ts`
- `src/game/ui/VictoryOverlay.ts`
- `src/game/world/DragonCourtyard.ts`
- `tests/run-stats.test.ts`

Удалён устаревший preview:

- `src/game/world/VipEstatePreview.ts`

Основные изменённые файлы:

- `index.html`, `README.md`
- `src/game/data/encounters.ts`
- `src/game/data/pets.ts`
- `src/game/data/worldLayout.ts`
- `src/game/data/zones.ts`
- `src/game/entities/OwnerNpc.ts`
- `src/game/entities/Pet.ts`
- `src/game/entities/Player.ts`
- `src/game/scenes/WorldScene.ts`
- `src/game/systems/CoreLoopSystem.ts`
- `src/game/systems/DashChargeController.ts`
- `src/game/systems/EconomySystem.ts`
- `src/game/systems/PetEncounter.ts`
- `src/game/systems/ProgressionSystem.ts`
- `src/game/systems/SaveSystem.ts`
- `src/game/ui/Hud.ts`
- `src/game/utils/DeveloperTools.ts`
- `src/game/utils/createPrototypeTextures.ts`
- `src/game/world/WorldBuilder.ts`
- `tests/dash-charges.test.ts`
- `tests/gate-prerequisites.test.ts`
- `tests/progression.test.ts`
- `tests/save-validation.test.ts`
- `docs/ART_DIRECTION.md`
- `docs/DEVELOPMENT_LOG.md`
- `docs/ECONOMY.md`
- `docs/GAME_DESIGN.md`
- `docs/MAP.md`
- `docs/TECH_ARCHITECTURE.md`
- `tasks/CURRENT_TASK.md`
- `tasks/LAST_REPORT.md`

## Технические решения

- Стабильный `PetId` является связующим ключом для definitions, encounters, progression, saves, base slots и navigation. `displayName` и `visualKey` остаются заменяемыми данными.
- `PetEncounterDefinition` получил `requiredPetIds`, индивидуальные activation messages и `returnResetAfterMs`; финальная погоня не имеет отдельной boss-only системы.
- `CoreLoopSystem` хранит только текущий active encounter и индексирует все encounters по `PetId`. Доставка, провал и delayed pursuers проходят через один общий жизненный цикл.
- Состояние двух seals выводится из фактов доставки `vip-a`/`vip-b`; transient состояние замков не дублируется в save.
- Campaign completion выводится из доставки `dragon`. Victory overlay является presentation-слоем и не хранится в save.
- `RunStatsSystem` обновляется централизованно из сцены и событий core loop; UI только отображает готовый snapshot.
- При `visibilitychange` physics приостанавливается, save фиксируется, а после возврата сдвигаются абсолютные timestamps dash/encounters и очищается breadcrumb history.
- Экономика сохраняет cached total income; pet/NPC prototype idle visuals обновляются с ограниченной частотой, чтобы восемь питомцев и три финальных pursuer не создавали лишнюю нагрузку.
- `main` получил keyboard focus target (`tabindex`) для более надёжного desktop-ввода после взаимодействия с canvas.

## Проверки

- Baseline до изменений: `npm run typecheck`, 5 test files / 11 tests и `npm run build` проходили.
- Финальный `npm run typecheck`: успешно.
- Финальный `npm run test`: успешно, 6 test files / 23 tests.
- Финальный `npm run build`: успешно, 39 modules; bundle `1,502.00 kB`, gzip `391.61 kB`.
- `npm run dev -- --host 127.0.0.1 --port 5174`: сервер ответил HTTP 200.
- `npm run preview`: production build ответил HTTP 200 на `127.0.0.1:4173`.
- `git diff --check`: успешно; только предупреждения Git о будущей нормализации LF → CRLF.
- Browser console: ошибок и warning приложения не обнаружено; присутствуют только информационные сообщения Phaser.
- Runtime новой игры/Stage 4 compatibility: dev reset начинает с 0 монет и восьми world pets; V1 migration восстановила Dog/Cat, PARK и `+3/сек`; валидный Stage 4 v2 дополнительно покрыт unit test.
- VIP gate: prerequisites, цена 800, списание и физическое открытие проверены в production preview.
- Обе очередности VIP-питомцев покрыты unit test и runtime: A → B и B → A. После первого питомца было `1/2`, после второго — `2/2`, доход менялся `+32 → +56/+68 → +92` в зависимости от порядка.
- Dragon chase: подтверждена активация boss, Guard A и Guard B; отдельная поимка Guard B вернула Дракона, увеличила fail count ровно один раз, отменила погоню и позволила retry после визуального reset.
- Победа: доставка Дракона дала восемь питомцев, `+192/сек`, `CAMPAIGN_COMPLETE`, статистику и victory overlay. Continue через Enter вернул free roam. Reload полного save восстановил восемь питомцев, все zones/upgrades, seals `2/2`, dash `2/2`, доход `+192/сек` и completed objective без повторного overlay.
- Mobile layout проверен на ширинах 320, 360 и 430 px, а также landscape `844×430`: objective, money `+192/сек` и dash button не пересекаются. Узкий victory layout визуально помещается в canvas; dev HTML-панель частично перекрывает его только в `?dev=1` и отсутствует в обычной игре.
- Simultaneous touch опирается на сохранённый `activePointers: 3`; новые VIP/Dragon interactions используют тот же contextual action path, что проверенные gate/theft interactions предыдущих этапов. Полноценное аппаратное multi-touch двумя пальцами автоматизировать в текущем browser harness нельзя.
- Наблюдаемая производительность production preview в in-app Chromium: обычно около 47–50 FPS / 20–22 мс с восемью питомцами на базе; во время Dragon chase ранее наблюдалось около 57 FPS / 17,4 мс. Target/limit 60 сохранён. Результат зависит от нагрузки browser automation и требует проверки на целевых телефонах.
- Ускоренный dev QA run с teleport завершился за `1:06`, но это не является реальным временем кампании. Полное прохождение без teleport и dev money в этой сессии надёжно измерить не удалось; значение не выдумывалось.

## Остались проблемы

- Vite предупреждает о единственном minified chunk больше 500 kB. Основная причина — Phaser; build корректен. Code splitting можно рассмотреть перед публикацией, если появится измеримая проблема загрузки.
- В in-app Chromium с полной базой observed FPS иногда находится в диапазоне 45–50, хотя loop ограничен 60. Явных runtime allocations или console errors не найдено; необходим замер на нескольких реальных мобильных устройствах.
- Фактические prototype-расстояния внутри выделенного северо-восточного сектора VIP Estate дают примерно 3–5 секунд прямого движения от gate до ближайшего крыла и между крыльями, а не ориентир 10–18 секунд. При мире `3840×2560`, скорости игрока 230 px/с и требовании не создавать лабиринт этот ориентир конфликтует с компактной геометрией зоны. Скорость, размер мира и утверждённую карту самостоятельно не менял.
- Реальное время полного прохождения без teleport не измерено. Нужен ручной balance/playability pass Game Director на чистом save.
- Кнопка Continue проверена runtime. Confirmation flow New Game реализован и использует тот же `SaveSystem.clear()`/reload path, что dev reset, но полный pointer test обеих кнопок на обычном mobile viewport следует повторить без dev overlay.

## Требуется решение Game Director

- Подтвердить или скорректировать требование 10–18 секунд внутри VIP Estate с учётом фиксированного мира и текущей скорости игрока. Возможные изменения затрагивают утверждённую карту/скорость и поэтому не внесены молча.
- Провести ручное полное прохождение без dev tools, зафиксировать реальное время кампании и ощущения от накопления 800 монет.
- Проверить simultaneous joystick + dash/interaction на реальном touch-устройстве и обе кнопки victory overlay.
- Утвердить либо заменить временные образы `vip-a`, `vip-b` и `dragon` до начала производства финальных ассетов.

## Предложения Codex

- После review Этапа 5 использовать `docs/ASSET_PLAN.md` для одного ограниченного visual pilot: один персонаж, один питомец, один небольшой участок зоны и HUD. Не начинать массовое производство ассетов до проверки масштаба, origins, collision footprint и читаемости на 320 px.
- Перед публикационной оптимизацией снять WebGL/profile trace на целевом Android-устройстве; менять render architecture или chunking только по результатам измерения.
