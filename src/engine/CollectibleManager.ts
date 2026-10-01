// Collectibles (XP gems, coins, health hearts) and Particles

import { SpriteRenderer } from '../renderer/SpriteRenderer';
import { Player } from './Player';

export type CollectibleType = 'gem' | 'coin' | 'heart';

export class Collectible {
  x: number;
  y: number;
  type: CollectibleType;
  value: number;
  radius: number = 10;
  animTime: number = Math.random() * 10;
  isBeingAttracted: boolean = false;
  speed: number = 0;

  constructor(x: number, y: number, type: CollectibleType, value: number = 1) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.value = value;
  }

  update(dt: number, player: Player): boolean {
    this.animTime += dt;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    // Check magnet pull
    if (dist <= player.magnetRadius) {
      this.isBeingAttracted = true;
    }

    if (this.isBeingAttracted) {
      this.speed += 800 * dt;
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * this.speed * dt;

      // Pickup trigger
      if (dist < player.radius + this.radius) {
        return true; // Collected!
      }
    }

    return false;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    if (this.type === 'gem') {
      SpriteRenderer.drawXpGem(ctx, screenX, screenY, 11, this.animTime);
    } else if (this.type === 'coin') {
      SpriteRenderer.drawCoin(ctx, screenX, screenY, 10, this.animTime);
    } else if (this.type === 'heart') {
      ctx.save();
      ctx.translate(screenX, screenY + Math.sin(this.animTime * 6) * 3);
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('❤️', 0, 0);
      ctx.restore();
    }
  }
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
}

export class CollectibleManager {
  collectibles: Collectible[] = [];
  floatingTexts: FloatingText[] = [];

  reset(): void {
    this.collectibles = [];
    this.floatingTexts = [];
  }

  spawnDrop(x: number, y: number, xpValue: number, coinValue: number): void {
    // Spawn XP gem
    this.collectibles.push(new Collectible(x, y, 'gem', xpValue));

    // Chance for coin
    if (Math.random() < 0.35) {
      this.collectibles.push(new Collectible(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20, 'coin', coinValue));
    }

    // Small chance for heart
    if (Math.random() < 0.08) {
      this.collectibles.push(new Collectible(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20, 'heart', 25));
    }
  }

  addFloatingText(x: number, y: number, text: string, color: string = '#ffcc00'): void {
    this.floatingTexts.push({ x, y, text, color, alpha: 1, life: 0.8 });
  }

  update(dt: number, player: Player, onCollectGem: (val: number) => void, onCollectCoin: (val: number) => void, onCollectHeart: (val: number) => void): void {
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      if (col.update(dt, player)) {
        if (col.type === 'gem') onCollectGem(col.value);
        else if (col.type === 'coin') onCollectCoin(col.value);
        else if (col.type === 'heart') onCollectHeart(col.value);

        this.collectibles.splice(i, 1);
      }
    }

    // Floating text update
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y -= 35 * dt;
      ft.alpha = Math.max(0, ft.life / 0.8);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    for (const col of this.collectibles) {
      col.draw(ctx, cameraX, cameraY);
    }

    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = '700 16px Fredoka, sans-serif';
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, ft.x - cameraX, ft.y - cameraY);
      ctx.fillText(ft.text, ft.x - cameraX, ft.y - cameraY);
      ctx.restore();
    }
  }
}
