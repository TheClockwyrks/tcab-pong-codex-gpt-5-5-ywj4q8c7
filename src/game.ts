import type {
  Game,
  InitApi,
  RenderApi,
  UpdateApi,
} from "@clockwyrks/simple-2d";
import type { DeepReadonly } from "ts-essentials";
import {
  ACTIONS,
  AI_DEADZONE,
  AI_HOME_DEADZONE,
  AI_HOME_Y,
  AI_REACT,
  AI_SPEED,
  BALL_R,
  BINDINGS,
  CAROM_DEBUG_VERSION,
  CUES,
  FIELD_CX,
  FIELD_CY,
  FIELD_H,
  FIELD_W,
  HOLD_TIME,
  MATCHOVER_ITEMS,
  MAX_BOUNCE_ANGLE,
  MAX_SUBSTEP,
  NET_X,
  OBSTACLE_CENTERS,
  OBSTACLE_H,
  OBSTACLE_W,
  P1_X0,
  P1_X1,
  P2_X0,
  P2_X1,
  PADDLE_H,
  PADDLE_HALF,
  PADDLE_MAX_CY,
  PADDLE_MIN_CY,
  PADDLE_SPEED,
  PADDLE_W,
  PAUSE_ITEMS,
  SERVE_ANGLE,
  SERVE_SPEED,
  SPEED_CAP,
  SPEED_MULT,
  SPIN_CLAMP,
  SPIN_FROM_PADDLE,
  SPIN_HALFLIFE,
  TITLE_ITEMS,
  TITLE_TEXT,
  TRAIL_TIME,
  WIN_LEAD,
  WIN_SCORE,
} from "./constants";

export type Screen =
  "title" | "howto" | "countdown" | "playing" | "paused" | "matchover";
export type Mode = "solo" | "versus";
export type Side = "left" | "right";

export interface PaddleState {
  readonly cy: number;
  readonly vy: number;
  readonly driven: boolean;
  readonly drivenVy: number;
}

export interface AiState {
  readonly tracking: boolean;
  readonly movement: boolean;
}

export interface TrailSample {
  readonly x: number;
  readonly y: number;
  readonly t: number;
}

export interface BallState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly spin: number;
  readonly held: boolean;
  readonly holdTimer: number;
  readonly serveSign: 1 | -1;
  readonly trail: readonly TrailSample[];
}

export interface ObstacleState {
  readonly index: number;
  readonly cx: number;
  readonly cy: number;
}

export interface CaromState {
  readonly screen: Screen;
  readonly mode: Mode;
  readonly menuIndex: number;
  readonly titleIndex: number;
  readonly resumeScreen: "countdown" | "playing";
  readonly score: { readonly p1: number; readonly p2: number };
  readonly winner: Side | null;
  readonly paddles: { readonly left: PaddleState; readonly right: PaddleState };
  readonly ai: AiState;
  readonly receiver: Side;
  readonly ball: BallState | null;
  readonly obstacles: readonly ObstacleState[];
  readonly simTime: number;
  readonly muted: boolean;
}

export interface MenuItemRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface CaromSnapshot extends Omit<CaromState, "ball"> {
  readonly version: typeof CAROM_DEBUG_VERSION;
  readonly ball: (BallState & { readonly speed: number }) | null;
}

export interface CaromDebugApi {
  readonly version: typeof CAROM_DEBUG_VERSION;
  clearWorld(state: DeepReadonly<CaromState>): CaromState;
  spawnBall(state: DeepReadonly<CaromState>): CaromState;
  spawnObstacle(state: DeepReadonly<CaromState>, index: number): CaromState;
  reset(state: DeepReadonly<CaromState>): CaromState;
  reconcile(state: DeepReadonly<CaromState>): CaromState;
  setScreen(state: DeepReadonly<CaromState>, screen: Screen): CaromState;
  setMode(state: DeepReadonly<CaromState>, mode: Mode): CaromState;
  setMenuIndex(state: DeepReadonly<CaromState>, index: number): CaromState;
  setTitleIndex(state: DeepReadonly<CaromState>, index: number): CaromState;
  setResumeScreen(
    state: DeepReadonly<CaromState>,
    screen: "countdown" | "playing",
  ): CaromState;
  setScore(state: DeepReadonly<CaromState>, p1: number, p2: number): CaromState;
  setWinner(state: DeepReadonly<CaromState>, side: Side | null): CaromState;
  setReceiver(state: DeepReadonly<CaromState>, side: Side): CaromState;
  setPaddleCy(
    state: DeepReadonly<CaromState>,
    side: Side,
    cy: number,
  ): CaromState;
  setPaddleVy(
    state: DeepReadonly<CaromState>,
    side: Side,
    vy: number,
  ): CaromState;
  setPaddleDriven(
    state: DeepReadonly<CaromState>,
    side: Side,
    driven: boolean,
  ): CaromState;
  setBallPosition(
    state: DeepReadonly<CaromState>,
    x: number,
    y: number,
  ): CaromState;
  setBallVelocity(
    state: DeepReadonly<CaromState>,
    vx: number,
    vy: number,
  ): CaromState;
  setBallSpin(state: DeepReadonly<CaromState>, spin: number): CaromState;
  setBallHeld(state: DeepReadonly<CaromState>, held: boolean): CaromState;
  setBallHoldTimer(
    state: DeepReadonly<CaromState>,
    seconds: number,
  ): CaromState;
  setBallServeSign(state: DeepReadonly<CaromState>, sign: 1 | -1): CaromState;
  drawBallServeSign(state: DeepReadonly<CaromState>): CaromState;
  setAiTracking(state: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setAiMovement(state: DeepReadonly<CaromState>, enabled: boolean): CaromState;
  setMuted(state: DeepReadonly<CaromState>, muted: boolean): CaromState;
  snapshot(state: DeepReadonly<CaromState>): CaromSnapshot;
  menuItemRect(
    state: DeepReadonly<CaromState>,
    index: number,
  ): MenuItemRect | null;
}

export const BACKGROUND = "#071017";

type CollisionFace = "left" | "right" | "top" | "bottom";

interface Rect {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
}

interface InputFrame {
  readonly p1Up: boolean;
  readonly p1Down: boolean;
  readonly p2Up: boolean;
  readonly p2Down: boolean;
  readonly confirm: boolean;
  readonly back: boolean;
  readonly pause: boolean;
  readonly mute: boolean;
}

interface AdvanceResult {
  readonly state: CaromState;
  readonly cues: ReadonlySet<string>;
}

const PADDLE_LEFT = "#38e6ff";
const PADDLE_RIGHT = "#ff4f86";
const BALL = "#f8ff75";
const OBSTACLE = "#3dffb5";
const TEXT = "#eaf7ff";
const MUTED_TEXT = "#86a6b2";
const PANEL = "rgba(7, 16, 23, 0.78)";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function cloneState(state: DeepReadonly<CaromState>): CaromState {
  return {
    screen: state.screen,
    mode: state.mode,
    menuIndex: state.menuIndex,
    titleIndex: state.titleIndex,
    resumeScreen: state.resumeScreen,
    score: { p1: state.score.p1, p2: state.score.p2 },
    winner: state.winner,
    paddles: {
      left: { ...state.paddles.left },
      right: { ...state.paddles.right },
    },
    ai: { ...state.ai },
    receiver: state.receiver,
    ball: state.ball ? { ...state.ball, trail: [...state.ball.trail] } : null,
    obstacles: state.obstacles.map((obstacle) => ({ ...obstacle })),
    simTime: state.simTime,
    muted: state.muted,
  };
}

function drawServeSign(): 1 | -1 {
  return Math.random() < 0.5 ? -1 : 1;
}

function parkedBall(): BallState {
  return {
    x: FIELD_CX,
    y: FIELD_CY,
    vx: 0,
    vy: 0,
    spin: 0,
    held: true,
    holdTimer: HOLD_TIME,
    serveSign: drawServeSign(),
    trail: [],
  };
}

function initialObstacles(): ObstacleState[] {
  return OBSTACLE_CENTERS.map((center, index) => ({
    index,
    cx: center.x,
    cy: center.y,
  }));
}

function initialPaddle(): PaddleState {
  return { cy: FIELD_CY, vy: 0, driven: false, drivenVy: 0 };
}

function initialState(muted: boolean, simTime = 0, titleIndex = 0): CaromState {
  return {
    screen: "title",
    mode: "solo",
    menuIndex: titleIndex,
    titleIndex,
    resumeScreen: "playing",
    score: { p1: 0, p2: 0 },
    winner: null,
    paddles: { left: initialPaddle(), right: initialPaddle() },
    ai: { tracking: true, movement: true },
    receiver: "left",
    ball: parkedBall(),
    obstacles: initialObstacles(),
    simTime,
    muted,
  };
}

function startMatch(state: DeepReadonly<CaromState>, mode: Mode): CaromState {
  return {
    ...cloneState(state),
    screen: "countdown",
    mode,
    menuIndex: 0,
    resumeScreen: "playing",
    score: { p1: 0, p2: 0 },
    winner: null,
    paddles: {
      left: { ...state.paddles.left, cy: FIELD_CY, vy: 0 },
      right: { ...state.paddles.right, cy: FIELD_CY, vy: 0 },
    },
    receiver: "left",
    ball: parkedBall(),
  };
}

function returnToTitle(state: DeepReadonly<CaromState>): CaromState {
  return initialState(state.muted, state.simTime, state.titleIndex);
}

function paddleRect(side: Side, cy: number): Rect {
  return side === "left"
    ? { x0: P1_X0, y0: cy - PADDLE_HALF, x1: P1_X1, y1: cy + PADDLE_HALF }
    : { x0: P2_X0, y0: cy - PADDLE_HALF, x1: P2_X1, y1: cy + PADDLE_HALF };
}

function obstacleRect(obstacle: DeepReadonly<ObstacleState>): Rect {
  return {
    x0: obstacle.cx - OBSTACLE_W / 2,
    y0: obstacle.cy - OBSTACLE_H / 2,
    x1: obstacle.cx + OBSTACLE_W / 2,
    y1: obstacle.cy + OBSTACLE_H / 2,
  };
}

function resolveCircleRect(
  ball: BallState,
  rect: Rect,
): { readonly ball: BallState; readonly face: CollisionFace | null } {
  if (
    ball.x <= rect.x0 - BALL_R ||
    ball.x >= rect.x1 + BALL_R ||
    ball.y <= rect.y0 - BALL_R ||
    ball.y >= rect.y1 + BALL_R
  ) {
    return { ball, face: null };
  }

  const depths = [
    { face: "left" as const, value: ball.x - (rect.x0 - BALL_R) },
    { face: "right" as const, value: rect.x1 + BALL_R - ball.x },
    { face: "top" as const, value: ball.y - (rect.y0 - BALL_R) },
    { face: "bottom" as const, value: rect.y1 + BALL_R - ball.y },
  ];
  const struck = depths.reduce((best, current) =>
    current.value < best.value ? current : best,
  ).face;
  let x = ball.x;
  let y = ball.y;
  let vx = ball.vx;
  let vy = ball.vy;

  if (struck === "left") {
    x = rect.x0 - BALL_R;
    if (vx > 0) vx = -vx;
  } else if (struck === "right") {
    x = rect.x1 + BALL_R;
    if (vx < 0) vx = -vx;
  } else if (struck === "top") {
    y = rect.y0 - BALL_R;
    if (vy > 0) vy = -vy;
  } else {
    y = rect.y1 + BALL_R;
    if (vy < 0) vy = -vy;
  }

  return { ball: { ...ball, x, y, vx, vy }, face: struck };
}

function integratePaddle(
  paddle: DeepReadonly<PaddleState>,
  desiredVy: number,
  dt: number,
): PaddleState {
  const nextCy = clamp(
    paddle.cy + desiredVy * dt,
    PADDLE_MIN_CY,
    PADDLE_MAX_CY,
  );
  const actualVy = dt > 0 ? (nextCy - paddle.cy) / dt : 0;
  return { ...paddle, cy: nextCy, vy: actualVy };
}

function inputAxis(up: boolean, down: boolean): number {
  return (down ? 1 : 0) - (up ? 1 : 0);
}

function aiVelocity(state: DeepReadonly<CaromState>, dt: number): number {
  if (!state.ai.movement || dt <= 0) return 0;
  let target = AI_HOME_Y;
  let deadzone = AI_HOME_DEADZONE;
  if (
    state.ai.tracking &&
    state.screen === "playing" &&
    state.ball &&
    state.ball.vx > 0
  ) {
    target = state.ball.y - state.ball.vy * AI_REACT;
    deadzone = AI_DEADZONE;
  }
  const diff = target - state.paddles.right.cy;
  if (Math.abs(diff) <= deadzone) return 0;
  return Math.sign(diff) * Math.min(AI_SPEED, Math.abs(diff) / dt);
}

function advancePaddles(
  state: DeepReadonly<CaromState>,
  input: InputFrame,
  dt: number,
): CaromState["paddles"] {
  const solo = state.mode === "solo";
  const leftAxis = solo
    ? inputAxis(input.p1Up || input.p2Up, input.p1Down || input.p2Down)
    : inputAxis(input.p1Up, input.p1Down);
  const rightAxis = inputAxis(input.p2Up, input.p2Down);
  const leftVy = state.paddles.left.driven
    ? state.paddles.left.drivenVy
    : leftAxis * PADDLE_SPEED;
  let rightVy = state.paddles.right.driven
    ? state.paddles.right.drivenVy
    : rightAxis * PADDLE_SPEED;

  if (solo && !state.paddles.right.driven) rightVy = aiVelocity(state, dt);

  return {
    left: integratePaddle(state.paddles.left, leftVy, dt),
    right: integratePaddle(state.paddles.right, rightVy, dt),
  };
}

function serveBall(ball: DeepReadonly<BallState>, receiver: Side): BallState {
  const dir = receiver === "left" ? -1 : 1;
  return {
    ...ball,
    held: false,
    holdTimer: 0,
    trail: [],
    vx: dir * SERVE_SPEED * Math.cos(SERVE_ANGLE),
    vy: ball.serveSign * SERVE_SPEED * Math.sin(SERVE_ANGLE),
  };
}

function paddleBounce(
  ball: BallState,
  side: Side,
  paddle: PaddleState,
): BallState {
  const offset = clamp((ball.y - paddle.cy) / PADDLE_HALF, -1, 1);
  const theta = offset * MAX_BOUNCE_ANGLE;
  const dir = side === "left" ? 1 : -1;
  const speed = Math.min(Math.hypot(ball.vx, ball.vy) * SPEED_MULT, SPEED_CAP);
  return {
    ...ball,
    x: side === "left" ? P1_X1 + BALL_R : P2_X0 - BALL_R,
    vx: dir * speed * Math.cos(theta),
    vy: speed * Math.sin(theta),
    spin: clamp(
      ball.spin + paddle.vy * SPIN_FROM_PADDLE,
      -SPIN_CLAMP,
      SPIN_CLAMP,
    ),
  };
}

function stepBall(
  source: DeepReadonly<BallState>,
  state: DeepReadonly<CaromState>,
  paddles: CaromState["paddles"],
  dt: number,
): { readonly ball: BallState; readonly cues: Set<string> } {
  let ball: BallState = { ...source, trail: [...source.trail] };
  const cues = new Set<string>();
  const speed = Math.hypot(ball.vx, ball.vy);
  const steps = Math.max(1, Math.ceil((speed * dt) / MAX_SUBSTEP));
  const h = dt / steps;

  for (let i = 0; i < steps; i += 1) {
    const subSpeed = Math.hypot(ball.vx, ball.vy);
    if (subSpeed > 0) {
      const angle = (ball.spin / subSpeed) * h;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      ball = {
        ...ball,
        vx: ball.vx * cos - ball.vy * sin,
        vy: ball.vx * sin + ball.vy * cos,
      };
    }
    ball = {
      ...ball,
      spin: ball.spin * 0.5 ** (h / SPIN_HALFLIFE),
      x: ball.x + ball.vx * h,
      y: ball.y + ball.vy * h,
    };

    if (ball.y - BALL_R < 0 && ball.vy < 0) {
      ball = { ...ball, y: BALL_R, vy: -ball.vy };
      cues.add(CUES.wallBounce);
    } else if (ball.y + BALL_R > FIELD_H && ball.vy > 0) {
      ball = { ...ball, y: FIELD_H - BALL_R, vy: -ball.vy };
      cues.add(CUES.wallBounce);
    }

    let resolved = resolveCircleRect(ball, paddleRect("left", paddles.left.cy));
    if (resolved.face) {
      ball =
        resolved.face === "left" || resolved.face === "right"
          ? paddleBounce(resolved.ball, "left", paddles.left)
          : resolved.ball;
      cues.add(
        resolved.face === "left" || resolved.face === "right"
          ? CUES.paddleHit
          : CUES.wallBounce,
      );
    }

    resolved = resolveCircleRect(ball, paddleRect("right", paddles.right.cy));
    if (resolved.face) {
      ball =
        resolved.face === "left" || resolved.face === "right"
          ? paddleBounce(resolved.ball, "right", paddles.right)
          : resolved.ball;
      cues.add(
        resolved.face === "left" || resolved.face === "right"
          ? CUES.paddleHit
          : CUES.wallBounce,
      );
    }

    for (const obstacle of state.obstacles) {
      resolved = resolveCircleRect(ball, obstacleRect(obstacle));
      if (resolved.face) {
        ball = resolved.ball;
        cues.add(CUES.obstacleBounce);
      }
    }
  }

  return { ball, cues };
}

function withTrail(
  ball: BallState,
  simTime: number,
  includeSample = true,
): BallState {
  const trail = includeSample
    ? [...ball.trail, { x: ball.x, y: ball.y, t: simTime }]
    : [...ball.trail];
  return {
    ...ball,
    trail: trail.filter((sample) => simTime - sample.t <= TRAIL_TIME),
  };
}

function scoredSide(ball: BallState): Side | null {
  if (ball.x - BALL_R > FIELD_W) return "left";
  if (ball.x + BALL_R < 0) return "right";
  return null;
}

function opponent(side: Side): Side {
  return side === "left" ? "right" : "left";
}

function sideScoreKey(side: Side): "p1" | "p2" {
  return side === "left" ? "p1" : "p2";
}

function hasWon(score: CaromState["score"], side: Side): boolean {
  const mine = side === "left" ? score.p1 : score.p2;
  const theirs = side === "left" ? score.p2 : score.p1;
  return mine >= WIN_SCORE && mine - theirs >= WIN_LEAD;
}

function advanceGameplay(
  state: DeepReadonly<CaromState>,
  input: InputFrame,
  dt: number,
  simTime: number,
): AdvanceResult {
  const cues = new Set<string>();
  const paddles = advancePaddles(state, input, dt);
  const next: CaromState = { ...cloneState(state), paddles, simTime };

  if (!next.ball) return { state: next, cues };

  if (next.screen === "countdown") {
    const held = { ...next.ball, x: FIELD_CX, y: FIELD_CY };
    const holdTimer = Math.max(0, held.holdTimer - dt);
    const ball =
      holdTimer <= 0
        ? serveBall({ ...held, holdTimer }, next.receiver)
        : { ...held, holdTimer };
    return {
      state: {
        ...next,
        screen: holdTimer <= 0 ? "playing" : "countdown",
        ball: withTrail(ball, simTime, holdTimer > 0),
      },
      cues,
    };
  }

  const stepped = stepBall(next.ball, next, paddles, dt);
  stepped.cues.forEach((cue) => cues.add(cue));
  let ball = withTrail(stepped.ball, simTime);
  const scorer = scoredSide(ball);
  if (!scorer) return { state: { ...next, ball }, cues };

  cues.add(CUES.score);
  const key = sideScoreKey(scorer);
  const score = { ...next.score, [key]: next.score[key] + 1 };
  if (hasWon(score, scorer)) {
    return {
      state: {
        ...next,
        score,
        winner: scorer,
        screen: "matchover",
        menuIndex: 0,
        ball,
      },
      cues,
    };
  }

  ball = parkedBall();
  return {
    state: {
      ...next,
      score,
      receiver: opponent(scorer),
      screen: "countdown",
      ball,
    },
    cues,
  };
}

function menuItems(screen: Screen): readonly string[] {
  if (screen === "title") return TITLE_ITEMS;
  if (screen === "paused") return PAUSE_ITEMS;
  if (screen === "matchover") return MATCHOVER_ITEMS;
  if (screen === "howto") return ["BACK"];
  return [];
}

function menuRectFor(screen: Screen, index: number): MenuItemRect | null {
  const items = menuItems(screen);
  if (index < 0 || index >= items.length) return null;
  const w = screen === "howto" ? 260 : 360;
  const h = 58;
  const gap = 16;
  const startY =
    screen === "title"
      ? 360
      : screen === "howto"
        ? 594
        : screen === "matchover"
          ? 450
          : 365;
  return {
    x: FIELD_CX - w / 2,
    y: startY + index * (h + gap),
    w,
    h,
  };
}

function itemAt(screen: Screen, x: number, y: number): number | null {
  const count = menuItems(screen).length;
  for (let index = 0; index < count; index += 1) {
    const rect = menuRectFor(screen, index);
    if (
      rect &&
      x >= rect.x &&
      x <= rect.x + rect.w &&
      y >= rect.y &&
      y <= rect.y + rect.h
    ) {
      return index;
    }
  }
  return null;
}

function wrapMenu(index: number, count: number, delta: -1 | 1): number {
  return (index + delta + count) % count;
}

function confirmMenu(
  state: DeepReadonly<CaromState>,
  index: number,
): CaromState {
  if (state.screen === "title") {
    const titleIndex = index;
    if (index === 0) return { ...startMatch(state, "solo"), titleIndex };
    if (index === 1) return { ...startMatch(state, "versus"), titleIndex };
    return { ...cloneState(state), screen: "howto", menuIndex: 0, titleIndex };
  }
  if (state.screen === "howto") return returnToTitle(state);
  if (state.screen === "paused") {
    if (index === 0)
      return { ...cloneState(state), screen: state.resumeScreen };
    if (index === 1) return startMatch(state, state.mode);
    return returnToTitle(state);
  }
  if (state.screen === "matchover") {
    if (index === 0) return startMatch(state, state.mode);
    return returnToTitle(state);
  }
  return cloneState(state);
}

function readInput(api: UpdateApi): InputFrame {
  return {
    p1Up: api.input.value("p1-up") > 0,
    p1Down: api.input.value("p1-down") > 0,
    p2Up: api.input.value("p2-up") > 0,
    p2Down: api.input.value("p2-down") > 0,
    confirm: api.input.pressed("confirm"),
    back: api.input.pressed("back"),
    pause: api.input.pressed("pause"),
    mute: api.input.pressed("mute"),
  };
}

function pointerMenuUpdate(
  state: DeepReadonly<CaromState>,
  api: UpdateApi,
  keyboardConfirmed: boolean,
): CaromState {
  if (!["title", "howto", "paused", "matchover"].includes(state.screen)) {
    return cloneState(state);
  }
  let next = cloneState(state);
  const downById = new Map<number, number>();
  let confirmIndex: number | null = null;

  for (const sample of api.input.pointerSamples()) {
    const index = itemAt(next.screen, sample.x, sample.y);
    if (index !== null) next = { ...next, menuIndex: index };
    if (sample.type === "down" && index !== null)
      downById.set(sample.id, index);
    if (sample.type === "up") {
      const downIndex = downById.get(sample.id);
      if (downIndex !== undefined && downIndex === index) confirmIndex = index;
      downById.delete(sample.id);
    }
  }

  const pointer = api.input.pointer();
  const hover = itemAt(next.screen, pointer.x, pointer.y);
  if (hover !== null) next = { ...next, menuIndex: hover };

  if (confirmIndex !== null && !keyboardConfirmed) {
    return confirmMenu(next, next.menuIndex);
  }
  return next;
}

function applyMenuInput(
  state: DeepReadonly<CaromState>,
  api: UpdateApi,
  input: InputFrame,
): CaromState {
  if (state.screen === "countdown" || state.screen === "playing") {
    if (input.pause) {
      return {
        ...cloneState(state),
        resumeScreen: state.screen,
        screen: "paused",
        menuIndex: 0,
      };
    }
    return cloneState(state);
  }

  if (state.screen === "howto") {
    if (input.confirm || input.back) return returnToTitle(state);
    return pointerMenuUpdate(state, api, false);
  }

  if (state.screen === "paused" && (input.pause || input.back)) {
    return { ...cloneState(state), screen: state.resumeScreen };
  }

  if (state.screen === "matchover" && input.back) return returnToTitle(state);

  const items = menuItems(state.screen);
  let next = cloneState(state);
  let keyboardConfirmed = false;
  if (items.length > 0) {
    if (input.p1Up || input.p2Up) {
      next = { ...next, menuIndex: wrapMenu(next.menuIndex, items.length, -1) };
    } else if (input.p1Down || input.p2Down) {
      next = { ...next, menuIndex: wrapMenu(next.menuIndex, items.length, 1) };
    } else if (input.confirm) {
      keyboardConfirmed = true;
      next = confirmMenu(next, next.menuIndex);
    }
  }

  return pointerMenuUpdate(next, api, keyboardConfirmed);
}

function playCues(api: UpdateApi, cues: ReadonlySet<string>): void {
  cues.forEach((cue) => api.audio.play(cue));
}

function requireBall(state: DeepReadonly<CaromState>): BallState {
  if (!state.ball) throw new Error("Carom debug: no ball is present");
  return { ...state.ball, trail: [...state.ball.trail] };
}

function requireObstacleIndex(index: number): void {
  if (
    index < 0 ||
    index >= OBSTACLE_CENTERS.length ||
    !Number.isInteger(index)
  ) {
    throw new Error(`Carom debug: invalid obstacle index ${index}`);
  }
}

function withPaddle(
  state: DeepReadonly<CaromState>,
  side: Side,
  patch: Partial<PaddleState>,
): CaromState {
  const base = cloneState(state);
  return {
    ...base,
    paddles: {
      ...base.paddles,
      [side]: { ...base.paddles[side], ...patch },
    },
  };
}

function buildDebug(): CaromDebugApi {
  return {
    version: CAROM_DEBUG_VERSION,
    clearWorld: (state) => ({
      ...cloneState(state),
      ball: null,
      obstacles: [],
    }),
    spawnBall: (state) => ({ ...cloneState(state), ball: parkedBall() }),
    spawnObstacle: (state, index) => {
      requireObstacleIndex(index);
      const center = OBSTACLE_CENTERS[index];
      const others = state.obstacles.filter((o) => o.index !== index);
      return {
        ...cloneState(state),
        obstacles: [...others, { index, cx: center.x, cy: center.y }].sort(
          (a, b) => a.index - b.index,
        ),
      };
    },
    reset: (state) => initialState(state.muted),
    reconcile: (state) => cloneState(state),
    setScreen: (state, screen) => ({ ...cloneState(state), screen }),
    setMode: (state, mode) => ({ ...cloneState(state), mode }),
    setMenuIndex: (state, index) => ({
      ...cloneState(state),
      menuIndex: index,
    }),
    setTitleIndex: (state, index) => ({
      ...cloneState(state),
      titleIndex: index,
    }),
    setResumeScreen: (state, screen) => ({
      ...cloneState(state),
      resumeScreen: screen,
    }),
    setScore: (state, p1, p2) => ({ ...cloneState(state), score: { p1, p2 } }),
    setWinner: (state, side) => ({ ...cloneState(state), winner: side }),
    setReceiver: (state, side) => ({ ...cloneState(state), receiver: side }),
    setPaddleCy: (state, side, cy) => withPaddle(state, side, { cy }),
    setPaddleVy: (state, side, vy) => withPaddle(state, side, { drivenVy: vy }),
    setPaddleDriven: (state, side, driven) =>
      withPaddle(state, side, { driven }),
    setBallPosition: (state, x, y) => ({
      ...cloneState(state),
      ball: { ...requireBall(state), x, y },
    }),
    setBallVelocity: (state, vx, vy) => ({
      ...cloneState(state),
      ball: { ...requireBall(state), vx, vy },
    }),
    setBallSpin: (state, spin) => ({
      ...cloneState(state),
      ball: { ...requireBall(state), spin },
    }),
    setBallHeld: (state, held) => ({
      ...cloneState(state),
      ball: { ...requireBall(state), held },
    }),
    setBallHoldTimer: (state, seconds) => ({
      ...cloneState(state),
      ball: { ...requireBall(state), holdTimer: seconds },
    }),
    setBallServeSign: (state, sign) => ({
      ...cloneState(state),
      ball: { ...requireBall(state), serveSign: sign },
    }),
    drawBallServeSign: (state) => ({
      ...cloneState(state),
      ball: { ...requireBall(state), serveSign: drawServeSign() },
    }),
    setAiTracking: (state, enabled) => ({
      ...cloneState(state),
      ai: { ...state.ai, tracking: enabled },
    }),
    setAiMovement: (state, enabled) => ({
      ...cloneState(state),
      ai: { ...state.ai, movement: enabled },
    }),
    setMuted: (state, muted) => ({ ...cloneState(state), muted }),
    snapshot: (state) => ({
      ...cloneState(state),
      version: CAROM_DEBUG_VERSION,
      ball: state.ball
        ? {
            ...state.ball,
            trail: [...state.ball.trail],
            speed: Math.hypot(state.ball.vx, state.ball.vy),
          }
        : null,
    }),
    menuItemRect: (state, index) => menuRectFor(state.screen, index),
  };
}

function registerDiagnostics(api: InitApi<CaromState>): void {
  api.diagnostics.register("screen", (state) => state.screen);
  api.diagnostics.register("mode", (state) => state.mode);
  api.diagnostics.register("score", (state) => {
    return `${state.score.p1}-${state.score.p2}`;
  });
  api.diagnostics.register("ball", (state) => {
    if (!state.ball) return "none";
    return `${state.ball.x.toFixed(1)}, ${state.ball.y.toFixed(1)}`;
  });
  api.diagnostics.register("speed", (state) => {
    return state.ball ? Math.hypot(state.ball.vx, state.ball.vy) : 0;
  });
  api.diagnostics.register("spin", (state) => state.ball?.spin ?? 0);
  api.diagnostics.register("muted", (state) => state.muted);
}

function registerAudio(api: InitApi<CaromState>): void {
  api.audio.define(CUES.paddleHit, {
    wave: "triangle",
    freq: 720,
    freqTo: 940,
    durationMs: 70,
    gain: 0.2,
  });
  api.audio.define(CUES.wallBounce, {
    wave: "sine",
    freq: 340,
    freqTo: 220,
    durationMs: 55,
    gain: 0.16,
  });
  api.audio.define(CUES.obstacleBounce, {
    wave: "square",
    freq: 510,
    freqTo: 260,
    durationMs: 65,
    gain: 0.13,
  });
  api.audio.define(CUES.score, {
    wave: "sawtooth",
    freq: 180,
    freqTo: 680,
    durationMs: 180,
    gain: 0.18,
  });
}

export const game: Game<CaromState, CaromDebugApi> = {
  initialize(api: InitApi<CaromState>): [CaromState, CaromDebugApi] {
    for (const action of ACTIONS) {
      api.input.register(action, { keys: [...BINDINGS[action]] });
    }
    registerAudio(api);
    registerDiagnostics(api);
    return [initialState(false), buildDebug()];
  },

  update(
    state: DeepReadonly<CaromState>,
    api: UpdateApi,
    dt: number,
  ): CaromState {
    const input = readInput(api);
    if (input.mute) api.audio.setMuted(!api.audio.muted());

    const menuState = applyMenuInput(state, api, input);
    let next = {
      ...menuState,
      simTime: state.simTime + dt,
      muted: api.audio.muted(),
    };

    if (next.screen === "countdown" || next.screen === "playing") {
      const advanced = advanceGameplay(next, input, dt, next.simTime);
      playCues(api, advanced.cues);
      next = { ...advanced.state, muted: api.audio.muted() };
    }

    return next;
  },

  render(state: DeepReadonly<CaromState>, api: RenderApi): void {
    const ctx = api.ctx;
    drawField(ctx);
    if (state.screen !== "title" && state.screen !== "howto")
      drawHud(ctx, state);
    drawWorld(ctx, state);
    if (state.screen === "title") drawTitle(ctx, state);
    if (state.screen === "howto") drawHowTo(ctx, state);
    if (state.screen === "countdown") drawCountdown(ctx, state);
    if (state.screen === "paused") drawPause(ctx, state);
    if (state.screen === "matchover") drawMatchOver(ctx, state);
  },
};

function drawField(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  const glow = ctx.createRadialGradient(
    FIELD_CX,
    FIELD_CY,
    60,
    FIELD_CX,
    FIELD_CY,
    640,
  );
  glow.addColorStop(0, "rgba(61,255,181,0.12)");
  glow.addColorStop(0.55, "rgba(56,230,255,0.05)");
  glow.addColorStop(1, "rgba(7,16,23,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  ctx.strokeStyle = "rgba(234,247,255,0.18)";
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, FIELD_W - 40, FIELD_H - 40);
  ctx.save();
  ctx.setLineDash([18, 18]);
  ctx.strokeStyle = "rgba(234,247,255,0.35)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(NET_X, 48);
  ctx.lineTo(NET_X, FIELD_H - 48);
  ctx.stroke();
  ctx.restore();
}

function drawWorld(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<CaromState>,
): void {
  if (state.ball) drawTrail(ctx, state.ball);
  for (const obstacle of state.obstacles) drawObstacle(ctx, obstacle);
  drawPaddle(ctx, "left", state.paddles.left);
  drawPaddle(ctx, "right", state.paddles.right);
  if (state.ball) drawBall(ctx, state.ball);
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function glowCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
): void {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPaddle(
  ctx: CanvasRenderingContext2D,
  side: Side,
  paddle: DeepReadonly<PaddleState>,
): void {
  const rect = paddleRect(side, paddle.cy);
  ctx.save();
  ctx.shadowColor = side === "left" ? PADDLE_LEFT : PADDLE_RIGHT;
  ctx.shadowBlur = 16;
  ctx.fillStyle = side === "left" ? PADDLE_LEFT : PADDLE_RIGHT;
  roundedRect(ctx, rect.x0, rect.y0, PADDLE_W, PADDLE_H, 8);
  ctx.restore();
}

function drawObstacle(
  ctx: CanvasRenderingContext2D,
  obstacle: DeepReadonly<ObstacleState>,
): void {
  ctx.save();
  ctx.translate(obstacle.cx, obstacle.cy);
  ctx.shadowColor = OBSTACLE;
  ctx.shadowBlur = 14;
  ctx.fillStyle = OBSTACLE;
  roundedRect(ctx, -OBSTACLE_W / 2, -OBSTACLE_H / 2, OBSTACLE_W, OBSTACLE_H, 9);
  ctx.fillStyle = "rgba(7,16,23,0.24)";
  roundedRect(ctx, -3, -OBSTACLE_H / 2 + 12, 6, OBSTACLE_H - 24, 3);
  ctx.restore();
}

function drawTrail(
  ctx: CanvasRenderingContext2D,
  ball: DeepReadonly<BallState>,
): void {
  if (ball.trail.length < 2) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 1; i < ball.trail.length; i += 1) {
    const a = ball.trail[i - 1];
    const b = ball.trail[i];
    const alpha = i / ball.trail.length;
    ctx.strokeStyle = `rgba(248,255,117,${0.08 + alpha * 0.42})`;
    ctx.lineWidth = 3 + alpha * 7;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBall(
  ctx: CanvasRenderingContext2D,
  ball: DeepReadonly<BallState>,
) {
  glowCircle(ctx, ball.x, ball.y, BALL_R, BALL);
  if (Math.abs(ball.spin) > 5) {
    ctx.save();
    ctx.strokeStyle = ball.spin > 0 ? PADDLE_RIGHT : PADDLE_LEFT;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R + 6, -0.8, 0.8);
    ctx.stroke();
    ctx.restore();
  }
}

function drawHud(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<CaromState>,
) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 56px system-ui, sans-serif";
  ctx.fillStyle = TEXT;
  ctx.fillText(String(state.score.p1), FIELD_CX - 120, 72);
  ctx.fillText(String(state.score.p2), FIELD_CX + 120, 72);
  ctx.font = "600 18px system-ui, sans-serif";
  ctx.fillStyle = MUTED_TEXT;
  ctx.fillText(
    state.mode === "solo" ? "SOLO RALLY" : "VERSUS DUEL",
    FIELD_CX,
    104,
  );
  ctx.restore();
}

function drawMenu(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<CaromState>,
): void {
  const items = menuItems(state.screen);
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 24px system-ui, sans-serif";
  items.forEach((item, index) => {
    const rect = menuRectFor(state.screen, index);
    if (!rect) return;
    const active = state.menuIndex === index;
    ctx.fillStyle = active
      ? "rgba(234,247,255,0.95)"
      : "rgba(234,247,255,0.13)";
    roundedRect(ctx, rect.x, rect.y, rect.w, rect.h, 8);
    ctx.fillStyle = active ? BACKGROUND : TEXT;
    ctx.fillText(item, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
  });
  ctx.restore();
}

function drawTitle(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<CaromState>,
): void {
  ctx.save();
  ctx.fillStyle = "rgba(7,16,23,0.55)";
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 116px system-ui, sans-serif";
  ctx.fillStyle = TEXT;
  ctx.shadowColor = PADDLE_LEFT;
  ctx.shadowBlur = 22;
  ctx.fillText(TITLE_TEXT, FIELD_CX, 180);
  ctx.shadowBlur = 0;
  ctx.font = "500 24px system-ui, sans-serif";
  ctx.fillStyle = MUTED_TEXT;
  ctx.fillText("spin the angles, bank the middle", FIELD_CX, 260);
  ctx.restore();
  drawMenu(ctx, state);
}

function drawHowTo(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<CaromState>,
): void {
  ctx.save();
  ctx.fillStyle = PANEL;
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = TEXT;
  ctx.font = "800 54px system-ui, sans-serif";
  ctx.fillText("HOW TO PLAY", FIELD_CX, 100);
  ctx.font = "500 25px system-ui, sans-serif";
  ctx.fillStyle = "rgba(234,247,255,0.86)";
  [
    "W/S move the left paddle. Arrow keys move the right paddle in Versus.",
    "In Solo, either set of movement keys controls you while the AI defends.",
    "Meet the ball while moving to bend its flight with spin.",
    "Use the center bars for sharp banks and awkward recoveries.",
    "P pauses, M mutes, Escape backs out or resumes.",
  ].forEach((line, index) => {
    ctx.fillText(line, FIELD_CX, 210 + index * 54);
  });
  ctx.restore();
  drawMenu(ctx, state);
}

function drawCountdown(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<CaromState>,
): void {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(234,247,255,0.9)";
  ctx.font = "900 86px system-ui, sans-serif";
  ctx.fillText(
    String(Math.max(1, Math.ceil(state.ball?.holdTimer ?? 0))),
    FIELD_CX,
    FIELD_CY,
  );
  ctx.font = "600 22px system-ui, sans-serif";
  ctx.fillStyle = MUTED_TEXT;
  ctx.fillText("READY", FIELD_CX, FIELD_CY + 72);
  ctx.restore();
}

function drawPause(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<CaromState>,
): void {
  ctx.save();
  ctx.fillStyle = "rgba(7,16,23,0.66)";
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = TEXT;
  ctx.font = "900 60px system-ui, sans-serif";
  ctx.fillText("PAUSED", FIELD_CX, 265);
  ctx.restore();
  drawMenu(ctx, state);
}

function drawMatchOver(
  ctx: CanvasRenderingContext2D,
  state: DeepReadonly<CaromState>,
): void {
  ctx.save();
  ctx.fillStyle = "rgba(7,16,23,0.64)";
  ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = TEXT;
  ctx.font = "900 62px system-ui, sans-serif";
  const winner = state.winner === "left" ? "LEFT WINS" : "RIGHT WINS";
  ctx.fillText(winner, FIELD_CX, 245);
  ctx.font = "700 34px system-ui, sans-serif";
  ctx.fillStyle = MUTED_TEXT;
  ctx.fillText(`${state.score.p1} - ${state.score.p2}`, FIELD_CX, 315);
  ctx.restore();
  drawMenu(ctx, state);
}
