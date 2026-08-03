# Технический план художественных ассетов

## Назначение

Этот документ описывает технический контракт будущего визуального vertical slice. Он не утверждает финальный дизайн персонажей и не является заданием на производство всей карты сразу.

Этап 6 должен начаться с одного законченного визуального среза: главный герой, один питомец, один владелец, одна небольшая игровая территория, базовый HUD и ключевые эффекты. После проверки читаемости, масштаба и pipeline тот же контракт можно распространить на остальной контент.

## Принцип заменяемого контента

- Внутренние gameplay ids питомцев остаются стабильными: `dog`, `cat`, `fox`, `peacock`, `panda`, `vip-a`, `vip-b`, `dragon`.
- Текущие display names и prototype visuals могут быть заменены оригинальными brainrot-персонажами.
- Gameplay role, редкость, доход, progression, encounter и save не зависят от display name или `visualKey`.
- Замена персонажа выполняется через data definition и набор визуальных ресурсов, а не через поиск имени в gameplay-коде.
- Для production-ассетов нужно завести новый `visualKey`; старый id не переименовывается.

## Общие технические требования

Все размеры ниже — рекомендуемые стартовые размеры для review, а не окончательное художественное решение.

- Формат исходников: lossless PNG с прозрачностью либо согласованный spritesheet/atlas, совместимый с Phaser.
- Ракурс: top-down с псевдо-3D объёмом.
- Масштаб: основные персонажи должны уверенно читаться при текущем camera zoom на экранах шириной 320–430 px.
- Origin персонажей и питомцев: ориентир `(0.5, 0.68–0.75)`, чтобы нижняя часть спрайта совпадала с точкой контакта с землёй.
- Collision footprint отделяется от видимого силуэта; для движущихся персонажей используется компактный круг или эллипс вокруг ног.
- Тени по возможности используют общую runtime-текстуру или небольшой набор эллипсов, а не уникальный bitmap для каждого кадра.
- В спрайтах нельзя оставлять прозрачные поля, которые заметно увеличивают atlas и ломают origin.
- Один визуальный scale не должен зашиваться в gameplay-логику; рекомендуемый scale хранится рядом с visual definition.

## Naming convention

Рекомендуемый формат:

`<category>_<stable-role-or-id>_<state>_<direction>_<frame>`

Примеры:

- `player_main_run_s_03`
- `pet_vip-a_idle_s_01`
- `npc_dragon-guard-a_chase_sw_02`
- `world_park_bench_a`
- `ui_dash_charge_ready`
- `fx_pet_delivery_ring_01`

Допустимые категории: `player`, `pet`, `npc`, `world`, `building`, `gate`, `ui`, `fx`.

## Главный герой

Нужен один основной набор:

- idle;
- run/walk;
- dash;
- caught/knockback reaction;
- короткая victory reaction;
- направления минимум N/S/E/W; восемь направлений — после проверки бюджета анимации;
- рекомендуемый bounding frame: около `96×112 px`;
- collision footprint: круг около `34–40 px` в текущем world scale;
- origin: около `(0.5, 0.72)`.

Критично для mobile: направление движения, начало dash и силуэт ног должны читаться без мелких деталей.

## Восемь питомцев

Для каждого stable id нужен независимый визуальный набор:

| Stable id | Текущая роль | Редкость | Особое требование |
| --- | --- | --- | --- |
| `dog` | первый питомец | `COMMON` | самый простой и мгновенно узнаваемый силуэт |
| `cat` | PARK | `UNCOMMON` | отличается ушами, размером и idle от первого |
| `fox` | CENTRAL HUB | `RARE` | заметный хвост и более ценный силуэт |
| `peacock` | RICH A | `RARE` | широкий хвост, не похожий на крылья VIP B |
| `panda` | RICH B | `RARE` | тяжёлый округлый силуэт |
| `vip-a` | западное VIP-крыло | `RARE` | крупный округлый VIP-силуэт; display identity заменяемая |
| `vip-b` | восточное VIP-крыло | `RARE` | крылья/глаза, но не копия Павлина; display identity заменяемая |
| `dragon` | финальная цель | `LEGENDARY` | самый крупный силуэт, aura/ring, рога, крылья и хвост |

Минимальные состояния каждого питомца:

- idle на NPC-точке;
- follow/run;
- idle на базе;
- короткая stolen reaction;
- короткая delivered reaction.

Рекомендуемый bounding frame обычного питомца: `80×80`–`112×96 px`; Дракона: примерно `144×128 px`. Collision для following не требуется в текущем gameplay, но визуальная ground point должна быть стабильной для breadcrumb-following и depth sorting.

## NPC owners и guards

Роли:

- starter owner;
- park owner;
- hub owner;
- rich owner A;
- rich owner B;
- rich guard;
- VIP owner A;
- VIP garden guard;
- VIP owner B;
- VIP intercept guard;
- VIP boss;
- Dragon Guard A;
- Dragon Guard B.

Необязательно создавать 13 полностью уникальных скелетов. Допускается общий humanoid rig/atlas с palette, одеждой, аксессуарами и читаемыми головными уборами.

Минимальные состояния:

- idle;
- chase/run;
- return/walk;
- alarm activation;
- visual reset/fade использует runtime alpha и не требует отдельной анимации.

Рекомендуемый bounding frame: около `88×112 px`; origin `(0.5, 0.72)`; collision footprint аналогичен игроку, но не должен совпадать с широкими декоративными частями одежды.

Критично для mobile: owner и guard одного encounter должны отличаться цветом, аксессуаром и силуэтом, а boss должен считываться отдельно от двух guards.

## Пять зон

### STARTER SUBURB

- базовая трава;
- дорога;
- дом игрока;
- чужой дом/двор;
- простые деревья и кусты;
- delivery zone и upgrade station.

### PARK

- отдельная вариация травы;
- дорожки;
- вода/пруд;
- мост;
- павильон;
- лавка;
- более плотная растительность.

### CENTRAL HUB

- городское покрытие;
- площадь;
- фонтан;
- 2–3 переиспользуемых фасада;
- фонари и клумбы.

### RICH DISTRICT

- светлое дорогое покрытие;
- estate facade variants;
- изгородь;
- богатый фонарь;
- автомобиль;
- бассейн;
- будка охраны.

### VIP ESTATE

- фиолетово-золотое покрытие;
- главный gate;
- центральная аллея;
- западное садовое крыло;
- восточная башня/двор;
- дворец/центральный двор;
- два Dragon gates/seals;
- колонна или статуя;
- редкое растение;
- фонтан.

Большие ground surfaces рекомендуется собирать из tileable/chunk-friendly текстур. Не создавать одну texture размером `3840×2560`.

## Здания и ворота

- Один базовый модуль здания может иметь 2–3 roof/facade variants.
- Collision footprint здания задаётся отдельным прямоугольником в world data и не выводится из прозрачности картинки.
- Для каждого progression gate нужны closed и opened states; открытие может использовать runtime tween.
- Главный VIP gate должен отличаться от PARK/HUB/RICH размером, цветом и silhouette.
- Dragon seals требуют активного, отключённого и opening states.
- Башни, колонны и статуи могут собираться из общих модулей, если зоны сохраняют узнаваемость.

## Декоративные объекты

Кандидаты на общие текстуры/atlases:

- деревья и кусты с palette/scale variants;
- цветочные клумбы;
- фонари;
- лавки;
- заборы и изгороди;
- колонны;
- горшки и редкие растения;
- небольшие автомобили;
- вода, блики и края бассейна.

Мелкая декорация не получает physics body по умолчанию. Крупные визуальные препятствия должны иметь отдельный простой footprint.

## UI

Нужны production-версии:

- money panel;
- objective panel;
- desktop dash charges;
- mobile joystick;
- mobile dash button с ready/cooldown/charges;
- contextual interaction button;
- toast background;
- navigation marker;
- victory overlay;
- Continue/New Game/confirmation buttons;
- четыре обозначения редкости.

UI должен поддерживать ширины 320, 360, 390, 430 px и landscape около `844×430`, не полагаясь на текст внутри bitmap.

## Effects

- dash trail;
- theft flash;
- delayed alarm;
- caught feedback;
- delivery burst;
- income feedback;
- zone unlock;
- upgrade purchase;
- Dragon seal disabled;
- Dragon courtyard opened;
- legendary aura;
- victory celebration.

Большинство эффектов можно собрать из общих маленьких частиц, rings и runtime tint/alpha/scale. Уникальные тяжёлые spritesheets для каждого события не нужны.

## Mobile-critical assets

На первом visual slice обязательно проверить:

- силуэт игрока и питомца на фоне травы, дороги и воды;
- owner против player;
- direction/dash feedback;
- contextual button и objective при ширине 320 px;
- размер текста и иконок dash charges;
- collision footprint относительно видимого объекта;
- псевдо-3D origin при прохождении перед и за окружением;
- отсутствие потери важных деталей после browser scaling.

## Порядок производства

1. Утвердить один brainrot-питомец и один участок STARTER SUBURB как visual vertical slice.
2. Проверить export, atlas, naming, origin, depth, collision и mobile readability в игре.
3. Зафиксировать production pipeline.
4. Расширить общий character rig на owners/guards.
5. Производить зоны и остальных питомцев по прогрессии кампании.
6. Финализировать VIP/Dragon и victory UI только после проверки общего визуального языка.
