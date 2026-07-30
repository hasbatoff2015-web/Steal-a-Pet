import Phaser from 'phaser';

import { createGameConfig } from './game/config/gameConfig';
import './style.css';

new Phaser.Game(createGameConfig());
