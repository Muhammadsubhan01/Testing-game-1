// Procedural Canvas Sprite Renderer for Cute Bunny Survivor

export interface EntityDrawOptions {
  x: number;
  y: number;
  radius: number;
  facingLeft?: boolean;
  animTime?: number;
  isHit?: boolean;
  alpha?: number;
}

export class SpriteRenderer {
  // 1. Draw Player (Cute Bunny)
  static drawPlayer(ctx: CanvasRenderingContext2D, opts: EntityDrawOptions): void {
    const { x, y, radius, facingLeft = false, animTime = 0, isHit = false, alpha = 1 } = opts;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);

    // Dynamic bounce on movement
    const bounceY = Math.sin(animTime * 12) * (radius * 0.1);
    ctx.translate(0, bounceY);

    if (facingLeft) {
      ctx.scale(-1, 1);
    }

    // Flash white when hit
    if (isHit) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 15;
    }

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.8, radius * 0.7, radius * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fill();

    // Bunny Ears
    const earOffsetAngle = Math.sin(animTime * 10) * 0.08;
    // Left Ear
    ctx.save();
    ctx.translate(-radius * 0.3, -radius * 0.6);
    ctx.rotate(-0.2 + earOffsetAngle);
    ctx.beginPath();
    ctx.ellipse(0, -radius * 0.5, radius * 0.22, radius * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle = isHit ? '#ffffff' : '#f9f9fb';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2d2342';
    ctx.stroke();
    // Inner Ear
    ctx.beginPath();
    ctx.ellipse(0, -radius * 0.5, radius * 0.1, radius * 0.38, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ff99bb';
    ctx.fill();
    ctx.restore();

    // Right Ear
    ctx.save();
    ctx.translate(radius * 0.3, -radius * 0.6);
    ctx.rotate(0.2 - earOffsetAngle);
    ctx.beginPath();
    ctx.ellipse(0, -radius * 0.5, radius * 0.22, radius * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle = isHit ? '#ffffff' : '#f9f9fb';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2d2342';
    ctx.stroke();
    // Inner Ear
    ctx.beginPath();
    ctx.ellipse(0, -radius * 0.5, radius * 0.1, radius * 0.38, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ff99bb';
    ctx.fill();
    ctx.restore();

    // Body
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = isHit ? '#ffffff' : '#ffffff';
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#2d2342';
    ctx.stroke();

    if (!isHit) {
      // Cheeks (Pink Glow)
      ctx.beginPath();
      ctx.arc(-radius * 0.45, radius * 0.15, radius * 0.22, 0, Math.PI * 2);
      ctx.arc(radius * 0.45, radius * 0.15, radius * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 102, 153, 0.45)';
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#2d2342';
      ctx.beginPath();
      ctx.arc(radius * 0.2, -radius * 0.1, radius * 0.12, 0, Math.PI * 2);
      ctx.arc(radius * 0.55, -radius * 0.1, radius * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Eye Highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(radius * 0.23, -radius * 0.14, radius * 0.05, 0, Math.PI * 2);
      ctx.arc(radius * 0.58, -radius * 0.14, radius * 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Nose & Mouth
      ctx.beginPath();
      ctx.arc(radius * 0.38, radius * 0.08, radius * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = '#ff3377';
      ctx.fill();
    }

    ctx.restore();
  }

  // 2. Draw Slime Enemy
  static drawSlime(ctx: CanvasRenderingContext2D, opts: EntityDrawOptions & { color?: string }): void {
    const { x, y, radius, animTime = 0, isHit = false, color = '#3399ff' } = opts;

    ctx.save();
    ctx.translate(x, y);

    // Squish animation
    const squishY = 1 + Math.sin(animTime * 10) * 0.12;
    const squishX = 1 / squishY;
    ctx.scale(squishX, squishY);

    // Shadow
    ctx.beginPath();
    ctx.ellipse(0, radius * 0.8, radius * 0.85, radius * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.arc(0, 0, radius, Math.PI * 0.8, Math.PI * 2.2, false);
    ctx.quadraticCurveTo(0, radius * 0.9, -radius * Math.cos(Math.PI * 0.2), radius * Math.sin(Math.PI * 0.2));
    ctx.fillStyle = isHit ? '#ffffff' : color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1a102f';
    ctx.stroke();

    if (!isHit) {
      // Highlight shine
      ctx.beginPath();
      ctx.ellipse(-radius * 0.3, -radius * 0.3, radius * 0.25, radius * 0.12, -0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fill();

      // Cute Eyes
      ctx.fillStyle = '#1a102f';
      ctx.beginPath();
      ctx.arc(-radius * 0.25, -radius * 0.05, radius * 0.12, 0, Math.PI * 2);
      ctx.arc(radius * 0.25, -radius * 0.05, radius * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Eye Glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-radius * 0.22, -radius * 0.09, radius * 0.04, 0, Math.PI * 2);
      ctx.arc(radius * 0.28, -radius * 0.09, radius * 0.04, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 3. Draw Purple Mushroom Enemy
  static drawMushroom(ctx: CanvasRenderingContext2D, opts: EntityDrawOptions): void {
    const { x, y, radius, animTime = 0, isHit = false } = opts;

    ctx.save();
    ctx.translate(x, y);

    const bob = Math.sin(animTime * 8) * (radius * 0.1);
    ctx.translate(0, bob);

    // Stem
    ctx.beginPath();
    ctx.roundRect(-radius * 0.4, -radius * 0.2, radius * 0.8, radius * 1.1, [10]);
    ctx.fillStyle = isHit ? '#ffffff' : '#f0e6df';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2d2342';
    ctx.stroke();

    // Cap
    ctx.beginPath();
    ctx.arc(0, -radius * 0.2, radius * 1.05, Math.PI, 0);
    ctx.closePath();
    ctx.fillStyle = isHit ? '#ffffff' : '#a044ff';
    ctx.fill();
    ctx.stroke();

    if (!isHit) {
      // White Spots on Cap
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-radius * 0.4, -radius * 0.6, radius * 0.2, 0, Math.PI * 2);
      ctx.arc(radius * 0.3, -radius * 0.7, radius * 0.18, 0, Math.PI * 2);
      ctx.arc(0, -radius * 0.9, radius * 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Sleepy Eyes
      ctx.strokeStyle = '#2d2342';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-radius * 0.2, radius * 0.1, radius * 0.08, Math.PI, 0);
      ctx.arc(radius * 0.2, radius * 0.1, radius * 0.08, Math.PI, 0);
      ctx.stroke();
    }

    ctx.restore();
  }

  // 4. Draw Bee Enemy
  static drawBee(ctx: CanvasRenderingContext2D, opts: EntityDrawOptions): void {
    const { x, y, radius, animTime = 0, isHit = false } = opts;

    ctx.save();
    ctx.translate(x, y);

    const floatY = Math.sin(animTime * 15) * 4;
    ctx.translate(0, floatY);

    // Wings
    const wingAngle = Math.sin(animTime * 30) * 0.3;
    ctx.save();
    ctx.rotate(wingAngle);
    ctx.beginPath();
    ctx.ellipse(-radius * 0.2, -radius * 0.8, radius * 0.3, radius * 0.6, -0.4, 0, Math.PI * 2);
    ctx.ellipse(radius * 0.2, -radius * 0.8, radius * 0.3, radius * 0.6, 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220, 240, 255, 0.75)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.restore();

    // Body (Stripes)
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, radius * 0.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = isHit ? '#ffffff' : '#ffcc00';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2d2342';
    ctx.stroke();

    if (!isHit) {
      // Dark Stripes
      ctx.save();
      ctx.clip();
      ctx.fillStyle = '#2d2342';
      ctx.fillRect(-radius * 0.2, -radius, radius * 0.35, radius * 2);
      ctx.fillRect(radius * 0.3, -radius, radius * 0.35, radius * 2);
      ctx.restore();

      // Big Purple Cute Eyes
      ctx.beginPath();
      ctx.arc(radius * 0.4, -radius * 0.1, radius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#9b51e0';
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(radius * 0.45, -radius * 0.15, radius * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }

    ctx.restore();
  }

  // 5. Draw Boss Slime with Crown
  static drawBossSlime(ctx: CanvasRenderingContext2D, opts: EntityDrawOptions): void {
    const { x, y, radius, animTime = 0, isHit = false } = opts;

    ctx.save();
    // Glowing red aura
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 20;

    // Draw main huge slime body
    this.drawSlime(ctx, { x, y, radius, animTime, isHit, color: '#e6005c' });

    // Draw Crown on top
    ctx.save();
    ctx.translate(x, y - radius * 0.85 + Math.sin(animTime * 8) * 3);

    ctx.beginPath();
    ctx.moveTo(-radius * 0.4, 0);
    ctx.lineTo(-radius * 0.5, -radius * 0.4);
    ctx.lineTo(-radius * 0.2, -radius * 0.2);
    ctx.lineTo(0, -radius * 0.5);
    ctx.lineTo(radius * 0.2, -radius * 0.2);
    ctx.lineTo(radius * 0.5, -radius * 0.4);
    ctx.lineTo(radius * 0.4, 0);
    ctx.closePath();

    ctx.fillStyle = '#ffcc00';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#b38600';
    ctx.stroke();

    // Crown jewels
    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.arc(0, -radius * 0.3, radius * 0.08, 0, Math.PI * 2);
    ctx.arc(-radius * 0.35, -radius * 0.25, radius * 0.06, 0, Math.PI * 2);
    ctx.arc(radius * 0.35, -radius * 0.25, radius * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }

  // 6. Draw Collectible XP Gem
  static drawXpGem(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, animTime: number): void {
    ctx.save();
    ctx.translate(x, y + Math.sin(animTime * 6) * 3);

    ctx.shadowColor = '#00d2ff';
    ctx.shadowBlur = 10;

    // Diamond shape
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(radius * 0.8, 0);
    ctx.lineTo(0, radius);
    ctx.lineTo(-radius * 0.8, 0);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, -radius, 0, radius);
    grad.addColorStop(0, '#00ffff');
    grad.addColorStop(1, '#0066ff');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Inner facet highlight
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(radius * 0.3, 0);
    ctx.lineTo(0, radius * 0.6);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();

    ctx.restore();
  }

  // 7. Draw Coin
  static drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, animTime: number): void {
    ctx.save();
    ctx.translate(x, y + Math.cos(animTime * 6) * 3);

    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcc00';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#cc9900';
    ctx.stroke();

    // Inner star/circle detail
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffe680';
    ctx.stroke();

    ctx.restore();
  }

  // 8. Draw Weapons / VFX
  static drawMagicBolt(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, angle: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.shadowColor = '#ff33aa';
    ctx.shadowBlur = 12;

    // Glowing Star/Sparkle
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff66cc';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }

  static drawOrbitingBook(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.shadowColor = '#3399ff';
    ctx.shadowBlur = 10;

    // Open Book shape
    ctx.fillStyle = '#0088ff';
    ctx.fillRect(-size, -size * 0.7, size * 2, size * 1.4);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-size * 0.85, -size * 0.55, size * 0.8, size * 1.1);
    ctx.fillRect(size * 0.05, -size * 0.55, size * 0.8, size * 1.1);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#2d2342';
    ctx.strokeRect(-size, -size * 0.7, size * 2, size * 1.4);

    ctx.restore();
  }

  static drawLightning(ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number): void {
    ctx.save();
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(startX, startY);

    const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 40;
    const midY = (startY + endY) / 2 + (Math.random() - 0.5) * 40;

    ctx.lineTo(midX, midY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.restore();
  }
}
