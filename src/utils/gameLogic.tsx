/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/utils/gameLogic.ts

type Position = {
  row: number;
  col: number;
};

export type BoardState = (string | null)[][];

const dfs = (
  board: BoardState,
  row: number,
  col: number,
  visited: boolean[][],
  color: string
): Position[] => {
  if (
    row < 0 ||
    row >= board.length ||
    col < 0 ||
    col >= board.length ||
    visited[row][col] ||
    board[row][col] !== color
  ) {
    return [];
  }

  visited[row][col] = true;
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  const positions: Position[] = [{ row, col }];
  for (const [dr, dc] of directions) {
    positions.push(...dfs(board, row + dr, col + dc, visited, color));
  }
  return positions;
};
const isGroupSurrounded = (board: BoardState, group: Position[]): boolean => {
  return group.every(({ row, col }) => {
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    return directions.every(([dr, dc]) => {
      const newRow = row + dr;
      const newCol = col + dc;
      return (
        newRow < 0 ||
        newRow >= board.length ||
        newCol < 0 ||
        newCol >= board[newRow].length ||
        board[newRow][newCol] !== null
      );
    });
  });
};

const captureStones = (board: BoardState, group: Position[]): BoardState => {
  const newBoard = board.map((row) => [...row]);
  for (const { row, col } of group) {
    newBoard[row][col] = null;
  }
  return newBoard;
};

export const checkAndCaptureStones = (
  boardState: BoardState,
  lastMove: Position,
  currentPlayer: string
): BoardState => {
  const opponentColor = currentPlayer === "black" ? "white" : "black";
  let visited = Array.from({ length: boardState.length }, () =>
    Array(boardState.length).fill(false)
  );

  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (const [dr, dc] of directions) {
    const newRow = lastMove.row + dr;
    const newCol = lastMove.col + dc;

    if (
      newRow >= 0 &&
      newRow < boardState.length &&
      newCol >= 0 &&
      newCol < boardState[newRow].length &&
      boardState[newRow][newCol] === opponentColor
    ) {
      const group = dfs(boardState, newRow, newCol, visited, opponentColor);
      if (isGroupSurrounded(boardState, group)) {
        boardState = captureStones(boardState, group);
      }
    }
  }

  return boardState;
};

// Ajoutez cette fonction dans gameLogic.ts

export const isMoveValid = (
  boardState: BoardState,
  move: Position,
  currentPlayer: string,
  previousBoardState: BoardState | null // Ajouté pour vérifier la règle du Ko
): boolean => {
  // Vérifie si l'intersection est déjà occupée
  if (boardState[move.row][move.col] !== null) {
    return false;
  }

  // Crée une copie du plateau avec le nouveau coup
  const testBoard = boardState.map((row) => [...row]);
  testBoard[move.row][move.col] = currentPlayer;

  // Vérifier les libertés directes
  let hasLiberty = false;
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (const [dr, dc] of directions) {
    const newRow = move.row + dr;
    const newCol = move.col + dc;
    if (
      newRow >= 0 &&
      newRow < testBoard.length &&
      newCol >= 0 &&
      newCol < testBoard[newRow].length &&
      testBoard[newRow][newCol] === null
    ) {
      hasLiberty = true;
      break;
    }
  }

  // Vérifie les captures potentielles
  if (!hasLiberty) {
    hasLiberty = checkForCaptures(testBoard, move, currentPlayer);
  }

  // Vérifier la règle du Ko
  if (previousBoardState && boardsAreEqual(testBoard, previousBoardState)) {
    return false;
  }

  return hasLiberty;
};

const checkForCaptures = (
  board: BoardState,
  lastMove: Position,
  currentPlayer: string
): boolean => {
  let captures = false;
  const opponentColor = currentPlayer === "black" ? "white" : "black";
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  directions.forEach(([dr, dc]) => {
    const newRow = lastMove.row + dr;
    const newCol = lastMove.col + dc;
    if (
      newRow >= 0 &&
      newRow < board.length &&
      newCol >= 0 &&
      newCol < board[newRow].length &&
      board[newRow][newCol] === opponentColor
    ) {
      const visited = board.map((row) => row.map(() => false));
      const group = dfs(board, newRow, newCol, visited, opponentColor);
      if (isGroupSurrounded(board, group)) {
        captures = true;
      }
    }
  });

  return captures;
};

// Dans gameLogic.ts

const boardsAreEqual = (board1: BoardState, board2: BoardState): boolean => {
  for (let i = 0; i < board1.length; i++) {
    for (let j = 0; j < board1[i].length; j++) {
      if (board1[i][j] !== board2[i][j]) {
        return false;
      }
    }
  }
  return true;
};

// Fonction DFS pour explorer un groupe d'intersections vides
function dfsForEmptySpaces(
  board: BoardState,
  row: number,
  col: number,
  visited: boolean[][]
): Position[] {
  if (
    row < 0 ||
    row >= board.length ||
    col < 0 ||
    col >= board.length ||
    visited[row][col] ||
    board[row][col] !== null
  ) {
    return [];
  }

  visited[row][col] = true;
  const positions: Position[] = [{ row, col }];
  const directions: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [dr, dc] of directions) {
    positions.push(...dfsForEmptySpaces(board, row + dr, col + dc, visited));
  }

  return positions;
}

// Fonction pour déterminer à qui appartient un territoire
function determineTerritoryOwnership(
  board: BoardState,
  group: Position[]
): string | null {
  const colors = new Set<string>();
  group.forEach(({ row, col }) => {
    const directions: [number, number][] = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    directions.forEach(([dr, dc]) => {
      const adjRow = row + dr;
      const adjCol = col + dc;
      if (
        adjRow >= 0 &&
        adjRow < board.length &&
        adjCol >= 0 &&
        adjCol < board.length &&
        board[adjRow][adjCol] !== null
      ) {
        colors.add(board[adjRow][adjCol] as string);
      }
    });
  });

  if (colors.size === 1) {
    return colors.values().next().value;
  }

  return null;
}

// calcul du seki
const isSeki = (
  board: BoardState,
  group: Position[],
  visited: boolean[][]
): boolean => {
  for (const { row, col } of group) {
    const directions: [number, number][] = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (
        newRow >= 0 &&
        newRow < board.length &&
        newCol >= 0 &&
        newCol < board.length &&
        board[newRow][newCol] === null
      ) {
        return false;
      }
    }
  }
  return true;
};

// paramètres de l'handicap
const handicapPositions = {
  9: [
    { row: 2, col: 6 },
    { row: 6, col: 2 },
    { row: 6, col: 6 },
    { row: 2, col: 2 },
    { row: 4, col: 4 },
  ],
  13: [
    { row: 3, col: 9 },
    { row: 9, col: 3 },
    { row: 9, col: 9 },
    { row: 3, col: 3 },
    { row: 6, col: 6 },
  ],
  19: [
    { row: 3, col: 15 },
    { row: 15, col: 3 },
    { row: 15, col: 15 },
    { row: 3, col: 3 },
    { row: 9, col: 9 },
  ],
};

// le ko
export const isKo = (
  board: BoardState,
  move: Position,
  currentPlayer: string,
  previousBoardState: BoardState | null
): boolean => {
  if (!previousBoardState) {
    return false;
  }

  const testBoard = board.map((row) => [...row]);
  testBoard[move.row][move.col] = currentPlayer;

  return boardsAreEqual(testBoard, previousBoardState);
};

// calcul du score
export const calculateScore = (
  board: BoardState,
  captured: { black: number; white: number }
): { black: number; white: number } => {
  const visited = board.map((row) => row.map(() => false));
  const territory: { black: number; white: number } = { black: 0, white: 0 };

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (!visited[i][j]) {
        const group = dfsForEmptySpaces(board, i, j, visited);
        const owner = determineTerritoryOwnership(board, group);
        if (owner === "black") {
          territory.black += group.length;
        } else if (owner === "white") {
          territory.white += group.length;
        } else if (isSeki(board, group, visited)) {
          // Seki
          continue;
        }
      }
    }
  }

  return {
    black: territory.black + captured.black,
    white: territory.white + captured.white,
  };
};
