"use client"

import React, { useState } from "react";
import axios from "axios";

const GRID_SIZE = 20;

function App() {
  const [grid, setGrid] = useState(createInitialGrid());
  const [startTile, setStartTile] = useState(null);
  const [endTile, setEndTile] = useState(null);
  const [path, setPath] = useState([]);

  function createInitialGrid() {
    return Array.from({ length: GRID_SIZE }, (_, row) =>
      Array.from({ length: GRID_SIZE }, (_, col) => ({
        row,
        col,
        isStart: false,
        isEnd: false,
        isPath: false,
      }))
    );
  }

  function handleCellClick(row, col) {
    if (!startTile) {
      setStartTile({ row, col });
      updateGrid(row, col, "isStart");
    } else if (!endTile) {
      setEndTile({ row, col });
      updateGrid(row, col, "isEnd");
    }
  }

  function updateGrid(row, col, type) {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((gridRow) =>
        gridRow.map((cell) => {
          if (cell.row === row && cell.col === col) {
            return { ...cell, [type]: true };
          }
          return cell;
        })
      );
      return newGrid;
    });
  }

  async function findPath() {
    if (!startTile || !endTile) {
      alert("Please select both start and end tiles.");
      return;
    }

    const requestBody = {
      start: { x: startTile.row, y: startTile.col },
      end: { x: endTile.row, y: endTile.col },
    };

    try {
      const response = await axios.post("https://backend-gb9q.onrender.com/find-path", requestBody);
      const { path } = response.data;

      setPath(path);
      highlightPath(path);
    } catch (error) {
      console.error("Error fetching path:", error);
    }
  }

  function highlightPath(path) {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((gridRow) =>
        gridRow.map((cell) => {
          const isPathCell = path.some((p) => p.x === cell.row && p.y === cell.col);
          return { ...cell, isPath: isPathCell };
        })
      );
      return newGrid;
    });
  }

  function resetGrid() {
    setGrid(createInitialGrid());
    setStartTile(null);
    setEndTile(null);
    setPath([]);
  }

  return (
    <div className="App">
      <h1>Pathfinding Visualizer</h1>
      <div className="grid">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`cell ${
                cell.isStart
                  ? "start"
                  : cell.isEnd
                  ? "end"
                  : cell.isPath
                  ? "path"
                  : ""
              }`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            ></div>
          ))
        )}
      </div>
      <button onClick={findPath}>Find Path</button>
      <button onClick={resetGrid}>Reset Grid</button>
    </div>
  );
}

export default App;