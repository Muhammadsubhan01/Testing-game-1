// Main Application Entry Point & Game Loop Control

import './style.css';
import { Player } from './engine/Player';
import { EnemyManager } from './engine/EnemyManager';
import { CollectibleManager } from './engine/CollectibleManager';
import { WeaponSystem } from './engine/WeaponSystem';
import { soundManager } from './audio/SoundManager';
import { SpriteRenderer } from './renderer/SpriteRenderer';

// Game States
type GameState = 'START' | 'PLAYING' | 'UPGRADE' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';

class SurvivorGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private state: GameState = 'START';
  private gameTime: number = 0; // seconds
  private targetVictoryTime: number = 300; // 5 minutes run

  // Core Engine Systems
  private player: Player;
  private enemyManager: EnemyManager;
  private collectibleManager: CollectibleManager;
  private weaponSystem: WeaponSystem;

  // Camera
  private cameraX: number = 0;
  private cameraY: number = 0;

  // Controls & Touch Joystick
  private keys: Record<string, boolean> = {};
  private joystickMove: { x: number; y: number } = { x: 0, y: 0 };
  private joystickActive: boolean = false;

  // Revive Mechanic
  private reviveUsed: boolean = false;

  // UI Elements
  private hudElement = document.getElementById('hud')!;
  private startScreen = document.getElementById('start-screen')!;
  private upgradeScreen = document.getElementById('upgrade-screen')!;
  private pauseScreen = document.getElementById('pause-screen')!;
  private gameoverScreen = document.getElementById('gameover-screen')!;
  private victoryScreen = document.getElementById('victory-screen')!;

  // HUD Dynamic Texts
  private xpBarFill = document.getElementById('xp-bar-fill')!;
  private levelBadge = document.getElementById('level-badge')!;
  private xpText = document.getElementById('xp-text')!;
  private gameTimerText = document.getElementById('game-timer')!;
  private killCountText = document.getElementById('kill-count')!;
  private coinCountText = document.getElementById('coin-count')!;
  private hpBarFill = document.getElementById('hp-bar-fill')!;
  private hpText = document.getElementById('hp-text')!;
  private inventorySlots = document.getElementById('inventory-slots')!;

  private lastTime: number = 0;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Initialize Engine Components
    this.player = new Player(0, 0);
    this.enemyManager = new EnemyManager();
    this.collectibleManager = new CollectibleManager();
    this.weaponSystem = new WeaponSystem();

    this.setupEventListeners();
    this.setupVirtualJoystick();

    // Start Game Loop
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  private resizeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private setupEventListeners(): void {
    // Keyboard Input
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (this.state === 'PLAYING') this.pauseGame();
        else if (this.state === 'PAUSED') this.resumeGame();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Start Screen Button
    document.getElementById('start-btn')?.addEventListener('click', () => {
      soundManager.playClick();
      this.startGame();
    });

    // Pause HUD Button
    document.getElementById('pause-btn')?.addEventListener('click', () => {
      soundManager.playClick();
      this.pauseGame();
    });

    // Pause Modal Buttons
    document.getElementById('resume-btn')?.addEventListener('click', () => {
      soundManager.playClick();
      this.resumeGame();
    });

    document.getElementById('restart-from-pause-btn')?.addEventListener('click', () => {
      soundManager.playClick();
      this.startGame();
    });

    // Audio Toggles
    const musicBtn = document.getElementById('music-toggle-btn')!;
    musicBtn.addEventListener('click', () => {
      soundManager.playClick();
      const active = soundManager.toggleMusic();
      musicBtn.textContent = active ? 'ON' : 'OFF';
      musicBtn.classList.toggle('active', active);
    });

    const sfxBtn = document.getElementById('sfx-toggle-btn')!;
    sfxBtn.addEventListener('click', () => {
      soundManager.playClick();
      const active = soundManager.toggleSfx();
      sfxBtn.textContent = active ? 'ON' : 'OFF';
      sfxBtn.classList.toggle('active', active);
    });

    // Game Over Buttons
    document.getElementById('restart-btn')?.addEventListener('click', () => {
      soundManager.playClick();
      this.startGame();
    });

    const reviveBtn = document.getElementById('revive-btn');
    reviveBtn?.addEventListener('click', () => {
      soundManager.playClick();
      if (!this.reviveUsed) {
        this.reviveUsed = true;
        this.player.hp = this.player.maxHp;
        this.gameoverScreen.classList.add('hidden');
        this.state = 'PLAYING';
        this.collectibleManager.addFloatingText(this.player.x, this.player.y - 40, 'REVIVED! ❤️', '#00e676');
      }
    });

    // Victory Button
    document.getElementById('vic-playagain-btn')?.addEventListener('click', () => {
      soundManager.playClick();
      this.startGame();
    });
  }

  // Virtual Joystick Setup for Mobile/Touch & Mouse Dragging
  private setupVirtualJoystick(): void {
    const zone = document.getElementById('joystick-zone')!;
    const base = document.getElementById('joystick-base')!;
    const thumb = document.getElementById('joystick-thumb')!;

    const handlePointerMove = (clientX: number, clientY: number) => {
      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const maxDist = rect.width / 2;
      const dist = Math.hypot(dx, dy);

      if (dist > maxDist) {
        dx = (dx / dist) * maxDist;
        dy = (dy / dist) * maxDist;
      }

      thumb.style.transform = `translate(${dx}px, ${dy}px)`;
      this.joystickMove = { x: dx / maxDist, y: dy / maxDist };
    };

    const resetJoystick = () => {
      thumb.style.transform = `translate(0px, 0px)`;
      this.joystickMove = { x: 0, y: 0 };
      this.joystickActive = false;
    };

    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.joystickActive = true;
      const touch = e.touches[0];
      handlePointerMove(touch.clientX, touch.clientY);
    });

    zone.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.joystickActive && e.touches.length > 0) {
        const touch = e.touches[0];
        handlePointerMove(touch.clientX, touch.clientY);
      }
    });

    zone.addEventListener('touchend', resetJoystick);
    zone.addEventListener('touchcancel', resetJoystick);
  }

  private startGame(): void {
    this.gameTime = 0;
    this.reviveUsed = false;

    // Reset player & engine components
    this.player.reset(0, 0);
    this.enemyManager.reset();
    this.collectibleManager.reset();
    this.weaponSystem.reset();

    // UI State
    this.startScreen.classList.add('hidden');
    this.pauseScreen.classList.add('hidden');
    this.upgradeScreen.classList.add('hidden');
    this.gameoverScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.hudElement.classList.remove('hidden');

    this.state = 'PLAYING';
    soundManager.startBackgroundMusic();
    this.updateHUD();
  }

  private pauseGame(): void {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.pauseScreen.classList.remove('hidden');
    }
  }

  private resumeGame(): void {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.pauseScreen.classList.add('hidden');
    }
  }

  private triggerLevelUp(): void {
    this.state = 'UPGRADE';
    soundManager.playLevelUp();

    const options = this.weaponSystem.getAvailableUpgrades();
    const container = document.getElementById('upgrade-options')!;
    container.innerHTML = '';

    options.forEach((opt) => {
      const card = document.createElement('div');
      card.className = 'upgrade-card-item';
      card.innerHTML = `
        <div class="upgrade-icon-box">${opt.icon}</div>
        <div class="upgrade-info">
          <div class="upgrade-name-row">
            <span class="upgrade-name">${opt.name}</span>
            <span class="upgrade-badge">Lvl ${opt.level}</span>
          </div>
          <div class="upgrade-desc">${opt.description}</div>
        </div>
        <button class="select-btn">SELECT</button>
      `;

      card.addEventListener('click', () => {
        soundManager.playClick();
        this.weaponSystem.applyUpgrade(opt.id, this.player);
        this.upgradeScreen.classList.add('hidden');
        this.state = 'PLAYING';
        this.updateHUD();
      });

      container.appendChild(card);
    });

    this.upgradeScreen.classList.remove('hidden');
  }

  private triggerGameOver(): void {
    this.state = 'GAMEOVER';
    soundManager.playPlayerHit();

    // Update GameOver Stats
    const progressPct = Math.min(100, Math.floor((this.gameTime / this.targetVictoryTime) * 100));
    document.getElementById('go-progress-fill')!.style.width = `${progressPct}%`;
    document.getElementById('go-progress-text')!.textContent = `${progressPct}%`;

    document.getElementById('go-coins')!.textContent = `${this.player.coins}`;
    document.getElementById('go-gems')!.textContent = `${this.player.gems}`;
    document.getElementById('go-kills')!.textContent = `${this.player.kills}`;
    document.getElementById('go-time')!.textContent = this.formatTime(this.gameTime);

    // Disable revive button if already used
    const reviveBtn = document.getElementById('revive-btn') as HTMLButtonElement;
    if (reviveBtn) {
      if (this.reviveUsed) {
        reviveBtn.style.display = 'none';
      } else {
        reviveBtn.style.display = 'block';
      }
    }

    this.gameoverScreen.classList.remove('hidden');
  }

  private triggerVictory(): void {
    this.state = 'VICTORY';

    document.getElementById('vic-coins')!.textContent = `${this.player.coins}`;
    document.getElementById('vic-gems')!.textContent = `${this.player.gems}`;
    document.getElementById('vic-kills')!.textContent = `${this.player.kills}`;
    document.getElementById('vic-time')!.textContent = this.formatTime(this.gameTime);

    this.victoryScreen.classList.remove('hidden');
  }

  // Helper time formatter (MM:SS)
  private formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private updateHUD(): void {
    // XP Bar
    const xpPct = (this.player.xp / this.player.xpToNextLevel) * 100;
    this.xpBarFill.style.width = `${Math.min(100, xpPct)}%`;
    this.levelBadge.textContent = `Lv. ${this.player.level}`;
    this.xpText.textContent = `${this.player.xp} / ${this.player.xpToNextLevel} XP`;

    // Timer & Counters
    this.gameTimerText.textContent = this.formatTime(this.gameTime);
    this.killCountText.textContent = `${this.player.kills}`;
    this.coinCountText.textContent = `${this.player.coins}`;

    // HP Bar
    const hpPct = (this.player.hp / this.player.maxHp) * 100;
    this.hpBarFill.style.width = `${Math.max(0, hpPct)}%`;
    this.hpText.textContent = `${Math.ceil(this.player.hp)}/${this.player.maxHp}`;

    // Inventory Weapon Icons
    this.inventorySlots.innerHTML = '';
    const equipped = [
      { icon: '🪄', lvl: this.weaponSystem.magicBoltLevel },
      { icon: '📖', lvl: this.weaponSystem.orbitingBookLevel },
      { icon: '⚡', lvl: this.weaponSystem.lightningLevel },
      { icon: '👟', lvl: this.weaponSystem.moveSpeedBoost },
      { icon: '🧁', lvl: this.weaponSystem.maxHpBoost },
      { icon: '🧲', lvl: this.weaponSystem.magnetBoost },
    ].filter((item) => item.lvl > 0);

    equipped.forEach((item) => {
      const slot = document.createElement('div');
      slot.className = 'inv-slot';
      slot.innerHTML = `${item.icon}<span class="inv-lvl">v${item.lvl}</span>`;
      this.inventorySlots.appendChild(slot);
    });
  }

  // --- Main Engine Update & Render Loop ---
  private gameLoop(time: number): void {
    if (!this.lastTime) this.lastTime = time;
    const dt = Math.min(0.1, (time - this.lastTime) / 1000); // delta time cap
    this.lastTime = time;

    if (this.state === 'PLAYING') {
      this.updateGame(dt);
    }

    this.renderGame();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  private updateGame(dt: number): void {
    this.gameTime += dt;

    // Victory check
    if (this.gameTime >= this.targetVictoryTime) {
      this.triggerVictory();
      return;
    }

    // Process Movement Inputs (Keyboard WASD / Arrows or Virtual Joystick)
    let moveX = 0;
    let moveY = 0;

    if (this.keys['w'] || this.keys['arrowup']) moveY -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveY += 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

    if (this.joystickMove.x !== 0 || this.joystickMove.y !== 0) {
      moveX = this.joystickMove.x;
      moveY = this.joystickMove.y;
    }

    // Update Player
    this.player.update(dt, moveX, moveY);

    // Camera follow player
    this.cameraX = this.player.x - this.canvas.width / 2;
    this.cameraY = this.player.y - this.canvas.height / 2;

    // Update Enemies & Spawner
    this.enemyManager.update(dt, this.gameTime, this.player, this.canvas.width, this.canvas.height);

    // Update Player Collision with Enemies
    for (const enemy of this.enemyManager.enemies) {
      const dist = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
      if (dist < this.player.radius + enemy.radius * 0.7) {
        if (this.player.takeDamage(enemy.damage)) {
          soundManager.playPlayerHit();
          this.collectibleManager.addFloatingText(this.player.x, this.player.y - 30, `-${enemy.damage}`, '#ff0055');

          if (this.player.hp <= 0) {
            this.triggerGameOver();
            return;
          }
        }
      }
    }

    // Update Weapons & Combat
    this.weaponSystem.update(
      dt,
      this.player,
      this.enemyManager.enemies,
      (enemy, damage, isFatal) => {
        soundManager.playHit();
        this.collectibleManager.addFloatingText(enemy.x, enemy.y - 15, `-${damage}`, '#ffffff');

        if (isFatal) {
          this.player.kills++;
          this.collectibleManager.spawnDrop(enemy.x, enemy.y, enemy.xpValue, enemy.coinValue);
        }
      },
      (x1, y1, x2, y2) => {
        // Lightning visual effect line
        SpriteRenderer.drawLightning(this.ctx, x1 - this.cameraX, y1 - this.cameraY, x2 - this.cameraX, y2 - this.cameraY);
      }
    );

    // Remove defeated enemies
    this.enemyManager.enemies = this.enemyManager.enemies.filter((e) => e.hp > 0);

    // Update Collectibles
    this.collectibleManager.update(
      dt,
      this.player,
      (xpVal) => {
        soundManager.playGem();
        const leveledUp = this.player.addXp(xpVal);
        this.collectibleManager.addFloatingText(this.player.x, this.player.y - 25, `+${xpVal} XP`, '#00d2ff');

        if (leveledUp) {
          this.triggerLevelUp();
        }
      },
      (coinVal) => {
        soundManager.playCoin();
        this.player.coins += coinVal;
        this.collectibleManager.addFloatingText(this.player.x, this.player.y - 25, `+${coinVal} 🪙`, '#ffcc00');
      },
      (healVal) => {
        this.player.heal(healVal);
        this.collectibleManager.addFloatingText(this.player.x, this.player.y - 25, `+${healVal} HP ❤️`, '#00e676');
      }
    );

    // Update HUD Text & Bars
    this.updateHUD();
  }

  // --- Render Method ---
  private renderGame(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Colorful Tiled Grass Background
    this.drawBackground();

    // Draw Collectibles & Floating Texts
    this.collectibleManager.draw(this.ctx, this.cameraX, this.cameraY);

    // Draw Enemies
    this.enemyManager.draw(this.ctx, this.cameraX, this.cameraY);

    // Draw Player
    this.player.draw(this.ctx, this.cameraX, this.cameraY);

    // Draw Weapon Projectiles & Effects
    this.weaponSystem.draw(this.ctx, this.player, this.cameraX, this.cameraY);
  }

  private drawBackground(): void {
    const tileSize = 128;
    const startX = Math.floor(this.cameraX / tileSize) * tileSize;
    const startY = Math.floor(this.cameraY / tileSize) * tileSize;
    const endX = startX + this.canvas.width + tileSize * 2;
    const endY = startY + this.canvas.height + tileSize * 2;

    for (let x = startX; x < endX; x += tileSize) {
      for (let y = startY; y < endY; y += tileSize) {
        const screenX = x - this.cameraX;
        const screenY = y - this.cameraY;

        // Alternating tile pattern
        const tileIndex = (Math.abs(Math.floor(x / tileSize)) + Math.abs(Math.floor(y / tileSize))) % 2;
        this.ctx.fillStyle = tileIndex === 0 ? '#43b95a' : '#3caa53';
        this.ctx.fillRect(screenX, screenY, tileSize, tileSize);

        // Cute grass tuft details
        if ((Math.abs(Math.floor(x / tileSize) * 17) + Math.abs(Math.floor(y / tileSize) * 31)) % 5 === 0) {
          this.ctx.fillStyle = '#2f9344';
          this.ctx.beginPath();
          this.ctx.arc(screenX + 30, screenY + 40, 6, 0, Math.PI * 2);
          this.ctx.arc(screenX + 38, screenY + 36, 8, 0, Math.PI * 2);
          this.ctx.arc(screenX + 46, screenY + 40, 6, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  new SurvivorGame();
});
