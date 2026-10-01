// Weapons, Upgrades, Projectiles, and Combat Systems

import { SpriteRenderer } from '../renderer/SpriteRenderer';
import { Player } from './Player';
import { Enemy } from './EnemyManager';

export interface WeaponUpgradeOption {
  id: string;
  name: string;
  icon: string;
  level: number;
  description: string;
  type: 'weapon' | 'passive';
}

export interface Projectile {
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  life: number;
  type: 'bolt' | 'book' | 'lightning';
  angle?: number;
}

export class WeaponSystem {
  // Weapon Levels (0 = not unlocked, 1-5)
  magicBoltLevel: number = 1;
  orbitingBookLevel: number = 0;
  lightningLevel: number = 0;

  // Passives
  moveSpeedBoost: number = 0;
  maxHpBoost: number = 0;
  magnetBoost: number = 0;

  // Cooldown timers
  boltCooldownTimer: number = 0;
  lightningCooldownTimer: number = 0;

  // Active Orbiting Angle
  orbitAngle: number = 0;

  // Active Projectiles
  projectiles: Projectile[] = [];

  reset(): void {
    this.magicBoltLevel = 1;
    this.orbitingBookLevel = 0;
    this.lightningLevel = 0;
    this.moveSpeedBoost = 0;
    this.maxHpBoost = 0;
    this.magnetBoost = 0;
    this.boltCooldownTimer = 0;
    this.lightningCooldownTimer = 0;
    this.orbitAngle = 0;
    this.projectiles = [];
  }

  getAvailableUpgrades(): WeaponUpgradeOption[] {
    const allOptions: WeaponUpgradeOption[] = [
      {
        id: 'magic_bolt',
        name: 'Magic Wand',
        icon: '🪄',
        level: this.magicBoltLevel + 1,
        description: this.magicBoltLevel === 0 ? 'Fires auto-aiming magical energy bolts.' : `Increase damage & fire rate (Lv ${this.magicBoltLevel + 1}).`,
        type: 'weapon'
      },
      {
        id: 'orbiting_book',
        name: 'Orbital Magic Books',
        icon: '📖',
        level: this.orbitingBookLevel + 1,
        description: this.orbitingBookLevel === 0 ? 'Magic books rotate around Bunny shielding from enemies.' : `Add more orbital books & radius (Lv ${this.orbitingBookLevel + 1}).`,
        type: 'weapon'
      },
      {
        id: 'lightning',
        name: 'Thunder Zap',
        icon: '⚡',
        level: this.lightningLevel + 1,
        description: this.lightningLevel === 0 ? 'Strikes nearby enemies with lightning bolts.' : `Strike more targets with boosted power (Lv ${this.lightningLevel + 1}).`,
        type: 'weapon'
      },
      {
        id: 'speed_boost',
        name: 'Swift Bunny Boots',
        icon: '👟',
        level: this.moveSpeedBoost + 1,
        description: `Increase Bunny movement speed by +15%.`,
        type: 'passive'
      },
      {
        id: 'hp_boost',
        name: 'Cute Heart Cupcake',
        icon: '🧁',
        level: this.maxHpBoost + 1,
        description: `Increase Max Health by +25 and restore HP.`,
        type: 'passive'
      },
      {
        id: 'magnet_boost',
        name: 'Shiny Gem Magnet',
        icon: '🧲',
        level: this.magnetBoost + 1,
        description: `Expand gem pickup radius by +30%.`,
        type: 'passive'
      }
    ];

    // Filter out max level items (max level 5)
    const validOptions = allOptions.filter(opt => opt.level <= 5);

    // Shuffle and pick 3
    validOptions.sort(() => Math.random() - 0.5);
    return validOptions.slice(0, 3);
  }

  applyUpgrade(optionId: string, player: Player): void {
    switch (optionId) {
      case 'magic_bolt':
        this.magicBoltLevel = Math.min(5, this.magicBoltLevel + 1);
        break;
      case 'orbiting_book':
        this.orbitingBookLevel = Math.min(5, this.orbitingBookLevel + 1);
        break;
      case 'lightning':
        this.lightningLevel = Math.min(5, this.lightningLevel + 1);
        break;
      case 'speed_boost':
        this.moveSpeedBoost++;
        player.speed += 30;
        break;
      case 'hp_boost':
        this.maxHpBoost++;
        player.maxHp += 25;
        player.hp += 25;
        break;
      case 'magnet_boost':
        this.magnetBoost++;
        player.magnetRadius += 40;
        break;
    }
  }

  update(
    dt: number,
    player: Player,
    enemies: Enemy[],
    onHitEnemy: (enemy: Enemy, damage: number, isFatal: boolean) => void,
    onLightningStrike?: (x1: number, y1: number, x2: number, y2: number) => void
  ): void {
    // 1. Magic Wand Auto-Firing
    if (this.magicBoltLevel > 0) {
      this.boltCooldownTimer -= dt;
      const fireInterval = Math.max(0.25, 1.2 - this.magicBoltLevel * 0.18);

      if (this.boltCooldownTimer <= 0 && enemies.length > 0) {
        this.boltCooldownTimer = fireInterval;

        // Find closest enemy
        let closestEnemy: Enemy | null = null;
        let closestDist = Infinity;

        for (const enemy of enemies) {
          const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
          if (dist < closestDist) {
            closestDist = dist;
            closestEnemy = enemy;
          }
        }

        if (closestEnemy && closestDist < 500) {
          const angle = Math.atan2(closestEnemy.y - player.y, closestEnemy.x - player.x);
          const boltSpeed = 480;
          const projCount = Math.min(4, Math.floor(1 + this.magicBoltLevel / 2));

          for (let i = 0; i < projCount; i++) {
            const spreadAngle = angle + (i - (projCount - 1) / 2) * 0.2;
            this.projectiles.push({
              x: player.x,
              y: player.y,
              vx: Math.cos(spreadAngle) * boltSpeed,
              vy: Math.sin(spreadAngle) * boltSpeed,
              radius: 12,
              damage: 20 + this.magicBoltLevel * 10,
              life: 1.5,
              type: 'bolt',
              angle: spreadAngle
            });
          }
        }
      }
    }

    // 2. Orbiting Books Update
    if (this.orbitingBookLevel > 0) {
      this.orbitAngle += dt * 3;
      const bookCount = this.orbitingBookLevel + 1;
      const orbitRadius = 80 + this.orbitingBookLevel * 10;
      const bookDamage = 15 + this.orbitingBookLevel * 8;

      for (let i = 0; i < bookCount; i++) {
        const curAngle = this.orbitAngle + (i * Math.PI * 2) / bookCount;
        const bx = player.x + Math.cos(curAngle) * orbitRadius;
        const by = player.y + Math.sin(curAngle) * orbitRadius;

        // Collision check with enemies
        for (const enemy of enemies) {
          const dist = Math.hypot(enemy.x - bx, enemy.y - by);
          if (dist < enemy.radius + 18) {
            if (enemy.hitTimer <= 0) {
              const fatal = enemy.takeDamage(bookDamage * dt * 8);
              onHitEnemy(enemy, Math.round(bookDamage), fatal);
            }
          }
        }
      }
    }

    // 3. Lightning Strikes
    if (this.lightningLevel > 0) {
      this.lightningCooldownTimer -= dt;
      const zapInterval = Math.max(0.6, 2.2 - this.lightningLevel * 0.3);

      if (this.lightningCooldownTimer <= 0 && enemies.length > 0) {
        this.lightningCooldownTimer = zapInterval;
        const strikeCount = Math.min(enemies.length, this.lightningLevel);
        const damage = 40 + this.lightningLevel * 25;

        // Shuffle candidate enemies
        const targets = [...enemies].sort(() => Math.random() - 0.5).slice(0, strikeCount);

        for (const target of targets) {
          const fatal = target.takeDamage(damage);
          onHitEnemy(target, damage, fatal);
          if (onLightningStrike) {
            onLightningStrike(player.x, player.y - 40, target.x, target.y);
          }
        }
      }
    }

    // 4. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Check enemy hit
      let hit = false;
      for (const enemy of enemies) {
        const dist = Math.hypot(enemy.x - p.x, enemy.y - p.y);
        if (dist < enemy.radius + p.radius) {
          const fatal = enemy.takeDamage(p.damage);
          onHitEnemy(enemy, p.damage, fatal);
          hit = true;
          break;
        }
      }

      if (hit || p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, player: Player, cameraX: number, cameraY: number): void {
    // Draw Projectiles
    for (const p of this.projectiles) {
      if (p.type === 'bolt') {
        SpriteRenderer.drawMagicBolt(ctx, p.x - cameraX, p.y - cameraY, p.radius, p.angle || 0);
      }
    }

    // Draw Orbiting Books
    if (this.orbitingBookLevel > 0) {
      const bookCount = this.orbitingBookLevel + 1;
      const orbitRadius = 80 + this.orbitingBookLevel * 10;

      for (let i = 0; i < bookCount; i++) {
        const curAngle = this.orbitAngle + (i * Math.PI * 2) / bookCount;
        const bx = player.x + Math.cos(curAngle) * orbitRadius;
        const by = player.y + Math.sin(curAngle) * orbitRadius;

        SpriteRenderer.drawOrbitingBook(ctx, bx - cameraX, by - cameraY, 14, curAngle);
      }
    }
  }
}
