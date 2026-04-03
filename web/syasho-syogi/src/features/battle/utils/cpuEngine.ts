import {
  applySyahoShogiAction,
  findBossSquare,
  getAllLegalActions,
  getLegalMovesFrom,
  getPieceAt,
  isPlayerInCheck,
  type SyahoShogiAction,
  type SyahoShogiHandPieceType,
  type SyahoShogiPieceType,
  type SyahoShogiPlayer,
  type SyahoShogiState,
} from "../../../lib/syahosyogi";
import { DEFAULT_CPU_LEVEL, type CpuDifficultyLevel } from "./cpuConfig";

type CpuStrategy = "random" | "greedy" | "one-ply" | "search";

type CpuLevelConfig = {
  strategy: CpuStrategy;
  searchDepth: number;
  alphaBeta: boolean;
  iterativeDeepening: boolean;
  endgameExtension: boolean;
  timeBudgetMs: number;
  topN: number;
  noise: number;
  randomMoveChance: number;
  captureBias: number;
  dangerMultiplier: number;
  tryDefenseMultiplier: number;
  mobilityWeight: number;
  prioritizeImmediateWins: boolean;
};

type ScoredAction = {
  action: SyahoShogiAction;
  score: number;
};

class SearchTimeoutError extends Error {
  constructor() {
    super("CPU search timed out");
    this.name = "SearchTimeoutError";
  }
}

const WIN_SCORE = 100_000;
const NEGATIVE_INFINITY = -1_000_000_000;
const POSITIVE_INFINITY = 1_000_000_000;

const BOARD_PIECE_VALUES: Record<SyahoShogiPieceType, number> = {
  BOSS: 0,
  MIKURU: 900,
  MIKITANI: 500,
  MIZOGUCHI: 250,
  SON: 350,
};

const HAND_PIECE_VALUES: Record<SyahoShogiHandPieceType, number> = {
  MIKITANI: 460,
  MIZOGUCHI: 220,
  SON: 320,
};

const CPU_LEVEL_CONFIGS: Record<CpuDifficultyLevel, CpuLevelConfig> = {
  1: {
    strategy: "random",
    searchDepth: 0,
    alphaBeta: false,
    iterativeDeepening: false,
    endgameExtension: false,
    timeBudgetMs: 0,
    topN: 1,
    noise: 0,
    randomMoveChance: 1,
    captureBias: 0,
    dangerMultiplier: 0.25,
    tryDefenseMultiplier: 0.25,
    mobilityWeight: 2,
    prioritizeImmediateWins: false,
  },
  2: {
    strategy: "random",
    searchDepth: 0,
    alphaBeta: false,
    iterativeDeepening: false,
    endgameExtension: false,
    timeBudgetMs: 0,
    topN: 1,
    noise: 0,
    randomMoveChance: 1,
    captureBias: 0.2,
    dangerMultiplier: 0.4,
    tryDefenseMultiplier: 0.4,
    mobilityWeight: 3,
    prioritizeImmediateWins: true,
  },
  3: {
    strategy: "greedy",
    searchDepth: 0,
    alphaBeta: false,
    iterativeDeepening: false,
    endgameExtension: false,
    timeBudgetMs: 0,
    topN: 6,
    noise: 180,
    randomMoveChance: 0.22,
    captureBias: 1.35,
    dangerMultiplier: 0.7,
    tryDefenseMultiplier: 0.7,
    mobilityWeight: 5,
    prioritizeImmediateWins: true,
  },
  4: {
    strategy: "one-ply",
    searchDepth: 1,
    alphaBeta: false,
    iterativeDeepening: false,
    endgameExtension: false,
    timeBudgetMs: 0,
    topN: 3,
    noise: 65,
    randomMoveChance: 0,
    captureBias: 1.5,
    dangerMultiplier: 0.95,
    tryDefenseMultiplier: 0.95,
    mobilityWeight: 7,
    prioritizeImmediateWins: true,
  },
  5: {
    strategy: "search",
    searchDepth: 2,
    alphaBeta: false,
    iterativeDeepening: false,
    endgameExtension: false,
    timeBudgetMs: 350,
    topN: 2,
    noise: 28,
    randomMoveChance: 0,
    captureBias: 1.6,
    dangerMultiplier: 1.05,
    tryDefenseMultiplier: 1.1,
    mobilityWeight: 9,
    prioritizeImmediateWins: true,
  },
  6: {
    strategy: "search",
    searchDepth: 3,
    alphaBeta: false,
    iterativeDeepening: false,
    endgameExtension: false,
    timeBudgetMs: 520,
    topN: 2,
    noise: 20,
    randomMoveChance: 0,
    captureBias: 1.7,
    dangerMultiplier: 1.45,
    tryDefenseMultiplier: 1.7,
    mobilityWeight: 10,
    prioritizeImmediateWins: true,
  },
  7: {
    strategy: "search",
    searchDepth: 4,
    alphaBeta: true,
    iterativeDeepening: false,
    endgameExtension: false,
    timeBudgetMs: 620,
    topN: 2,
    noise: 12,
    randomMoveChance: 0,
    captureBias: 1.8,
    dangerMultiplier: 1.6,
    tryDefenseMultiplier: 1.9,
    mobilityWeight: 11,
    prioritizeImmediateWins: true,
  },
  8: {
    strategy: "search",
    searchDepth: 4,
    alphaBeta: true,
    iterativeDeepening: false,
    endgameExtension: true,
    timeBudgetMs: 760,
    topN: 2,
    noise: 8,
    randomMoveChance: 0,
    captureBias: 1.9,
    dangerMultiplier: 1.7,
    tryDefenseMultiplier: 2,
    mobilityWeight: 12,
    prioritizeImmediateWins: true,
  },
  9: {
    strategy: "search",
    searchDepth: 5,
    alphaBeta: true,
    iterativeDeepening: false,
    endgameExtension: true,
    timeBudgetMs: 900,
    topN: 2,
    noise: 4,
    randomMoveChance: 0,
    captureBias: 2,
    dangerMultiplier: 1.8,
    tryDefenseMultiplier: 2.15,
    mobilityWeight: 12,
    prioritizeImmediateWins: true,
  },
  10: {
    strategy: "search",
    searchDepth: 6,
    alphaBeta: true,
    iterativeDeepening: true,
    endgameExtension: true,
    timeBudgetMs: 1_100,
    topN: 1,
    noise: 1,
    randomMoveChance: 0,
    captureBias: 2.1,
    dangerMultiplier: 1.95,
    tryDefenseMultiplier: 2.3,
    mobilityWeight: 13,
    prioritizeImmediateWins: true,
  },
};

export function pickCpuAction(
  state: SyahoShogiState,
  level: CpuDifficultyLevel = DEFAULT_CPU_LEVEL,
): SyahoShogiAction | null {
  const config = CPU_LEVEL_CONFIGS[level] ?? CPU_LEVEL_CONFIGS[DEFAULT_CPU_LEVEL];
  const actions = getAllLegalActions(state, state.currentPlayer);
  if (!actions.length) return null;

  const winningActions = getImmediateWinningActions(state, actions);
  if (config.prioritizeImmediateWins && winningActions.length > 0) {
    return pickRandom(winningActions);
  }

  switch (config.strategy) {
    case "random":
      return pickRandom(actions);
    case "greedy":
      return chooseGreedyAction(state, actions, config);
    case "one-ply":
      return chooseOnePlyAction(state, actions, config);
    case "search":
      return chooseSearchAction(state, actions, config);
    default:
      return pickRandom(actions);
  }
}

function chooseGreedyAction(
  state: SyahoShogiState,
  actions: SyahoShogiAction[],
  config: CpuLevelConfig,
): SyahoShogiAction {
  if (Math.random() < config.randomMoveChance) {
    return pickRandom(actions);
  }

  const scoredActions = actions.map((action) => ({
    action,
    score: scoreImmediateAction(state, action, state.currentPlayer, config),
  }));

  return selectFromScoredActions(scoredActions, config);
}

function chooseOnePlyAction(
  state: SyahoShogiState,
  actions: SyahoShogiAction[],
  config: CpuLevelConfig,
): SyahoShogiAction {
  const scoredActions = actions.map((action) => {
    const nextState = applyKnownLegalAction(state, action);
    return {
      action,
      score:
        nextState === null
          ? NEGATIVE_INFINITY
          : evaluateState(nextState, state.currentPlayer, config),
    };
  });

  return selectFromScoredActions(scoredActions, config);
}

function chooseSearchAction(
  state: SyahoShogiState,
  actions: SyahoShogiAction[],
  config: CpuLevelConfig,
): SyahoShogiAction {
  const deadline = config.timeBudgetMs > 0 ? Date.now() + config.timeBudgetMs : Number.POSITIVE_INFINITY;
  let completedScores: ScoredAction[] | null = null;

  if (config.iterativeDeepening) {
    for (let depth = 1; depth <= config.searchDepth; depth += 1) {
      try {
        completedScores = scoreRootActions(state, actions, config, depth, deadline);
      } catch (error) {
        if (error instanceof SearchTimeoutError) break;
        throw error;
      }
    }
  } else {
    try {
      completedScores = scoreRootActions(state, actions, config, config.searchDepth, deadline);
    } catch (error) {
      if (!(error instanceof SearchTimeoutError)) {
        throw error;
      }
    }
  }

  if (!completedScores || completedScores.length === 0) {
    return chooseOnePlyAction(state, actions, config);
  }

  return selectFromScoredActions(completedScores, config);
}

function scoreRootActions(
  state: SyahoShogiState,
  actions: SyahoShogiAction[],
  config: CpuLevelConfig,
  depth: number,
  deadline: number,
): ScoredAction[] {
  ensureSearchTime(deadline);

  const orderedActions = orderActions(state, actions, config);
  const scoredActions: ScoredAction[] = [];

  for (const action of orderedActions) {
    ensureSearchTime(deadline);

    const nextState = applyKnownLegalAction(state, action);
    if (nextState === null) continue;

    const score =
      depth <= 1
        ? evaluateState(nextState, state.currentPlayer, config)
        : -negamax(
            nextState,
            depth - 1,
            config.alphaBeta ? -POSITIVE_INFINITY : NEGATIVE_INFINITY,
            config.alphaBeta ? POSITIVE_INFINITY : POSITIVE_INFINITY,
            state.currentPlayer,
            config,
            deadline,
          );

    scoredActions.push({ action, score });
  }

  scoredActions.sort((left, right) => right.score - left.score);
  return scoredActions;
}

function negamax(
  state: SyahoShogiState,
  depth: number,
  alpha: number,
  beta: number,
  perspective: SyahoShogiPlayer,
  config: CpuLevelConfig,
  deadline: number,
): number {
  ensureSearchTime(deadline);

  if (state.status === "FINISHED") {
    return evaluateTerminalState(state, perspective, depth);
  }

  if (depth <= 0) {
    if (config.endgameExtension && shouldExtendSearch(state)) {
      depth = 1;
    } else {
      return evaluateState(state, perspective, config);
    }
  }

  const actions = getAllLegalActions(state, state.currentPlayer);
  if (actions.length === 0) {
    return evaluateState(state, perspective, config);
  }

  const orderedActions = orderActions(state, actions, config);
  let bestScore = NEGATIVE_INFINITY;

  for (const action of orderedActions) {
    const nextState = applyKnownLegalAction(state, action);
    if (nextState === null) continue;

    const score = -negamax(
      nextState,
      depth - 1,
      config.alphaBeta ? -beta : NEGATIVE_INFINITY,
      config.alphaBeta ? -alpha : POSITIVE_INFINITY,
      perspective,
      config,
      deadline,
    );

    if (score > bestScore) {
      bestScore = score;
    }

    if (config.alphaBeta) {
      if (bestScore > alpha) {
        alpha = bestScore;
      }
      if (alpha >= beta) {
        break;
      }
    }
  }

  return bestScore;
}

function evaluateState(
  state: SyahoShogiState,
  perspective: SyahoShogiPlayer,
  config: CpuLevelConfig,
): number {
  if (state.status === "FINISHED") {
    return evaluateTerminalState(state, perspective, 0);
  }

  const opponent = getOpponent(perspective);
  const materialDiff = evaluateMaterial(state, perspective) - evaluateMaterial(state, opponent);
  const mobilityDiff =
    (getAllLegalActions(state, perspective).length - getAllLegalActions(state, opponent).length) *
    config.mobilityWeight;
  const bossProgressDiff =
    evaluateBossProgress(state, perspective) - evaluateBossProgress(state, opponent);
  const soldierProgressDiff =
    evaluateMizoguchiProgress(state, perspective) - evaluateMizoguchiProgress(state, opponent);
  const checkDiff =
    (isPlayerInCheck(state, opponent) ? 180 : 0) -
    (isPlayerInCheck(state, perspective) ? 230 * config.dangerMultiplier : 0);
  const immediateThreatDiff = evaluateImmediateThreats(state, perspective, config);
  const bossMobilityDiff =
    evaluateBossMobility(state, perspective) - evaluateBossMobility(state, opponent);

  return (
    materialDiff +
    mobilityDiff +
    bossProgressDiff +
    soldierProgressDiff +
    checkDiff +
    immediateThreatDiff +
    bossMobilityDiff
  );
}

function evaluateMaterial(state: SyahoShogiState, player: SyahoShogiPlayer): number {
  let score = 0;

  for (let row = 0; row < state.board.length; row += 1) {
    for (let col = 0; col < state.board[row].length; col += 1) {
      const piece = state.board[row][col];
      if (!piece || piece.owner !== player) continue;

      score += BOARD_PIECE_VALUES[piece.type];

      if (piece.type === "MIKURU") {
        score += 70;
      }
    }
  }

  for (const pieceType of Object.keys(HAND_PIECE_VALUES) as SyahoShogiHandPieceType[]) {
    score += (state.hands[player][pieceType] ?? 0) * HAND_PIECE_VALUES[pieceType];
  }

  return score;
}

function evaluateBossProgress(state: SyahoShogiState, player: SyahoShogiPlayer): number {
  const bossSquare = findBossSquare(state, player);
  if (!bossSquare) return -2_500;

  const distanceToGoal = player === 1 ? bossSquare.row : 3 - bossSquare.row;
  return (3 - distanceToGoal) * 85;
}

function evaluateBossMobility(state: SyahoShogiState, player: SyahoShogiPlayer): number {
  const bossSquare = findBossSquare(state, player);
  if (!bossSquare) return -300;

  return getLegalMovesFrom(state, bossSquare, player).length * 18;
}

function evaluateMizoguchiProgress(state: SyahoShogiState, player: SyahoShogiPlayer): number {
  let score = 0;

  for (let row = 0; row < state.board.length; row += 1) {
    for (let col = 0; col < state.board[row].length; col += 1) {
      const piece = state.board[row][col];
      if (!piece || piece.owner !== player || piece.type !== "MIZOGUCHI") continue;

      const distanceToGoal = player === 1 ? row : 3 - row;
      score += (3 - distanceToGoal) * 32;
    }
  }

  return score;
}

function evaluateImmediateThreats(
  state: SyahoShogiState,
  perspective: SyahoShogiPlayer,
  config: CpuLevelConfig,
): number {
  const currentPlayer = state.currentPlayer;

  if (hasImmediateWinningActionOnTurn(state)) {
    if (currentPlayer === perspective) {
      return 420 * config.tryDefenseMultiplier;
    }

    return -520 * config.tryDefenseMultiplier;
  }

  return 0;
}

function scoreImmediateAction(
  state: SyahoShogiState,
  action: SyahoShogiAction,
  player: SyahoShogiPlayer,
  config: CpuLevelConfig,
): number {
  const nextState = applyKnownLegalAction(state, action);
  if (nextState === null) return NEGATIVE_INFINITY;
  if (nextState.status === "FINISHED" && nextState.winner === player) return WIN_SCORE;

  const captureValue = getCapturedPieceValue(state, action) * config.captureBias;
  const promotionBonus = isPromotionMove(state, action) ? 240 : 0;
  const tryBonus = isBossTryMove(state, action, player) ? 280 : 0;
  const checkBonus =
    nextState.status === "PLAYING" && isPlayerInCheck(nextState, nextState.currentPlayer) ? 150 : 0;
  const dangerPenalty =
    hasImmediateWinningActionOnTurn(nextState) ? 360 * config.tryDefenseMultiplier : 0;
  const selfCheckPenalty = isPlayerInCheck(nextState, player) ? 220 * config.dangerMultiplier : 0;
  const positionalScore = evaluateState(nextState, player, config) * 0.14;

  return (
    captureValue +
    promotionBonus +
    tryBonus +
    checkBonus +
    positionalScore -
    dangerPenalty -
    selfCheckPenalty
  );
}

function orderActions(
  state: SyahoShogiState,
  actions: SyahoShogiAction[],
  config: CpuLevelConfig,
): SyahoShogiAction[] {
  return [...actions].sort((left, right) => {
    const rightScore = scoreImmediateAction(state, right, state.currentPlayer, config);
    const leftScore = scoreImmediateAction(state, left, state.currentPlayer, config);
    return rightScore - leftScore;
  });
}

function selectFromScoredActions(
  scoredActions: ScoredAction[],
  config: CpuLevelConfig,
): SyahoShogiAction {
  const rankedActions = [...scoredActions]
    .map(({ action, score }) => ({
      action,
      score: score + (Math.random() * 2 - 1) * config.noise,
    }))
    .sort((left, right) => right.score - left.score);

  const topCount = Math.max(1, Math.min(config.topN, rankedActions.length));
  const candidates = rankedActions.slice(0, topCount);

  if (candidates.length === 1) {
    return candidates[0].action;
  }

  const minScore = Math.min(...candidates.map((candidate) => candidate.score));
  const weightedCandidates = candidates.map((candidate, index) => ({
    action: candidate.action,
    weight: Math.max(1, Math.round(candidate.score - minScore + topCount - index + 1)),
  }));

  return pickWeighted(weightedCandidates);
}

function getImmediateWinningActions(
  state: SyahoShogiState,
  actions: SyahoShogiAction[],
): SyahoShogiAction[] {
  return actions.filter((action) => {
    const nextState = applyKnownLegalAction(state, action);
    return nextState?.status === "FINISHED" && nextState.winner === state.currentPlayer;
  });
}

function hasImmediateWinningActionOnTurn(state: SyahoShogiState): boolean {
  const actions = getAllLegalActions(state, state.currentPlayer);

  for (const action of actions) {
    const nextState = applyKnownLegalAction(state, action);
    if (nextState?.status === "FINISHED" && nextState.winner === state.currentPlayer) {
      return true;
    }
  }

  return false;
}

function shouldExtendSearch(state: SyahoShogiState): boolean {
  const totalPieces =
    countPiecesOnBoard(state) +
    countHandPieces(state, 1) +
    countHandPieces(state, 2);

  return totalPieces <= 6 || isPlayerInCheck(state, state.currentPlayer) || hasImmediateWinningActionOnTurn(state);
}

function countPiecesOnBoard(state: SyahoShogiState): number {
  let total = 0;

  for (const row of state.board) {
    for (const cell of row) {
      if (cell) total += 1;
    }
  }

  return total;
}

function countHandPieces(state: SyahoShogiState, player: SyahoShogiPlayer): number {
  return Object.values(state.hands[player]).reduce((sum, count) => sum + count, 0);
}

function evaluateTerminalState(
  state: SyahoShogiState,
  perspective: SyahoShogiPlayer,
  depthRemaining: number,
): number {
  if (state.winner === perspective) {
    return WIN_SCORE + depthRemaining * 16;
  }

  if (state.winner === null) {
    return 0;
  }

  return -WIN_SCORE - depthRemaining * 16;
}

function getCapturedPieceValue(state: SyahoShogiState, action: SyahoShogiAction): number {
  if (action.kind !== "MOVE") return 0;

  const capturedPiece = getPieceAt(state, action.to);
  if (!capturedPiece || capturedPiece.type === "BOSS") return 0;

  return BOARD_PIECE_VALUES[capturedPiece.type];
}

function isPromotionMove(state: SyahoShogiState, action: SyahoShogiAction): boolean {
  if (action.kind !== "MOVE") return false;

  const movingPiece = getPieceAt(state, action.from);
  if (!movingPiece || movingPiece.type !== "MIZOGUCHI") return false;

  return action.to.row === getGoalRow(movingPiece.owner);
}

function isBossTryMove(
  state: SyahoShogiState,
  action: SyahoShogiAction,
  player: SyahoShogiPlayer,
): boolean {
  if (action.kind !== "MOVE") return false;

  const movingPiece = getPieceAt(state, action.from);
  if (!movingPiece || movingPiece.type !== "BOSS") return false;

  return action.to.row === getGoalRow(player);
}

function applyKnownLegalAction(
  state: SyahoShogiState,
  action: SyahoShogiAction,
): SyahoShogiState | null {
  const result = applySyahoShogiAction(state, action);
  return result.ok ? result.state : null;
}

function ensureSearchTime(deadline: number) {
  if (Date.now() > deadline) {
    throw new SearchTimeoutError();
  }
}

function getGoalRow(player: SyahoShogiPlayer): number {
  return player === 1 ? 0 : 3;
}

function getOpponent(player: SyahoShogiPlayer): SyahoShogiPlayer {
  return player === 1 ? 2 : 1;
}

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickWeighted<T>(items: Array<{ action: T; weight: number }>): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let threshold = Math.random() * totalWeight;

  for (const item of items) {
    threshold -= item.weight;
    if (threshold <= 0) {
      return item.action;
    }
  }

  return items[items.length - 1].action;
}
