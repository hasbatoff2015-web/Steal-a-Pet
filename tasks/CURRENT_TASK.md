# Этап 5 — VIP Estate, Final Heist and Campaign Completion

## Статус

COMPLETED — AWAITING GAME DIRECTOR REVIEW

## Цель

Завершить playable-кампанию игры на существующей архитектуре Этапов 1–4:

`Собака → PARK → Кот → CENTRAL HUB → Лиса → Быстрый рывок → RICH DISTRICT → Павлин/Панда → Двойной рывок → VIP ESTATE → два VIP-питомца → Дракон → победа`.

Этап должен превратить VIP ESTATE в последнюю полноценную prototype-зону, поддержать свободный порядок двух VIP-краж, финальную погоню с тремя преследователями, завершение кампании, post-victory free roam и безопасное начало новой игры. Визуалы остаются программной prototype-графикой и должны быть готовы к последующей замене питомцев без изменения gameplay ids.

## Утверждённый баланс

- VIP ESTATE открывается за 800 монет после RICH DISTRICT, доставки Dog/Cat/Fox/Peacock/Panda и покупки Fast Dash/Double Dash.
- `vip-a` — временно «Золотая Капибара», `RARE`, `+24 монеты/сек`.
- `vip-b` — временно «Королевская Сова», `RARE`, `+36 монет/сек`.
- Общий доход после двух VIP-питомцев — `+92 монеты/сек`.
- `dragon` — временно «Дракон», `LEGENDARY`, `+100 монет/сек`.
- Итоговый доход восьми питомцев — `+192 монеты/сек`.
- Скорости, стоимость существующих зон и upgrades, dash и экономика Этапов 1–4 не меняются.

## Объём

- Расширить data definitions стабильными pet ids `vip-a`, `vip-b`, `dragon`; gameplay и user-facing тексты не должны зависеть от `displayName`.
- Создать data-driven gate VIP ESTATE и полноценный prototype layout зоны с главным входом, двумя крыльями, центральным Dragon Courtyard, широкими маршрутами и отличимым визуальным языком.
- Реализовать два VIP encounters с двумя pursuers каждый и свободным порядком доставки.
- Реализовать два Dragon seals, состояние которых выводится из доставленных VIP pets; автоматически открыть двор при `2/2`.
- Реализовать Dragon encounter через существующую `pursuers[]` architecture: boss сразу, Guard A примерно через 700 мс, Guard B примерно через 1400 мс.
- Расширить возврат data-driven ограничением для дальних pursuers: после честного возврата выполнить безопасный визуальный reset примерно через 5–7 секунд, не ломая обычные encounters и stuck fail-safe.
- Расширить базу до восьми раздельных PetId slots, выделив Дракону заметное место.
- Расширить progression, objectives и navigation markers до `CAMPAIGN_COMPLETE` без комбинаторных веток для порядка VIP pets.
- Сохранить `saveVersion: 2`, добавить совместимые optional run stats и логическую validation финальных фактов.
- Реализовать run stats: активное игровое время, число провалов, успешные доставки и завершение кампании.
- Реализовать responsive victory overlay со статистикой, действиями «Продолжить играть» и подтверждаемым «Начать заново».
- Расширить dev-only QA tools и Vitest suite.
- Создать `docs/ASSET_PLAN.md` как технический план следующего визуального vertical slice без производства изображений.
- Обновить фактическую документацию и отчёт, выполнить полный regression/runtime/mobile/performance QA.

## Критерии готовности

- [x] Core loop, progression, gates, saves, encounters и upgrades Этапов 1–4 не сломаны.
- [x] VIP gate использует утверждённые prerequisites, стоит 800 монет, списывает деньги и физически открывает зону.
- [x] VIP ESTATE визуально отличается от RICH DISTRICT и имеет читаемые широкие маршруты.
- [x] VIP A и VIP B доступны в любом порядке и дают соответственно `+24/сек` и `+36/сек`.
- [x] Оба порядка VIP pets покрыты тестами и runtime-проверкой.
- [x] Каждый доставленный VIP pet отключает один seal; Dragon Courtyard автоматически открывается после `2/2`.
- [x] Дракон недоступен до обоих VIP pets, имеет `LEGENDARY` rarity и даёт `+100/сек`.
- [x] Dragon encounter использует три pursuers и cancel-safe delayed activations.
- [x] Поимка любым pursuer обрабатывается один раз, отменяет pending alarms, возвращает питомца и гарантирует доступный retry.
- [x] Data-driven long-return reset не требует долгого ожидания и не меняет обычные encounters.
- [x] Восемь питомцев читаемо размещаются внутри базы, итоговый доход равен `+192/сек`.
- [x] Доставка Дракона выводит победу из delivered pet fact, сохраняет прогресс и показывает responsive overlay.
- [x] Continue возвращает free roam; New Game после подтверждения очищает save и начинает кампанию заново.
- [x] Reload полного save восстанавливает восемь питомцев, все зоны/upgrades, двор, `2/2` dash, доход и completed objective без повторного overlay.
- [x] Старые корректные Stage 4 save v2 загружаются, optional run stats получают безопасные defaults, противоречивые saves отклоняются.
- [x] Все user-facing имена питомцев поступают из data definitions; internal ids не зависят от отображаемых имён/visual keys.
- [x] Run stats не считают скрытое/поставленное на паузу время и устойчивы к abnormal delta.
- [x] FPS limit 60, dirty UI, cached income и throttled debug поведение сохранены.
- [x] `npm run typecheck`, `npm run test`, `npm run build`, `npm run preview` и `git diff --check` проходят.
- [x] Browser console, desktop/mobile layout, final encounters, victory flow, reload и performance проверены доступными средствами.
- [x] `docs/ASSET_PLAN.md`, проектная документация и `tasks/LAST_REPORT.md` отражают фактическое состояние.

## Ограничения

- Не создавать финальные brainrot-дизайны, production sprite sheets, изображения или финальный UI art.
- Не начинать Stage 6 или визуальное производство самостоятельно.
- Не добавлять новые зоны, питомцев сверх `vip-a`, `vip-b`, `dragon` или upgrades после Double Dash.
- Не добавлять audio, SDK Яндекс Игр, рекламу, облачное сохранение, магазин, строительство, combat, health, inventory, stealth, vision cones, navmesh или procedural generation.
- Не менять утверждённый баланс, скорости, размеры мира и механику Этапов 1–4.
- Не растягивать кампанию завышенными ценами, ожиданием, пустыми пробежками или лабиринтами.
- Не переписывать работающие системы без технической необходимости; использовать существующие data-driven gates, encounters и pursuers.
- Save не хранит active theft, pursuer states, pending alarms, dash charges или состояние victory overlay.
