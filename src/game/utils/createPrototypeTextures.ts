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
}
