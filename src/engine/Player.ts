// Player entity logic

import { SpriteRenderer } from '../renderer/SpriteRenderer';

export class Player {
  x: number = 0;
  y: number = 0;
  radius: number = 22;

  maxHp: number = 100;
  hp: number = 100;
  speed: number = 220; // pixels per second
  magnetRadius: number = 130;

  level: number = 1;
  xp: number = 0;
  xpToNextLevel: number = 100;

  kills: number = 0;
  coins: number = 0;
  gems: number = 0;

  facingLeft: boolean = false;
  animTime: number = 0;

  invincibleTimer: number = 0;
  isHit: boolean = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.maxHp = 100;
    this.hp = 100;
    this.speed = 220;
    this.magnetRadius = 130;
    this.level = 1;
    this.xp = 0;
    this.xpToNextLevel = 100;
    this.kills = 0;
    this.coins = 0;
    this.gems = 0;
    this.invincibleTimer = 0;
    this.isHit = false;
  }

  update(dt: number, moveX: number, moveY: number): void {
    this.animTime += dt;

    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
      this.isHit = Math.floor(this.invincibleTimer * 20) % 2 === 0;
    } else {
      this.isHit = false;
    }

    if (moveX !== 0 || moveY !== 0) {
      // Normalize vector
      const len = Math.hypot(moveX, moveY);
      const nx = moveX / len;
      const ny = moveY / len;

      this.x += nx * this.speed * dt;
      this.y += ny * this.speed * dt;

      if (nx < 0) this.facingLeft = true;
      if (nx > 0) this.facingLeft = false;
    }
  }

  takeDamage(amount: number): boolean {
    if (this.invincibleTimer > 0) return false;

    this.hp -= amount;
    this.invincibleTimer = 0.5; // 0.5 sec iframe
    if (this.hp < 0) this.hp = 0;
    return true;
  }

  addXp(amount: number): boolean {
    this.xp += amount;
    this.gems++;
    if (this.xp >= this.xpToNextLevel) {
      this.xp -= this.xpToNextLevel;
      this.level++;
      this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.35);
      return true; // Leveled up!
    }
    return false;
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    SpriteRenderer.drawPlayer(ctx, {
      x: this.x - cameraX,
      y: this.y - cameraY,
      radius: this.radius,
      facingLeft: this.facingLeft,
      animTime: this.animTime,
      isHit: this.isHit
    });
  }
}
