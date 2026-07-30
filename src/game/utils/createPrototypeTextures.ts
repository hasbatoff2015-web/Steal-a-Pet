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
}
