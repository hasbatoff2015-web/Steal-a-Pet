# Этап 7A — Подключение готовых визуальных ассетов

## Статус

COMPLETED — AWAITING GAME DIRECTOR REVIEW

## Цель

Подключить фактически найденные PNG из `public/assets/` через единый типизированный manifest и заменить ими заметные prototype visuals персонажей, всех 14 питомцев, владельцев/guards, зданий, базы, ворот, станций и окружения без изменения gameplay.

## Объём

- Инвентаризировать найденные PNG, их пути и прозрачные поля.
- Создать централизованные asset manifest/loader и data-driven visual configuration.
- Подключить production PNG для Player, 14 Pets, восьми owner roles и guards.
- Подключить здания, единый общий pet pen, delivery pad, три переиспользуемые upgrade stations, четыре universal gates и общий декор.
- Сохранить prototype textures/Graphics как безопасный fallback для отсутствующих или не загрузившихся файлов.
- Сохранить существующие collision bodies, navigation blockers, map coordinates, chase graphs, roaming routes, economy, save и victory.
- Обновить `docs/ASSET_MANIFEST.md`, `docs/VISUAL_RULES.md`, техническую документацию и итоговый отчёт.

## Критерии готовности

- [ ] Player использует `player_world.png`, сохраняет collision, flipX и dash feedback.
- [ ] Все 14 питомцев используют отдельные production texture keys и data-driven размеры.
- [ ] Владельцы и guards используют утверждённый encounter mapping.
- [ ] Ключевые здания и декорации используют production PNG поверх неизменной collision geometry.
- [ ] На базе существует один общий визуальный `pet_pen.png` для всей коллекции.
- [ ] `update_station.png` переиспользуется для трёх веток с tint.
- [ ] `universal_gate.png` переиспользуется для четырёх gates без изменения barriers/navigation.
- [ ] Отсутствующие optional assets используют prototype fallback без падения игры.
- [ ] Runtime QA не выявляет missing textures, console errors или gameplay regressions.
- [ ] `npm run typecheck`, `npm run test`, `npm run build`, production preview и `git diff --check` проходят.
- [ ] Документация соответствует фактическому manifest и интеграции.

## Ограничения

- Не менять механику, AI, A*, баланс, цены, доходы, карту, encounter/world coordinates, collision, navigation blockers, routes, prerequisites, save и victory.
- Не создавать sprite sheets, новые механики, UI, audio, Yandex SDK или новые изображения.
- Не редактировать разрушительно PNG и не удалять `art/source`.
- Не начинать следующий визуальный этап.
