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
}
