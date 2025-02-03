import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { Color } from "three";
import { MathUtils, randFloat } from "three/src/math/MathUtils.js";
import { RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";

const TIME_AFTER_HIT = 600;

// Define the type for Hexagon props, allowing optional color and any additional props (e.g., position, rotation, etc.)
interface HexagonProps {
  color?: string; // Optional color prop to override default color
  onHit?: any;
  hit?: any;
  [key: string]: any; // Additional props such as position, rotation, etc.
}

// Hexagon component definition
export const Hexagon: React.FC<HexagonProps> = ({
  color,
  onHit,
  hit,
  ...props
}) => {
  // Load GLTF model and materials using the useGLTF hook from @react-three/drei
  const { nodes, materials } = useGLTF(
    "/models/hexagon.glb", // Path to the model file
    "draco/gltf/" // Path for DRACO compressed files, if needed
  ) as any; // Cast to 'any' since the GLTF loading type can be complex

  const [disabled, setDisabled] = useState(false);
  const hexagonMaterial = useRef<any>();

  // Randomize color intensity using useMemo to avoid recalculating on every render
  const RandomColor = useMemo(() => {
    const newColor = new Color(color); // Create a Color instance from the provided `color` prop
    newColor.multiplyScalar(randFloat(0.5, 1.2)); // Randomly adjust the color's brightness
    return newColor; // Return the randomized color
  }, [color]); // Only recalculate when `color` prop changes

  useFrame((_, delta) => {
    if (hit && !disabled) {
      hexagonMaterial.current.opacity = MathUtils.lerp(
        hexagonMaterial.current.opacity,
        0,
        delta * 1.2
      );
    }
  });

  useEffect(() => {
    if (hit) {
      setTimeout(() => {
        setDisabled(true);
      }, TIME_AFTER_HIT);
    }
  }, [hit]);

  if (disabled) return null;

  return (
    <RigidBody
      {...props}
      type="fixed"
      name="hexagon"
      colliders="hull"
      onCollisionEnter={(e) => {
        if (e.other.rigidBodyObject?.name === "player") {
          onHit();
        }
      }}
    >
      {/* Spread any additional props to the RigidBody element */}
      <mesh geometry={nodes.Hexagon.geometry} material={materials.hexagon}>
        {/* Render the hexagon mesh with a standard material */}
        <meshStandardMaterial
          ref={hexagonMaterial}
          {...materials.hexagon} // Apply the base material from the model
          color={hit ? "orange" : RandomColor} // Apply the randomized color
          transparent // Allow transparency (in case of blending)
        />
      </mesh>
    </RigidBody>
  );
};

// Preload the GLTF model for better performance
useGLTF.preload("/models/hexagon.glb", "draco/gltf/");
