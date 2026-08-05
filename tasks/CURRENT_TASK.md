# Этап 7B — Исправление масштаба ассетов и визуальный pass карты

## Статус

COMPLETED — AWAITING GAME DIRECTOR REVIEW

## Цель

Перестроить presentation layer карты на основе корректно обрезанных production PNG: сделать Player, NPC, питомцев и здания читаемыми, убрать остатки prototype/debug-визуала и наполнить пять районов без изменения gameplay.

## Объём

- Провести alpha-bounds аудит 42 исходных PNG и сохранить отчёт.
- Сохранить originals в `art/source/generated_originals/`, создать обрезанные runtime PNG в `public/assets/runtime/`.
- Перевести manifest на visible-target sizing без искажения aspect ratio.
- Убрать видимые collider outlines, дублирующие технические подписи и поворот perspective gate.
- Отделить программную отрисовку земли, дорог и декоративной композиции от gameplay geometry.
- Пересобрать presentation Starter, Park, Central Hub, Rich District, VIP Estate и Dragon Courtyard существующими ассетами и Phaser Graphics.
- Проверить desktop/mobile presentation, performance, runtime, тесты и документацию.

## Критерии готовности

- [ ] Runtime PNG обрезаны с безопасным padding и manifest использует их.
- [ ] Visible target sizes валидны, aspect ratio всех PNG сохранён.
- [ ] Player/NPC/Pets читаемы; здания не сплющены.
- [ ] Production mode не показывает collider rectangles/outlines и лишние labels.
- [ ] Universal gate не поворачивается на ±90°.
- [ ] Все пять районов имеют цельную землю, дороги и умеренно плотный декор.
- [ ] Gameplay/collision/navigation/economy/save/victory не изменены.
- [ ] Desktop/mobile screenshots созданы для review.
- [ ] `typecheck`, tests, build и `git diff --check` проходят.

## Ограничения

- Не менять balance, upgrade effects, entity state machines, AI/A*, chase graphs, roaming routes, catch distance, save format, victory, pet count, gate requirements и мир `4608 × 3072`.
- Не добавлять новые художественные изображения, spritesheets, audio, SDK, рекламу, HUD или механику.
- Не создавать world-sized texture, per-frame procedural graphics или collider для мелкого декора.
- Не начинать следующий этап.
