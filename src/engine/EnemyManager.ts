// Enemy entities and Spawner Manager

import { SpriteRenderer } from '../renderer/SpriteRenderer';
import { Player } from './Player';

export type EnemyType = 'slime' | 'mushroom' | 'bee' | 'boss';

export class Enemy {
  x: number;
  y: number;
  type: EnemyType;
  radius: number;
  maxHp: number;
  hp: number;
  speed: number;
  damage: number;
  xpValue: number;
  coinValue: number;

  animTime: number = Math.random() * 10;
  hitTimer: number = 0;

  constructor(x: number, y: number, type: EnemyType, multiplier: number = 1) {
    this.x = x;
    this.y = y;
    this.type = type;

    switch (type) {
      case 'slime':
        this.radius = 18;
        this.maxHp = 25 * multiplier;
        this.speed = 100 + Math.random() * 20;
        this.damage = 10;
        this.xpValue = 15;
        this.coinValue = 1;
        break;
      case 'mushroom':
        this.radius = 22;
        this.maxHp = 55 * multiplier;
        this.speed = 70 + Math.random() * 15;
        this.damage = 18;
        this.xpValue = 30;
        this.coinValue = 3;
        break;
      case 'bee':
        this.radius = 16;
        this.maxHp = 35 * multiplier;
        this.speed = 160 + Math.random() * 20;
        this.damage = 12;
        this.xpValue = 25;
        this.coinValue = 2;
        break;
      case 'boss':
        this.radius = 48;
        this.maxHp = 600 * multiplier;
        this.speed = 85;
        this.damage = 30;
        this.xpValue = 250;
        this.coinValue = 50;
        break;
    }
    this.hp = this.maxHp;
  }

  update(dt: number, player: Player): void {
    this.animTime += dt;
    if (this.hitTimer > 0) {
      this.hitTimer -= dt;
    }

    // Direct movement towards player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0.1) {
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * this.speed * dt;
    }
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    this.hitTimer = 0.12;
    return this.hp <= 0;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;
    const isHit = this.hitTimer > 0;

    switch (this.type) {
      case 'slime':
        SpriteRenderer.drawSlime(ctx, { x: screenX, y: screenY, radius: this.radius, animTime: this.animTime, isHit });
        break;
      case 'mushroom':
        SpriteRenderer.drawMushroom(ctx, { x: screenX, y: screenY, radius: this.radius, animTime: this.animTime, isHit });
        break;
      case 'bee':
        SpriteRenderer.drawBee(ctx, { x: screenX, y: screenY, radius: this.radius, animTime: this.animTime, isHit });
        break;
      case 'boss':
        SpriteRenderer.drawBossSlime(ctx, { x: screenX, y: screenY, radius: this.radius, animTime: this.animTime, isHit });
        break;
    }
  }
}

export class EnemyManager {
  enemies: Enemy[] = [];
  spawnTimer: number = 0;
  bossSpawned: boolean = false;

  reset(): void {
    this.enemies = [];
    this.spawnTimer = 0;
    this.bossSpawned = false;
  }

  update(dt: number, gameTime: number, player: Player, screenWidth: number, screenHeight: number): void {
    // Wave scaling formula
    const difficultyMult = 1 + gameTime / 120; // scales up over time
    const spawnInterval = Math.max(0.35, 1.8 - gameTime / 90);

    this.spawnTimer += dt;
    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemyAroundPlayer(player, screenWidth, screenHeight, difficultyMult, gameTime);
    }

    // Boss spawn at 3 minute mark (180s) or 5 min
    if (gameTime >= 180 && !this.bossSpawned) {
      this.bossSpawned = true;
      this.spawnBoss(player, screenWidth, screenHeight, difficultyMult);
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      this.enemies[i].update(dt, player);
    }
  }

  spawnEnemyAroundPlayer(player: Player, screenWidth: number, screenHeight: number, multiplier: number, gameTime: number): void {
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = Math.max(screenWidth, screenHeight) * 0.65 + 60;
    const x = player.x + Math.cos(angle) * spawnDist;
    const y = player.y + Math.sin(angle) * spawnDist;

    let type: EnemyType = 'slime';
    const rand = Math.random();

    if (gameTime > 60) {
      if (rand < 0.45) type = 'slime';
      else if (rand < 0.8) type = 'bee';
      else type = 'mushroom';
    } else if (gameTime > 30) {
      if (rand < 0.65) type = 'slime';
      else type = 'bee';
    }

    this.enemies.push(new Enemy(x, y, type, multiplier));
  }

  spawnBoss(player: Player, screenWidth: number, screenHeight: number, multiplier: number): void {
    const angle = Math.random() * Math.PI * 2;
    const spawnDist = Math.max(screenWidth, screenHeight) * 0.7;
    const x = player.x + Math.cos(angle) * spawnDist;
    const y = player.y + Math.sin(angle) * spawnDist;

    this.enemies.push(new Enemy(x, y, 'boss', multiplier * 1.5));
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    for (const enemy of this.enemies) {
      enemy.draw(ctx, cameraX, cameraY);
    }
  }
}
