import React, { useEffect, useState } from "react";

import { Layer, Rect, Stage, Text } from "react-konva";
import { Button } from "./components/ui/button";
import { Slider } from "./components/ui/slider";
import { getRandomHexColor, sleep } from "./lib/utils";

type VisitedData = {
  x: number;
  y: number;
  visited: boolean;
  color: string;
};

function App() {
  const [startClicked, setStartClicked] = useState(false);
  const [visited, setVisited] = useState(new Map<string, VisitedData>());
  const [canvasWidth, setCanvasWidth] = useState(window.innerWidth / 1.5);
  const [canvasHeight, setCanvasHeight] = useState(window.innerHeight / 1.5);
  const [gridWidth, setGridWidth] = useState(10);
  const [gridHeight, setGridHeight] = useState(10);

  const DELAY = 100;

  useEffect(() => {
    const handleResize = () => {
      setCanvasWidth(window.innerWidth / 1.5);
      setCanvasHeight(window.innerHeight / 1.5);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const renderGrid = () => {
    const items = [];

    for (const i of Array(gridWidth).keys()) {
      for (const j of Array(gridHeight).keys()) {
        items.push(
          <React.Fragment key={`${i}-${j}`}>
            <Rect
              x={(canvasWidth / gridWidth) * i}
              y={(canvasHeight / gridHeight) * j}
              width={canvasWidth / gridWidth}
              height={canvasHeight / gridHeight}
              fill={"rgba(255, 255, 255, 0.6)"}
              stroke={"black"}
            />
            <Text
              x={
                (canvasWidth / gridWidth) * i +
                canvasWidth / gridWidth / 2 -
                canvasWidth / gridWidth / 8 / 2
              }
              y={
                (canvasHeight / gridHeight) * j +
                canvasHeight / gridHeight / 2 -
                canvasWidth / gridWidth / 8 / 2
              }
              text={`${i}${j}`}
              fill={"black"}
              fontSize={canvasWidth / gridWidth / 8}
            />
          </React.Fragment>
        );
      }
    }

    return items;
  };

  const calcVisited = async (x: number, y: number) => {
    if (
      x < 0 ||
      y < 0 ||
      x >= gridWidth ||
      y >= gridHeight ||
      visited.has(`${x}-${y}`)
    )
      return;

    setVisited(
      new Map(
        visited.set(`${x}-${y}`, {
          visited: true,
          color: getRandomHexColor(),
          x,
          y,
        })
      )
    );
    await sleep(DELAY);
    calcVisited(x + 1, y);
    await sleep(DELAY);
    calcVisited(x - 1, y);
    await sleep(DELAY);
    calcVisited(x, y - 1);
    await sleep(DELAY);
    calcVisited(x, y + 1);
  };

  const renderPath = () => {
    const items = [];
    for (const [key, value] of visited.entries()) {
      const [x, y] = key.split("-").map((v) => parseInt(v));
      if (value) {
        items.push(
          <Rect
            key={`${x}-${y}`}
            x={(canvasWidth / gridWidth) * x}
            y={(canvasHeight / gridHeight) * y}
            width={canvasWidth / gridWidth}
            height={canvasHeight / gridHeight}
            fill={value.color}
            stroke={"black"}
            draggable
          />
        );
      }
    }
    return items;
  };

  return (
    <div className="flex items-center justify-center flex-col gap-4 h-screen bg-gray-500">
      <Stage
        style={{
          backgroundColor: "transparent",
        }}
        width={canvasWidth}
        height={canvasHeight}
      >
        <Layer>{renderGrid()}</Layer>
        {!!startClicked && <Layer>{renderPath()}</Layer>}
      </Stage>
      <Button
        className="rounded-xl"
        onClick={() => {
          setVisited(new Map());
          setStartClicked(true);
          calcVisited(0, 0);
        }}
        disabled={visited.size > 0 && visited.size < gridWidth * gridHeight}
      >
        Start
      </Button>
      <div className="flex flex-row gap-4 w-full p-4">
        <p>Columns</p>
        <Slider
          defaultValue={[gridWidth]}
          max={100}
          min={10}
          onValueChange={(e) => setGridWidth(e[0])}
        />
        <p>Rows</p>
        <Slider
          defaultValue={[gridHeight]}
          max={100}
          min={10}
          onValueChange={(e) => setGridHeight(e[0])}
        />
      </div>
    </div>
  );
}

export default App;
