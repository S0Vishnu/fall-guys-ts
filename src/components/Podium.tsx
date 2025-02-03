import { getState } from "playroomkit";
import { useGameState } from "../hooks/useGameState";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Character } from "./Charecter";
import { Box } from "@react-three/drei";

export default function Podium() {
  const { winner } = useGameState();
  const winnerProfile = winner || getState("lastDead");
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    camera.position.set(5, 4, 12);
    camera.lookAt(0, 2, 0);
    return () => {
      camera.position.set(0, 16, 10);
      camera.lookAt(0, 0, 0);
    };
  }, []);

  return (
    <group>
      <Character
        name={winnerProfile?.name}
        color={winnerProfile?.color}
        position-y={0.5}
      />
      <Box scale-x={4} scale-z={2}>
        <meshStandardMaterial color="orange" />
      </Box>
    </group>
  );
}
