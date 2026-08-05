# Последний выполненный этап

## Что сделано

- Завершён Этап 7B: все 42 production PNG измерены, originals сохранены, runtime PNG обрезаны без ресемплинга и потери художественного содержимого.
- Исправлен реальный масштаб Player, 14 pets, всех NPC/guards, зданий и декора. Aspect ratio всегда сохраняется.
- Удалена формула растяжения зданий `width * 1.58 / Math.max(...)`; здания получили индивидуальный visible target width и независимый collider.
- Production collider rectangles теперь имеют alpha `0`; stroke создаётся только для процедурного fallback.
- Universal gate PNG больше не поворачивается на 90°: PARK/VIP используют исходную перспективу, HUB/RICH — программные перпендикулярные ворота.
- Убраны постоянные territory/zone/yard/building labels, подписи пруда/площадки/усадеб/VIP-крыльев и открытых shortcuts/gates.
- Navigation marker уменьшен с radius `62` до `30`, текст — с `18` до `14 px`, padding и амплитуда анимации сокращены.
- Добавлены переиспользуемые ground textures и data-driven группы деревьев, кустов, фонарей и машин. Park, Hub, Rich и VIP получили более плотную композицию без новых gameplay colliders.

## Старый и новый видимый масштаб

Полная таблица по каждому PNG находится в `docs/ASSET_BOUNDS_AUDIT.md`.

| Группа | Этап 7A: фактически видимый объект | Этап 7B: visible target |
|---|---:|---:|
| Player | около 69 px по высоте | 90 px canvas target, около 88 px visible |
| Обычные owners | примерно 61–76 px | 88–89 px target |
| Guards | примерно 70–76 px | 89 px target |
| Dragon boss | около 81 px | 94 px target |
| Core pets | примерно 48–65 px | 68–78 px target |
| Panda/VIP pets | примерно 57–70 px | 72–75 px target |
| Dragon | около 98 px | 118 px target |
| Tree | около 70 px | 160 px target |
| Bench | около 65 px ширины | 130 px target width |
| Lamp | около 75 px | 120 px target height |
| Car | около 90 px ширины | 175 px target width |
| Park pavilion | искажался collider-derived размером | 460 px target width, aspect preserved |
| Hub building | искажался collider-derived размером | 530 px target width, aspect preserved |
| Rich estate | искажался collider-derived размером | 720 px target width, aspect preserved |
| VIP palace | искажался collider-derived размером | 860 px main target width, 460/620 px для переиспользуемых крыльев |

## Изменённые/созданные файлы

- `art/source/generated_originals/**` — 42 неизменённых originals.
- `public/assets/**` — 42 cropped runtime PNG.
- `scripts/analyze-asset-bounds.py`
- `docs/asset-bounds-audit.json`
- `docs/ASSET_BOUNDS_AUDIT.md`
- `src/game/assets/assetLoader.ts`
- `src/game/assets/assetSizing.ts`
- `src/game/assets/assetManifest.ts`
- `src/game/world/visual/GroundPainter.ts`
- `src/game/world/visual/WorldVisualConfig.ts`
- `src/game/world/WorldBuilder.ts`
- `src/game/world/ZoneGate.ts`
- `src/game/world/ProgressShortcut.ts`
- `src/game/scenes/WorldScene.ts`
- `src/game/utils/DeveloperTools.ts`
- `tests/visual-assets.test.ts`
- `package.json`, `package-lock.json`, `tsconfig.json` — dev-only Node types для filesystem asset tests.
- `docs/ASSET_MANIFEST.md`, `docs/VISUAL_RULES.md`, `docs/TECH_ARCHITECTURE.md`, `docs/DEVELOPMENT_LOG.md`.
- `tasks/CURRENT_TASK.md`, `tasks/LAST_REPORT.md`.
- `artifacts/stage-7b-screenshots/**` — 10 QA screenshots.

## Технические решения

- Offline crop использует alpha threshold `16`, padding `12 px`, сохраняет связанную мягкую тень и не меняет размер/цвет видимой части.
- Runtime bundle уменьшен по PNG приблизительно со 104 MB originals до 53 MB cropped assets.
- Loader рассчитывает вторую display dimension из натурального aspect ratio runtime frame. Для Player/Pet/Owner/Guard/tree/lamp ведущая ось — height, для buildings/decor/interactives — width.
- Bottom origin вычисляется из cropped frame и padding, поэтому опорная точка больше не зависит от прозрачного original canvas.
- GroundPainter создаёт пять textures `128×128` один раз. Декоративные placements не входят в physics/navigation и не меняют chase routes.
- Dev-only `capture=1&view=...` скрывает панель и позиционирует Player для воспроизводимых screenshots; пользовательский режим не затронут.

## Проверки

- `npm run typecheck` — успешно.
- `npm test` — успешно: 11 test files, 42 tests.
- `npm run build` — успешно: 56 modules; остаётся прежний non-blocking warning Vite о размере Phaser chunk.
- `git diff --check` — успешно.
- Тесты подтверждают: runtime PNG существуют, размеры положительны, aspect ratio сохраняется, path/texture mapping не конфликтует, production collider alpha не равен `0.001`, universal gate не используется с rotation `±90°`.
- Browser QA: 1920×1080 — Base, Park, Hub, Rich, VIP, Dragon; 390×844 — Base, Park, Hub, VIP gate. Console errors: нет.
- Последний зафиксированный диапазон встроенного браузера до pass: около `45–47 FPS / 21–23 ms`; после добавления static textures/decor заметного ухудшения отзывчивости не наблюдалось. Повторный количественный snapshot после самого последнего косметического изменения не получен: localhost browser action был отклонён политикой доступа.

### Screenshot paths

- `artifacts/stage-7b-screenshots/desktop-base.png`
- `artifacts/stage-7b-screenshots/desktop-park.png`
- `artifacts/stage-7b-screenshots/desktop-hub.png`
- `artifacts/stage-7b-screenshots/desktop-rich.png`
- `artifacts/stage-7b-screenshots/desktop-vip.png`
- `artifacts/stage-7b-screenshots/desktop-dragon.png`
- `artifacts/stage-7b-screenshots/mobile-base.png`
- `artifacts/stage-7b-screenshots/mobile-park.png`
- `artifacts/stage-7b-screenshots/mobile-hub.png`
- `artifacts/stage-7b-screenshots/mobile-vipgate.png`

## Остались проблемы

- `bridge.png`, `fence_segment.png`, `security_booth.png` по-прежнему отсутствуют и используют procedural fallback.
- Некоторые существующие крупные территории всё ещё используют простые static Graphics для воды, дворов и Dragon seals; это intentional fallback, а не collider visualization.
- Использование одного building PNG для нескольких функциональных строений создаёт похожие фасады; новых изображений в Этапе 7B не добавлялось.
- Production chunk сохраняет Vite size warning; сами cropped PNG загружаются как отдельные static assets.

## Требуется решение Game Director

Визуальный review десяти screenshots: подтвердить scale Player/Pets, размеры Pavilion/Hub/Rich/VIP buildings, плотность декора и композицию общего pet pen. Этап не назначает следующую работу автоматически.

## Предложения Codex

После review выполнять точечную настройку только visible targets, offsets и decorative placements. Не возвращать collider-derived sizing и не менять gameplay geometry ради визуального выравнивания.
