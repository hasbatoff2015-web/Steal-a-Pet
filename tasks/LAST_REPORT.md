# Последний выполненный этап

## Что сделано

- Выполнено блокирующее playtest-дополнение к Этапу 6 без изменения геймдизайна, баланса, скоростей, карты или правил кражи.
- Tracker уменьшен и разделён на throttled target selection и per-frame visual transform.
- Удалены постоянная плашка «РАДАР», восьминаправленная квантизация позиции и бесконечный pulse tween.
- Добавлены LOS, authored chase graphs, A*, gate-conditioned edges, lane bias и CHASING stuck recovery.
- Сохранены существующие return routes и RETURNING fail-safe.
- Dev snapshot/F2 расширены состоянием `DIRECT/PATH`, graph/node, LOS, remaining path, repath и stuck.
- Добавлены восемь обязательных чистых сценариев Vitest для graph/path logic.

## Изменённые/созданные файлы

- `src/game/systems/PetTrackerSystem.ts`
- `src/game/systems/ChaseNavigation.ts`
- `src/game/systems/PursuerNavigation.ts`
- `src/game/systems/ChaseSystem.ts`
- `src/game/systems/PetEncounter.ts`
- `src/game/entities/OwnerNpc.ts`
- `src/game/data/chaseNavigation.ts`
- `src/game/data/encounters.ts`
- `src/game/scenes/WorldScene.ts`
- `src/game/world/WorldBuilder.ts`
- `src/game/utils/DeveloperTools.ts`
- `tests/chase-navigation.test.ts`
- `docs/TECH_ARCHITECTURE.md`
- `docs/MAP.md`
- `tasks/CURRENT_TASK.md`
- `tasks/LAST_REPORT.md`

## Технические решения

### Tracker

Причина рывков: прежний `PetTrackerSystem.update()` возвращался до `nextUpdateAt` и поэтому раз в 250 ms одновременно выбирал target, менял marker position и rotation. Marker находился на 105 px от Player, имел ring диаметром 56 px, крупный Text и бесконечный tween. В результате transform дискретно «догонял» Player.

Теперь полный поиск остаётся ограничен 4 Гц и кэширует ссылку на `RoamingPetController`. Position и arrow rotation вычисляются каждый frame после Player/CoreLoop update по текущим world coordinates без tween, Vector2, массивов или строк. Marker всегда расположен `player.x, player.y + 44`, поэтому не участвует в physics и не отстаёт от Player/camera/dash.

Итоговый desktop ring: диаметр `44 px`, stroke `3 px`; стрелка: `14 px`; offset: `44 px`. На mobile container scale `1.12`. Близкое мягкое пульсирование меняет только alpha. Tracker скрывается при любом active pet, отсутствии доступной roaming target, доставленной цели или victory overlay. После первой покупки выводится одноразовый tutorial toast.

### Pursuer navigation

Причина soft-lock у стен: прежний CHASING всегда вызывал `moveToObject(owner, player)` по прямому вектору. Collider останавливал NPC, но система не меняла цель. Return routes применялись только после завершения погони.

`WorldBuilder` теперь регистрирует bounds физических крупных obstacles одновременно с Arcade collider. `PursuerNavigation` проверяет segment `pursuer → Player` против этих bounds с padding радиуса NPC. Открытый LOS оставляет дешёвый DIRECT chase. Закрытый LOS включает PATH и A* по graph id encounter.

Graphs созданы для Starter, PARK pavilion, CENTRAL HUB, RICH Estate A, RICH Estate B, VIP west wing, VIP east wing и Dragon Courtyard/расширенного transit route. Repath interval — `220 ms` (до 4.55 раза/сек), LOS interval — `110 ms`. A* не запускается каждый frame. Authored edges доверяются как безопасные проходы; conditional edges выключены закрытыми PARK/CENTRAL/RICH/VIP gates и Dragon seals. LOS и path smoothing всегда используют фактические active blockers.

Owner/guards используют lane bias `-1/0/1` на равноценных ветках. Stuck recovery после `750 ms` форсирует repath, после `1500 ms` пробует альтернативный start node, после `3000 ms` допускает reset только на безопасный node текущего graph на расстоянии не менее `460 px` от Player. Телепортации к Player нет.

## Проверки

- `npm run typecheck` — успешно.
- `npm run test` — успешно: 9 test files, 34 tests.
- `npm run build` — успешно: 51 module, production bundle собран; сохраняется прежнее предупреждение Vite о размере Phaser chunk.
- `npm run preview` — production preview отвечает HTTP 200.
- Browser console в обычном режиме — ошибок и warnings не обнаружено.
- Tracker в production preview без dev UI: визуально ring компактный, находится строго под Player, постоянной надписи нет; active carry скрывает marker. Dev snapshot подтверждает отсутствие physics state и кэш target.
- PARK pavilion: после переноса Player за pavilion владелец перешёл в `PATH`, target node `pavilion-nw`, LOS `false`, stuck `0`.
- Dragon: boss и оба guards при Player за препятствиями перешли в `PATH`; remaining path уменьшился с 10 до 3 nodes, LOS `false`, stuck `0`, поздний guard активировался отдельно.
- Gate behavior покрыт unit tests: закрытое conditional edge исключается, открытое доступно.
- Чистые tests покрывают обход blocker, кратчайший маршрут, изолированную область, smoothing, lane bias и смену goal при repath.

Наблюдаемый rolling FPS production preview в dev режиме: примерно `42–47 FPS`, frame time около `21–24 ms`; во время трёх Dragon pursuers — около `43 FPS / 21.6 ms`. Это тот же практический диапазон браузерного окружения, что и idle-сцена; A* выполняется только в PATH и throttled. Полноценный сравнительный device benchmark требует повторного hands-on playtest Game Director.

## Остались проблемы

- Полный ручной прогон Panda encounter после чистого старта не завершён в автоматизированной browser-сессии: PARK и Dragon regression проверены, Panda graph/lane branches покрыты общей чистой логикой и сборкой, но требуют hands-on re-review.
- Из-за prototype collider layout authored nodes могут потребовать локальной корректировки после дальнейшего изменения карты; dev state показывает проблемный graph/node/stuck без профилирования вслепую.
- Production bundle по-прежнему выдаёт non-blocking Vite warning о размере Phaser chunk.

## Требуется решение Game Director

Повторный hands-on review tracker во время обычного движения/dash и погонь Cat, Panda, VIP и Dragon. Этап 6 формально не закрыт.

## Предложения Codex

После принятия исправлений сохранить graphs как часть prototype map QA checklist: любое изменение крупного collider или gate должно сопровождаться коротким прогоном соответствующей погони в dev mode.
