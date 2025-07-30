import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import "./App.css";

const xWinSound = new Audio(process.env.PUBLIC_URL + "/sounds/x-win.mp3");
const oWinSound = new Audio(process.env.PUBLIC_URL + "/sounds/o-win.mp3");
const drawSound = new Audio(process.env.PUBLIC_URL + "/sounds/draw.mp3");

const initialBoard = Array(9).fill(null);

const App = () => {
  const [board, setBoard] = useState(initialBoard);
  const [isXTurn, setIsXTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0, Draw: 0 });
  const [darkMode, setDarkMode] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState("Easy");
  const [mode, setMode] = useState("AI");

  const handleClick = (index) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXTurn ? "X" : "O";
    setBoard(newBoard);

    if (mode === "PVP") {
      setIsXTurn(!isXTurn);
    } else {
      setIsXTurn(false);
    }
  };

  const checkWinner = (b) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let [a, b1, c] of lines) {
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    }
    if (b.every(cell => cell)) return "Draw";
    return null;
  };

  const getRandomMove = (b) => {
    const empty = b.map((v, i) => v === null ? i : null).filter(v => v !== null);
    return empty[Math.floor(Math.random() * empty.length)];
  };

  const getBestMove = (b) => {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < b.length; i++) {
      if (!b[i]) {
        b[i] = "O";
        const score = minimax(b, 0, false);
        b[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  const minimax = (b, depth, isMaximizing) => {
    const result = checkWinner(b);
    if (result !== null) {
      const scores = { X: -10, O: 10, Draw: 0 };
      return scores[result];
    }

    if (isMaximizing) {
      let best = -Infinity;
      for (let i = 0; i < b.length; i++) {
        if (!b[i]) {
          b[i] = "O";
          best = Math.max(best, minimax(b, depth + 1, false));
          b[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < b.length; i++) {
        if (!b[i]) {
          b[i] = "X";
          best = Math.min(best, minimax(b, depth + 1, true));
          b[i] = null;
        }
      }
      return best;
    }
  };

  const resetGame = () => {
    setBoard(initialBoard);
    setWinner(null);
    setIsXTurn(true);
  };

  useEffect(() => {
    const result = checkWinner(board);
    if (result) {
      setWinner(result);
      if (result === "X") {
        xWinSound.play();
        confetti();
        setScores(prev => ({ ...prev, X: prev.X + 1 }));
      } else if (result === "O") {
        oWinSound.play();
        confetti();
        setScores(prev => ({ ...prev, O: prev.O + 1 }));
      } else if (result === "Draw") {
        drawSound.play();
        setScores(prev => ({ ...prev, Draw: prev.Draw + 1 }));
      }
    } else if (mode === "AI" && !isXTurn) {
      const aiMove = aiDifficulty === "Hard" ? getBestMove(board) : getRandomMove(board);
      if (aiMove !== -1) {
        setTimeout(() => {
          const newBoard = [...board];
          newBoard[aiMove] = "O";
          setBoard(newBoard);
          setIsXTurn(true);
        }, 500);
      }
    }
  }, [board, mode]);

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <h1>Tic Tac Toe</h1>
      <div className="mode-toggle">
        Mode:
        <button className={mode === "AI" ? "active" : ""} onClick={() => { setMode("AI"); resetGame(); }}>Player vs AI</button>
        <button className={mode === "PVP" ? "active" : ""} onClick={() => { setMode("PVP"); resetGame(); }}>Player vs Player</button>
      </div>
      {mode === "AI" && (
        <div className="difficulty-toggle">
          Difficulty:
          <button className={aiDifficulty === "Easy" ? "active" : ""} onClick={() => setAiDifficulty("Easy")}>Easy</button>
          <button className={aiDifficulty === "Hard" ? "active" : ""} onClick={() => setAiDifficulty("Hard")}>Hard</button>
        </div>
      )}
      <div className="board">
        {board.map((cell, index) => (
          <div key={index} className="cell" onClick={() => handleClick(index)}>
            {cell}
          </div>
        ))}
      </div>
      {winner && <h2>{winner === "Draw" ? "It's a Draw!" : `${winner} Wins!`}</h2>}
      <div className="scoreboard">
        <p>Score - X: {scores.X} | O: {scores.O} | Draw: {scores.Draw}</p>
      </div>
      <div className="controls">
        <button onClick={resetGame}>Play Again</button>
        <button onClick={() => setDarkMode(!darkMode)}>{darkMode ? "Light Mode" : "Dark Mode"}</button>
      </div>
    </div>
  );
};

export default App;
