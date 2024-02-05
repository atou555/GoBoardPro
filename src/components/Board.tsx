import React, { useState } from "react";
import { BoardState, calculateScore, isMoveValid } from "../utils/gameLogic";

/* eslint-disable @typescript-eslint/no-unused-vars */
// Styles CSS

const styles = {
  highlightStone: {
    boxShadow: "0 0 10px 3px yellow",
  },
  playerText: {
    color: "#333",
    fontWeight: "bold",
  },

  page: {
    fontFamily: "'Open Sans', sans-serif",
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#f5f5f5",
    maxWidth: "800px",
    margin: "0 auto",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  playerDisplay: {
    marginBottom: "15px",
    backgroundColor: "#e3f2fd",
    padding: "10px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    color: "#333",
    fontWeight: "bold",
  },
  board: {
    position: "relative",
    margin: "20px auto",
    border: "1px solid #b69f58",
    backgroundColor: "#f0d9b5",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
  },

  horizontalLine: (index: number, boardSize: number, gridSize: number) => ({
    position: "absolute" as const,
    top: `${(index + 1) * (boardSize / gridSize)}px`,
    left: "0",
    width: "100%",
    height: "1px",
    backgroundColor: "black",
  }),
  verticalLine: (index: number, boardSize: number, gridSize: number) => ({
    position: "absolute" as const,
    left: `${(index + 1) * (boardSize / gridSize)}px`,
    top: "0",
    width: "1px",
    height: "100%",
    backgroundColor: "black",
  }),
  intersection: (
    rowIndex: number,
    colIndex: number,
    gridSize: number,
    intersectionSize: number
  ) => ({
    position: "absolute" as const,
    top: `${(rowIndex / gridSize) * 100}%`,
    left: `${(colIndex / gridSize) * 100}%`,
    width: `${intersectionSize}px`,
    height: `${intersectionSize}px`,
    backgroundColor: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    transform: "translate(-50%, -50%)",
  }),
  stone: (cell: string) => ({
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    backgroundColor: cell === "black" ? "black" : "white",
  }),
  history: {
    marginTop: "20px",
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  },
  historyTitle: {
    color: "#666",
  },
  historyList: {
    listStyleType: "none",
    padding: 0,
  },
  historyItem: {
    textAlign: "left" as const,
    padding: "5px",
  },
  errorMessage: {
    // Style pour le message d'erreur
    color: "red",
    margin: "10px 0",
  },
  undoButton: {
    // Style pour le bouton d'annulation
    margin: "10px",
    padding: "5px 10px",
    backgroundColor: "#e3f2fd",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

const Board: React.FC = () => {
  const gridSize = 19;
  const boardSize = 500;
  const intersectionSize = 20;

  const [boardState, setBoardState] = useState(
    Array.from({ length: gridSize }, () => Array(gridSize).fill(null))
  );
  const [captured, setCaptured] = useState({ black: 0, white: 0 });
  const [score, setScore] = useState({ black: 0, white: 0 });
  const [previousBoardState, setPreviousBoardState] =
    useState<BoardState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState("black");
  const [moveHistory, setMoveHistory] = useState<
    {
      previousBoardState: BoardState | null;
      row: number;
      col: number;
      player: string;
    }[]
  >([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(
    null
  );

  const handleIntersectionClick = (row: number, col: number) => {
    const move = { row, col };

    // Vérifie si le coup est valide
    if (isMoveValid(boardState, move, currentPlayer, previousBoardState)) {
      // Crée une copie du plateau et ajoute le nouveau coup
      const updatedBoard = boardState.map((rowArray) => [...rowArray]);
      updatedBoard[row][col] = currentPlayer;

      // Met à jour l'état du plateau
      setBoardState(updatedBoard);

      // Sauvegarde l'état précédent du plateau
      setPreviousBoardState([...boardState]);

      // Ajoute le coup à l'historique des mouvements
      const newMoveHistory = [
        ...moveHistory,
        {
          previousBoardState: [...boardState],
          row,
          col,
          player: currentPlayer,
        },
      ];
      setMoveHistory(newMoveHistory);

      // Change le joueur actuel
      setCurrentPlayer(currentPlayer === "black" ? "white" : "black");

      // Calcule le nouveau score
      const newScore = calculateScore(updatedBoard, captured);
      setScore(newScore);

      // Réinitialise le message d'erreur
      setErrorMessage("");
    } else {
      // Définit le message d'erreur si le coup est invalide
      setErrorMessage("Coup invalide !");
    }
  };

  const undoLastMove = () => {
    if (moveHistory.length > 0) {
      const lastMove = moveHistory[moveHistory.length - 1];
      setBoardState(lastMove.previousBoardState ?? []);
      setCurrentPlayer(lastMove.player === "black" ? "white" : "black");
      setMoveHistory(moveHistory.slice(0, -1));
    }
  };

  return (
    <div style={{ ...styles.page, textAlign: "left" }}>
      <div style={styles.playerDisplay}>
        <h2 style={styles.playerText}>
          Joueur actuel : {currentPlayer === "black" ? "Noir" : "Blanc"}
        </h2>
      </div>
      {/* tout le temps affiché annuler le dernier coup */}
      {moveHistory.length > 0 && (
        <button onClick={undoLastMove} style={styles.undoButton}>
          Annuler le dernier coup
        </button>
      )}
      {errorMessage && <div style={styles.errorMessage}>{errorMessage}</div>}
      <div
        style={{
          ...styles.board,
          width: `${boardSize}px`,
          height: `${boardSize}px`,
          position: "relative",
        }}
      >
        {Array.from({ length: gridSize - 1 }).map((_, index) => (
          <React.Fragment key={index}>
            <div style={styles.horizontalLine(index, boardSize, gridSize)} />
            <div style={styles.verticalLine(index, boardSize, gridSize)} />
          </React.Fragment>
        ))}
        {boardState.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              style={styles.intersection(
                rowIndex,
                colIndex,
                gridSize,
                intersectionSize
              )}
              onClick={() => handleIntersectionClick(rowIndex, colIndex)}
            >
              {cell && <div style={styles.stone(cell)} />}
            </button>
          ))
        )}
      </div>
      <div style={styles.history}>
        <h3 style={styles.historyTitle}>Historique des coups</h3>
        <ul style={styles.historyList}>
          {moveHistory.map((move, index) => (
            <li key={index} style={styles.historyItem}>
              {`Coup ${index + 1}: Joueur ${move.player} à la ligne ${
                move.row + 1
              }, colonne ${move.col + 1}`}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Score</h2>
        <>{console.log(score)}</>
        <p>Noir: {score.black}</p>
        <p>Blanc: {score.white}</p>
      </div>
    </div>
  );
};

export default Board;
