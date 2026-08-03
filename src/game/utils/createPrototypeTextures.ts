import Phaser from 'phaser';

function generate(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  draw: (graphics: Phaser.GameObjects.Graphics) => void,
): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.add.graphics();
  draw(graphics);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

export function createPrototypeTextures(scene: Phaser.Scene): void {
  generate(scene, 'player', 52, 58, (graphics) => {
    graphics.fillStyle(0x2d7dd2);
    graphics.fillCircle(26, 24, 19);
    graphics.fillStyle(0x89c9ff);
    graphics.fillCircle(20, 19, 5);
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(32, 18, 5);
    graphics.fillStyle(0x173c66);
    graphics.fillCircle(33, 18, 2);
    graphics.fillRoundedRect(14, 39, 24, 13, 6);
  });

  generate(scene, 'owner', 52, 58, (graphics) => {
    graphics.fillStyle(0xef6461);
    graphics.fillCircle(26, 24, 19);
    graphics.fillStyle(0xffb0a8);
    graphics.fillCircle(20, 19, 5);
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(32, 18, 5);
    graphics.fillStyle(0x6f2525);
    graphics.fillCircle(33, 18, 2);
    graphics.fillRoundedRect(14, 39, 24, 13, 6);
  });

  generate(scene, 'park-owner', 52, 58, (graphics) => {
    graphics.fillStyle(0x6a5acd);
    graphics.fillCircle(26, 24, 19);
    graphics.fillStyle(0xded7ff);
    graphics.fillCircle(20, 19, 5);
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(32, 18, 5);
    graphics.fillStyle(0x33266f);
    graphics.fillCircle(33, 18, 2);
    graphics.fillStyle(0x4e965c);
    graphics.fillRoundedRect(14, 39, 24, 13, 6);
  });

  generate(scene, 'hub-owner', 52, 58, (graphics) => {
    graphics.fillStyle(0x2f728f);
    graphics.fillCircle(26, 24, 19);
    graphics.fillStyle(0xbdeeff);
    graphics.fillCircle(20, 19, 5);
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(32, 18, 5);
    graphics.fillStyle(0x153e55);
    graphics.fillCircle(33, 18, 2);
    graphics.fillStyle(0xf0a24a);
    graphics.fillRoundedRect(14, 39, 24, 13, 6);
  });

  generate(scene, 'rich-owner', 52, 58, (graphics) => {
    graphics.fillStyle(0xf1c24f);
    graphics.fillCircle(26, 24, 19);
    graphics.fillStyle(0xffefd0);
    graphics.fillCircle(20, 19, 5);
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(32, 18, 5);
    graphics.fillStyle(0x684b14);
    graphics.fillCircle(33, 18, 2);
    graphics.fillStyle(0xf7f2e8);
    graphics.fillRoundedRect(14, 39, 24, 13, 6);
  });

  generate(scene, 'panda-owner', 52, 58, (graphics) => {
    graphics.fillStyle(0x9d5bd2);
    graphics.fillCircle(26, 24, 19);
    graphics.fillStyle(0xf2ddff);
    graphics.fillCircle(20, 19, 5);
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(32, 18, 5);
    graphics.fillStyle(0x43245d);
    graphics.fillCircle(33, 18, 2);
    graphics.fillStyle(0xefe9f5);
    graphics.fillRoundedRect(14, 39, 24, 13, 6);
  });

  generate(scene, 'rich-guard', 52, 58, (graphics) => {
    graphics.fillStyle(0x26384d);
    graphics.fillCircle(26, 24, 19);
    graphics.fillStyle(0xf8d9bd);
    graphics.fillCircle(20, 21, 5);
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(32, 20, 5);
    graphics.fillStyle(0x111a26);
    graphics.fillCircle(33, 20, 2);
    graphics.fillStyle(0xe84f58);
    graphics.fillRoundedRect(14, 39, 24, 13, 6);
    graphics.fillStyle(0x182533);
    graphics.fillRect(10, 4, 32, 8);
  });

  generate(scene, 'dog', 58, 48, (graphics) => {
    graphics.fillStyle(0x8b5a2b);
    graphics.fillTriangle(10, 12, 20, 2, 22, 17);
    graphics.fillTriangle(48, 12, 38, 2, 36, 17);
    graphics.fillStyle(0xd79a52);
    graphics.fillEllipse(29, 24, 39, 31);
    graphics.fillStyle(0xffe0a8);
    graphics.fillEllipse(30, 30, 18, 13);
    graphics.fillStyle(0x2d2630);
    graphics.fillCircle(23, 21, 3);
    graphics.fillCircle(36, 21, 3);
    graphics.fillCircle(30, 29, 3);
    graphics.fillStyle(0xf4c36e);
    graphics.fillRoundedRect(17, 37, 9, 9, 4);
    graphics.fillRoundedRect(34, 37, 9, 9, 4);
  });

  generate(scene, 'cat', 54, 52, (graphics) => {
    graphics.fillStyle(0x67468f);
    graphics.fillTriangle(8, 18, 15, 1, 25, 16);
    graphics.fillTriangle(46, 18, 39, 1, 29, 16);
    graphics.fillStyle(0xa777d4);
    graphics.fillEllipse(27, 26, 36, 30);
    graphics.fillStyle(0xe7c9ff);
    graphics.fillTriangle(13, 14, 16, 6, 21, 16);
    graphics.fillTriangle(41, 14, 38, 6, 33, 16);
    graphics.fillStyle(0x4dffbb);
    graphics.fillEllipse(21, 23, 6, 8);
    graphics.fillEllipse(34, 23, 6, 8);
    graphics.fillStyle(0x2d2630);
    graphics.fillCircle(21, 23, 2);
    graphics.fillCircle(34, 23, 2);
    graphics.fillStyle(0x5d375f);
    graphics.fillTriangle(27, 29, 24, 26, 30, 26);
    graphics.lineStyle(2, 0xf4e8ff, 0.85);
    graphics.lineBetween(18, 31, 7, 29);
    graphics.lineBetween(18, 34, 6, 36);
    graphics.lineBetween(36, 31, 47, 29);
    graphics.lineBetween(36, 34, 48, 36);
    graphics.fillStyle(0x8e60bd);
    graphics.fillRoundedRect(16, 40, 8, 9, 4);
    graphics.fillRoundedRect(31, 40, 8, 9, 4);
  });

  generate(scene, 'fox', 76, 54, (graphics) => {
    graphics.fillStyle(0xb84f24);
    graphics.fillTriangle(16, 18, 22, 1, 31, 18);
    graphics.fillTriangle(49, 18, 43, 1, 35, 18);
    graphics.fillStyle(0xf28a32);
    graphics.fillEllipse(33, 27, 39, 31);
    graphics.fillTriangle(28, 26, 57, 35, 29, 39);
    graphics.fillStyle(0xffdfb0);
    graphics.fillTriangle(31, 26, 57, 35, 31, 35);
    graphics.fillStyle(0xf28a32);
    graphics.fillEllipse(63, 34, 23, 15);
    graphics.fillStyle(0xfff0cf);
    graphics.fillEllipse(70, 34, 10, 11);
    graphics.fillStyle(0x2d2630);
    graphics.fillCircle(27, 23, 3);
    graphics.fillCircle(39, 23, 3);
    graphics.fillCircle(56, 35, 2);
    graphics.fillStyle(0xc76129);
    graphics.fillRoundedRect(22, 42, 8, 9, 4);
    graphics.fillRoundedRect(37, 42, 8, 9, 4);
  });

  generate(scene, 'peacock', 92, 66, (graphics) => {
    graphics.fillStyle(0x31a89d);
    graphics.fillCircle(22, 32, 19);
    graphics.fillCircle(34, 19, 20);
    graphics.fillCircle(50, 14, 20);
    graphics.fillCircle(66, 19, 20);
    graphics.fillCircle(78, 32, 19);
    for (const [x, y, color] of [
      [20, 30, 0x2e64cc],
      [35, 18, 0xe9c64c],
      [50, 13, 0x7547c7],
      [65, 18, 0xe9c64c],
      [80, 30, 0x2e64cc],
    ] as const) {
      graphics.fillStyle(color);
      graphics.fillCircle(x, y, 5);
    }
    graphics.fillStyle(0x1975a6);
    graphics.fillEllipse(48, 40, 31, 30);
    graphics.fillStyle(0x36c6d8);
    graphics.fillCircle(48, 25, 10);
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(51, 23, 4);
    graphics.fillStyle(0x17263a);
    graphics.fillCircle(52, 23, 2);
    graphics.fillStyle(0xf0bc38);
    graphics.fillTriangle(57, 25, 67, 29, 57, 31);
    graphics.fillRect(42, 53, 5, 11);
    graphics.fillRect(52, 53, 5, 11);
  });

  generate(scene, 'panda', 68, 62, (graphics) => {
    graphics.fillStyle(0x20252b);
    graphics.fillCircle(19, 14, 10);
    graphics.fillCircle(49, 14, 10);
    graphics.fillStyle(0xf4f1e8);
    graphics.fillEllipse(34, 30, 48, 43);
    graphics.fillStyle(0x20252b);
    graphics.fillEllipse(24, 27, 12, 16);
    graphics.fillEllipse(44, 27, 12, 16);
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(25, 27, 3);
    graphics.fillCircle(43, 27, 3);
    graphics.fillStyle(0x20252b);
    graphics.fillCircle(25, 27, 2);
    graphics.fillCircle(43, 27, 2);
    graphics.fillEllipse(34, 38, 8, 6);
    graphics.fillRoundedRect(15, 47, 14, 13, 6);
    graphics.fillRoundedRect(39, 47, 14, 13, 6);
  });

  for (const [key, color, accent, ears, tail] of [
    ['roam-jumper', 0xf2c94c, 0xfff2a8, true, false],
    ['roam-raccoon', 0x7f8c9a, 0x303944, true, true],
    ['roam-alpaca', 0xe7c7a3, 0xfff2df, false, false],
    ['roam-chameleon', 0x53bd76, 0xd8ff7b, false, true],
    ['roam-gazelle', 0xdca866, 0x6e4229, true, false],
    ['roam-griffin', 0xb978d4, 0xffd45a, true, true],
  ] as const) {
    generate(scene, key, 68, 60, (graphics) => {
      graphics.fillStyle(color);
      if (ears) {
        graphics.fillTriangle(12, 19, 18, 2, 27, 19);
        graphics.fillTriangle(48, 19, 54, 2, 59, 21);
      }
      graphics.fillEllipse(34, 31, key === 'roam-alpaca' ? 33 : 43, key === 'roam-chameleon' ? 25 : 35);
      if (key === 'roam-alpaca') graphics.fillRoundedRect(27, 5, 15, 28, 7);
      if (tail) {
        graphics.lineStyle(8, accent, 1);
        graphics.beginPath(); graphics.moveTo(52, 34); graphics.lineTo(65, 25); graphics.strokePath();
      }
      if (key === 'roam-griffin') {
        graphics.fillStyle(accent, 0.9); graphics.fillTriangle(18, 29, 2, 16, 8, 40); graphics.fillTriangle(50, 29, 66, 16, 60, 40);
      }
      graphics.fillStyle(accent); graphics.fillEllipse(34, 38, 18, 11);
      graphics.fillStyle(0xffffff); graphics.fillCircle(27, 27, 5); graphics.fillCircle(42, 27, 5);
      graphics.fillStyle(0x25303b); graphics.fillCircle(28, 27, 2); graphics.fillCircle(43, 27, 2);
      graphics.fillStyle(color); graphics.fillRoundedRect(19, 45, 9, 12, 4); graphics.fillRoundedRect(40, 45, 9, 12, 4);
    });
  }

  generate(scene, 'rich-hedge', 96, 34, (graphics) => {
    graphics.fillStyle(0x2f794d);
    graphics.fillRoundedRect(0, 6, 96, 28, 13);
    graphics.fillStyle(0x60b86a);
    graphics.fillCircle(18, 12, 13);
    graphics.fillCircle(48, 10, 15);
    graphics.fillCircle(78, 12, 13);
  });

  generate(scene, 'rich-lamp', 28, 84, (graphics) => {
    graphics.fillStyle(0x364455);
    graphics.fillRect(11, 25, 6, 59);
    graphics.fillStyle(0xffe39b);
    graphics.fillCircle(14, 18, 13);
    graphics.lineStyle(3, 0xffffff, 0.75);
    graphics.strokeCircle(14, 18, 12);
  });

  generate(scene, 'rich-car', 92, 44, (graphics) => {
    graphics.fillStyle(0x26313d, 0.25);
    graphics.fillEllipse(48, 34, 86, 18);
    graphics.fillStyle(0xe35f62);
    graphics.fillRoundedRect(4, 8, 84, 29, 11);
    graphics.fillStyle(0xbfe8ff);
    graphics.fillRoundedRect(24, 3, 43, 17, 7);
    graphics.fillStyle(0x20252b);
    graphics.fillCircle(22, 37, 8);
    graphics.fillCircle(70, 37, 8);
  });

  generate(scene, 'rich-flowerbed', 92, 42, (graphics) => {
    graphics.fillStyle(0x327d4a);
    graphics.fillEllipse(46, 25, 90, 31);
    for (const [x, color] of [
      [17, 0xff7f9e],
      [33, 0xffdf67],
      [49, 0x9a7cff],
      [65, 0xff7f9e],
      [78, 0xffdf67],
    ] as const) {
      graphics.fillStyle(color);
      graphics.fillCircle(x, 17, 6);
    }
  });

  generate(scene, 'vip-capybara', 90, 66, (graphics) => {
    graphics.fillStyle(0x9a7023, 0.25);
    graphics.fillEllipse(46, 55, 74, 18);
    graphics.fillStyle(0xe7b94c);
    graphics.fillEllipse(46, 36, 70, 43);
    graphics.fillCircle(72, 31, 19);
    graphics.fillStyle(0xf7dd87);
    graphics.fillEllipse(77, 38, 22, 15);
    graphics.fillStyle(0x4a3415);
    graphics.fillCircle(75, 27, 3);
    graphics.fillCircle(85, 37, 3);
    graphics.fillStyle(0xffdd5e);
    graphics.fillTriangle(58, 12, 64, 1, 69, 13);
    graphics.fillTriangle(68, 12, 74, 0, 79, 14);
    graphics.fillTriangle(78, 13, 83, 3, 87, 17);
    graphics.fillStyle(0xa87820);
    graphics.fillRoundedRect(21, 51, 13, 12, 5);
    graphics.fillRoundedRect(53, 51, 13, 12, 5);
  });

  generate(scene, 'vip-owl', 86, 76, (graphics) => {
    graphics.fillStyle(0x5d3f86, 0.25);
    graphics.fillEllipse(43, 65, 66, 16);
    graphics.fillStyle(0x8b69bd);
    graphics.fillEllipse(43, 41, 55, 52);
    graphics.fillTriangle(18, 44, 1, 59, 26, 58);
    graphics.fillTriangle(68, 44, 85, 59, 60, 58);
    graphics.fillStyle(0xf4ecff);
    graphics.fillCircle(32, 35, 15);
    graphics.fillCircle(54, 35, 15);
    graphics.fillStyle(0xffdb57);
    graphics.fillCircle(32, 35, 7);
    graphics.fillCircle(54, 35, 7);
    graphics.fillStyle(0x241a33);
    graphics.fillCircle(32, 35, 3);
    graphics.fillCircle(54, 35, 3);
    graphics.fillStyle(0xe7b73f);
    graphics.fillTriangle(43, 42, 36, 49, 50, 49);
    graphics.fillTriangle(25, 13, 32, 1, 38, 14);
    graphics.fillTriangle(38, 13, 43, 0, 48, 14);
    graphics.fillTriangle(49, 14, 56, 2, 62, 16);
  });

  generate(scene, 'dragon-prototype', 126, 96, (graphics) => {
    graphics.fillStyle(0x34204e, 0.3);
    graphics.fillEllipse(64, 84, 105, 20);
    graphics.fillStyle(0x7040b3, 0.78);
    graphics.fillTriangle(42, 45, 3, 15, 20, 65);
    graphics.fillTriangle(84, 45, 123, 15, 106, 65);
    graphics.fillStyle(0x9b5be0);
    graphics.fillEllipse(63, 52, 70, 58);
    graphics.fillCircle(65, 28, 27);
    graphics.fillStyle(0xffd75e);
    graphics.fillTriangle(48, 15, 50, 0, 59, 17);
    graphics.fillTriangle(72, 16, 82, 1, 82, 22);
    graphics.fillStyle(0xf1d8ff);
    graphics.fillCircle(56, 27, 7);
    graphics.fillCircle(75, 27, 7);
    graphics.fillStyle(0x28163c);
    graphics.fillCircle(57, 27, 3);
    graphics.fillCircle(76, 27, 3);
    graphics.fillStyle(0xffd75e);
    graphics.fillTriangle(65, 38, 58, 45, 72, 45);
    graphics.fillStyle(0x7040b3);
    graphics.fillTriangle(91, 59, 125, 78, 88, 75);
    graphics.lineStyle(5, 0xffd75e, 0.9);
    graphics.strokeCircle(63, 51, 41);
  });

  for (const [key, bodyColor, accentColor] of [
    ['vip-owner-gold', 0xc79a2f, 0xffefb0],
    ['vip-guard-gold', 0x3e354d, 0xe7b94c],
    ['vip-owner-purple', 0x764da5, 0xf0deff],
    ['vip-guard-purple', 0x2f2944, 0xb88de5],
    ['vip-boss', 0x542b72, 0xffd75e],
  ] as const) {
    generate(scene, key, 52, 58, (graphics) => {
      graphics.fillStyle(bodyColor);
      graphics.fillCircle(26, 24, 19);
      graphics.fillStyle(accentColor);
      graphics.fillCircle(20, 19, 5);
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(32, 18, 5);
      graphics.fillStyle(0x21172b);
      graphics.fillCircle(33, 18, 2);
      graphics.fillStyle(accentColor);
      graphics.fillRoundedRect(14, 39, 24, 13, 6);
      graphics.fillStyle(0x2b2136);
      graphics.fillRect(10, 4, 32, 7);
    });
  }

  generate(scene, 'vip-rare-plant', 62, 74, (graphics) => {
    graphics.fillStyle(0x4f3d70);
    graphics.fillRoundedRect(15, 54, 32, 18, 5);
    graphics.fillStyle(0x3e9b68);
    graphics.fillEllipse(21, 40, 22, 36);
    graphics.fillEllipse(41, 36, 22, 42);
    graphics.fillStyle(0xd985e9);
    graphics.fillCircle(20, 23, 9);
    graphics.fillStyle(0xffd75e);
    graphics.fillCircle(42, 17, 10);
  });
}
