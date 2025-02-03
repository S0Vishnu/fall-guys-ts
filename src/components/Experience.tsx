import React, { useEffect } from "react";
import { Environment, OrbitControls } from "@react-three/drei";
import GameArena from "./GameArena";
import CharacterController from "./CharecterController";
import { useGameState } from "../hooks/useGameState";
import { myPlayer } from "playroomkit";
import Podium from "./Podium";
import { useThree } from "@react-three/fiber";

export const Experience: React.FC = () => {
  const { players, gameStage } = useGameState();
  const me = myPlayer();
  const camera = useThree((state) => state.camera);
  const firstNonDeadPlayer = players?.find((p) => !p.state.getState("dead"));

  useEffect(() => {
    if (gameStage === "countdown") {
      camera.position.set(0, 50, -50);
    }
  }, [gameStage]);

  return (
    <>
      <OrbitControls />
      <Environment files="hdrs/medieval_cafe_1k.hdr" />
      {gameStage === "winner" ? (
        <Podium />
      ) : (
        <>
          {/* Render GameArena if not in lobby */}
          {gameStage !== "lobby" && <GameArena />}
          {/* Render CharacterControllers for each player */}
          {players?.map(({ state, controls }, index) => (
            <>
              <CharacterController
                key={state.id || index}
                state={state}
                controls={controls}
                player={me.id === state.id}
                firstNonDeadPlayer={firstNonDeadPlayer?.state.id === state.id}
                position-y={2}
              />
            </>
          ))}
        </>
      )}
    </>
  );
};
