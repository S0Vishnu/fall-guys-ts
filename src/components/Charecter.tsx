import React, { useEffect, useMemo, useRef } from "react";
import { Group } from "three";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useGraph } from "@react-three/fiber";
import { SkeletonUtils } from "three-stdlib";

interface CharacterProps {
  animation?: "wave" | "FG_Run_A" | "FG_Walk_A" | "FG_Idle_A"; // Possible animations
  color?: string; // Material color
  name?: string; // Name of the character
  [key: string]: unknown; // Allow additional props
}

export const Character: React.FC<CharacterProps> = ({
  animation = "wave",
  color = "yellow",
  name = "Player",
  ...props
}) => {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(
    "/models/character.glb",
    "draco/gltf/"
  ) as any;

  // Skinned meshes cannot be re-used in threejs without cloning them
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone) as any;
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    actions[animation]?.reset().fadeIn(0.1).play();
    // Cleanup function
    return () => {
      if (actions[animation]) {
        actions[animation].fadeOut(0.1);
      }
    };
  }, [animation, actions]);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="fall_guys">
          <primitive object={nodes._rootJoint} />
          <skinnedMesh
            name="body"
            geometry={nodes.body.geometry}
            skeleton={nodes.body.skeleton}
          >
            <meshStandardMaterial {...materials.Material_0} color={color} />
          </skinnedMesh>
          <skinnedMesh
            name="eye"
            geometry={nodes.eye.geometry}
            material={materials.Material_2}
            skeleton={nodes.eye.skeleton}
          >
            <meshStandardMaterial {...materials.Material_2} color={"white"} />
          </skinnedMesh>
          <skinnedMesh
            name="hand-"
            geometry={nodes["hand-"].geometry}
            skeleton={nodes["hand-"].skeleton}
          >
            <meshStandardMaterial {...materials.Material_0} color={color} />
          </skinnedMesh>
          <skinnedMesh
            name="leg"
            geometry={nodes.leg.geometry}
            skeleton={nodes.leg.skeleton}
          >
            <meshStandardMaterial {...materials.Material_0} color={color} />
          </skinnedMesh>
        </group>
      </group>
    </group>
  );
};

useGLTF.preload("/models/character.glb", "draco/gltf/");
