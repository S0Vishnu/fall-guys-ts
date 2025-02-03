import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Color } from "three";
import { randFloat } from "three/src/math/MathUtils.js";
import { RigidBody } from "@react-three/rapier";

// Define the type for Hexagon props, allowing optional color and any additional props (e.g., position, rotation, etc.)
interface HexagonProps {
  color?: string; // Optional color prop to override default color
  [key: string]: any; // Additional props such as position, rotation, etc.
}

// Hexagon component definition
export const Hexagon: React.FC<HexagonProps> = ({ color, ...props }) => {

  // Load GLTF model and materials using the useGLTF hook from @react-three/drei
  const { nodes, materials } = useGLTF(
    "/models/hexagon.glb", // Path to the model file
    "draco/gltf/" // Path for DRACO compressed files, if needed
  ) as any; // Cast to 'any' since the GLTF loading type can be complex

  // Randomize color intensity using useMemo to avoid recalculating on every render
  const RandomColor = useMemo(() => {
    const newColor = new Color(color); // Create a Color instance from the provided `color` prop
    newColor.multiplyScalar(randFloat(0.5, 1.2)); // Randomly adjust the color's brightness
    return newColor; // Return the randomized color
  }, [color]); // Only recalculate when `color` prop changes

  return (
    <RigidBody
      {...props}
      type="fixed"
      name="hexagon"
      colliders="hull"
    >
      {/* Spread any additional props to the RigidBody element */}
      <mesh geometry={nodes.Hexagon.geometry} material={materials.hexagon}>
        {/* Render the hexagon mesh with a standard material */}
        <meshStandardMaterial
          {...materials.hexagon} // Apply the base material from the model
          color={RandomColor} // Apply the randomized color
          transparent // Allow transparency (in case of blending)
        />
      </mesh>
    </RigidBody>
  );
};

// Preload the GLTF model for better performance
useGLTF.preload("/models/hexagon.glb", "draco/gltf/");
