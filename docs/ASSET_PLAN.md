# Asset Plan — Visual Vertical Slice

## Статус

Технический план будущей замены prototype graphics. Этап 6 не создаёт production art. Финальные brainrot-концепты, названия и референсы утверждает Game Director.

## Питомцы

Нужно 14 production-наборов с неизменными gameplay ids:

- core: `dog`, `cat`, `fox`, `peacock`, `panda`, `vip-a`, `vip-b`, `dragon`;
- roaming: `roam-01…roam-06` (текущие prototype display names: Прыгун, Енот, Альпака, Хамелеон, Газель, Мини-грифон).

Для каждого: readable top-down silhouette, idle, movement/follow, base idle и shadow. Для roaming должны читаться ALERT/FLEEING/TIRED; допустимы общие indicators/effects вместо полной уникальной анимации каждого состояния. Dragon требует центральной showcase-композиции.

## Персонажи и NPC

- player: idle/walk/dash и направление;
- существующие owner/guard visual roles;
- общие alert/chase/caught/readiness effects, переиспользуемые между encounters.

## Мир

Модульный набор должен покрыть пять зон и шесть subareas: STARTER OUTSKIRTS, PARK NORTH GROVE, CENTRAL MARKET BACKSTREETS, SOUTH CANAL PROMENADE, RICH GARDENS, VIP APPROACH OUTER GROUNDS.

Нужны reusable ground/path/water/bridge/building/fence/tree/bush/bench/lamp/flower/market/canal/garden элементы. Gates и четыре shortcuts имеют closed/open состояния. Не проектировать одну гигантскую карту-картинку; использовать chunks/tiles/props.

## База

- showcase area для восьми core pets и центральное место Дракона;
- roaming pen на шесть отдельных slots и label `x/6`;
- три станции Mobility, Tracking, Stealth;
- delivery zone и reusable income effect.

## UI и effects

- mobile-first HUD panels, joystick, dash/interaction buttons;
- gate/station states locked/available/complete;
- tracker indicator без minimap/GPS;
- roaming alert/tired/capture feedback;
- shortcut/zone unlock, delivery/collection/victory effects;
- responsive Victory Overlay и playtest-only report control.

## Бюджет и переиспользование

Ориентир 20–30 основных художественных assets остаётся целью для окружения/UI-модулей, но 14 уникальных питомцев считаются отдельным обязательным character scope. Variants создаются tint/scale/flip/composition/timing, если это не разрушает силуэт и редкость.

Перед производством Game Director должен утвердить финальные brainrot-концепты `vip-a`, `vip-b`, `roam-01…06` и единый sprite sheet contract. Всё это пока TBD.
