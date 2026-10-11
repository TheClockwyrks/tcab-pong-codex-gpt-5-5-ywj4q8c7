import { createCanvas } from "@napi-rs/canvas";
import { ConstantClock, createEngine } from "@clockwyrks/simple-2d";
import { describe, expect, it } from "vitest";
import {
  BALL_R,
  FIELD_CY,
  FIELD_H,
  FIELD_W,
  P1_X1,
  PADDLE_MAX_CY,
  PADDLE_MIN_CY,
  SERVE_SPEED,
  WIN_SCORE,
} from "./constants";
import { BACKGROUND, game } from "./game";

function makeEngine(stepMs = 16) {
  const canvas = createCanvas(1280, 720) as unknown as HTMLCanvasElement;
  return createEngine({
    canvas,
    width: FIELD_W,
    height: FIELD_H,
    game,
    background: BACKGROUND,
    clock: new ConstantClock(stepMs),
    surface: {
      cssWidth: () => FIELD_W,
      cssHeight: () => FIELD_H,
      dpr: () => 1,
      events: () => new EventTarget(),
    },
  });
}

describe("Carom simulation", () => {
  it("initializes the title state and debug snapshot", async () => {
    const engine = makeEngine();
    await engine.initialize();

    const snapshot = engine.debug.snapshot(engine.state);
    expect(snapshot.version).toBe(1);
    expect(snapshot.screen).toBe("title");
    expect(snapshot.mode).toBe("solo");
    expect(snapshot.ball?.held).toBe(true);
    expect(snapshot.ball?.x).toBe(FIELD_W / 2);
    expect(snapshot.obstacles).toHaveLength(2);
    expect(engine.debug.menuItemRect(engine.state, 0)).not.toBeNull();
    engine.destroy();
  });

  it("serves after the countdown without advancing on the serve frame", async () => {
    const engine = makeEngine(500);
    await engine.initialize();
    engine.apply((state) => engine.debug.setScreen(state, "countdown"));
    engine.apply((state) => engine.debug.setBallServeSign(state, 1));

    await engine.advance(1);
    expect(engine.state.screen).toBe("countdown");
    expect(engine.state.ball?.held).toBe(true);

    await engine.advance(1);
    expect(engine.state.screen).toBe("playing");
    expect(engine.state.ball?.held).toBe(false);
    expect(engine.state.ball?.x).toBe(FIELD_W / 2);
    expect(engine.debug.snapshot(engine.state).ball?.speed).toBeCloseTo(
      SERVE_SPEED,
      5,
    );
    engine.destroy();
  });

  it("scores, parks the ball, and sets the receiver to the scored-on side", async () => {
    const engine = makeEngine();
    await engine.initialize();
    engine.apply((state) => engine.debug.setScreen(state, "playing"));
    engine.apply((state) => engine.debug.setBallHeld(state, false));
    engine.apply((state) =>
      engine.debug.setBallPosition(state, FIELD_W + BALL_R + 2, FIELD_CY),
    );
    engine.apply((state) => engine.debug.setBallVelocity(state, 20, 0));

    await engine.advance(1);
    expect(engine.state.score.p1).toBe(1);
    expect(engine.state.receiver).toBe("right");
    expect(engine.state.screen).toBe("countdown");
    expect(engine.state.ball?.held).toBe(true);
    expect(engine.state.ball?.trail).toHaveLength(0);
    engine.destroy();
  });

  it("adds spin from a driven paddle contact and clamps paddle motion", async () => {
    const engine = makeEngine(16);
    await engine.initialize();
    engine.apply((state) => engine.debug.setScreen(state, "playing"));
    engine.apply((state) => engine.debug.setPaddleCy(state, "left", FIELD_CY));
    engine.apply((state) => engine.debug.setPaddleDriven(state, "left", true));
    engine.apply((state) => engine.debug.setPaddleVy(state, "left", 1000));
    engine.apply((state) =>
      engine.debug.setBallPosition(state, P1_X1 + BALL_R + 2, FIELD_CY),
    );
    engine.apply((state) => engine.debug.setBallVelocity(state, -520, 0));
    engine.apply((state) => engine.debug.setBallHeld(state, false));

    await engine.advance(1);
    expect(engine.state.paddles.left.cy).toBeGreaterThan(FIELD_CY);
    expect(engine.state.paddles.left.cy).toBeLessThanOrEqual(PADDLE_MAX_CY);
    expect(engine.state.ball?.vx).toBeGreaterThan(0);
    expect(engine.state.ball?.spin).toBeGreaterThan(0);

    engine.apply((state) =>
      engine.debug.setPaddleCy(state, "left", PADDLE_MIN_CY),
    );
    engine.apply((state) => engine.debug.setPaddleVy(state, "left", -1000));
    await engine.advance(1);
    expect(engine.state.paddles.left.cy).toBe(PADDLE_MIN_CY);
    expect(engine.state.paddles.left.vy).toBe(0);
    engine.destroy();
  });

  it("enters match over only when the winner has a two point lead", async () => {
    const engine = makeEngine();
    await engine.initialize();
    engine.apply((state) => engine.debug.setScreen(state, "playing"));
    engine.apply((state) =>
      engine.debug.setScore(state, WIN_SCORE - 1, WIN_SCORE - 1),
    );
    engine.apply((state) =>
      engine.debug.setBallPosition(state, FIELD_W + BALL_R + 2, FIELD_H / 2),
    );
    engine.apply((state) => engine.debug.setBallVelocity(state, 20, 0));
    engine.apply((state) => engine.debug.setBallHeld(state, false));
    await engine.advance(1);
    expect(engine.state.screen).toBe("countdown");
    expect(engine.state.score.p1).toBe(WIN_SCORE);

    engine.apply((state) => engine.debug.setScreen(state, "playing"));
    engine.apply((state) =>
      engine.debug.setBallPosition(state, FIELD_W + BALL_R + 2, FIELD_H / 2),
    );
    engine.apply((state) => engine.debug.setBallVelocity(state, 20, 0));
    engine.apply((state) => engine.debug.setBallHeld(state, false));
    await engine.advance(1);
    expect(engine.state.screen).toBe("matchover");
    expect(engine.state.winner).toBe("left");
    engine.destroy();
  });
});
