import React from "react";
import { Environment, OrbitControls } from "@react-three/drei";
import GameArena from "./GameArena";
import CharacterController from "./CharecterController";
import { useGameState } from "../hooks/useGameState";
import { myPlayer } from "playroomkit";

export const Experience: React.FC = () => {
  const { players, gameStage } = useGameState();
  const me = myPlayer();
  const firstNonDeadPlayer = players?.find((p) => !p.state.getState("dead"));

  return (
    <>
      <OrbitControls />
      <Environment files="hdrs/medieval_cafe_1k.hdr" />
      <>
        {/* Render GameArena if not in lobby */}
        {gameStage !== "lobby" && <GameArena />}
        <GameArena />
        {/* Render CharacterControllers for each player */}
        {players?.map((state, index, controls) => (
          <CharacterController
            key={state.id || index}
            state={state}
            controls={controls}
            player={me.id === state.id}
            firstNonDeadPlayer={firstNonDeadPlayer?.state.id === state.id}
            position-y={2}
          />
        ))}
      </>
    </>
  );
};
