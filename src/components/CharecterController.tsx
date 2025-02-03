import { CapsuleCollider, euler, quat, RigidBody } from "@react-three/rapier";
import React, { useRef, useState } from "react";
import { Character } from "./Charecter";
import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useGameState } from "../hooks/useGameState";
import { Vector3 } from "three";
import { Controls } from "../App";
import { FLOOR_HEIGHT, FLOORS } from "./GameArena";
import { setState } from "playroomkit";
import { useAudioManager } from "../hooks/useAudioManager";

// Assuming that the 'controls' prop is of type 'Joystick' and 'gameStage' is a string
interface CharacterControllerProps {
  player?: any; // Optional boolean, since it's defaulted to `false`
  controls?: any; // Assuming 'Joystick' is a custom type or class
  gameStage?: any; // Assuming gameStage is a string
  [key: string]: any; // This allows for other props to be passed to the component
}

const MOVEMENT_SPEED = 4.2;
const JUMP_FORCE = 8;
const ROTATION_SPEED = 2.5;
const vel = new Vector3();

// The component function
const CharacterController: React.FC<CharacterControllerProps> = ({
  player = false,
  controls,
  state,
  ...props
}) => {

  const { playAudio } = useAudioManager();
  const rb = useRef<any>();
  const [, get] = useKeyboardControls();

  // const isDead = state.getState("dead");
  const [animation, setAnimation] = useState("idle");
  const { gameStage } = useGameState();

  const inTheAir = useRef(true);
  const landed = useRef(false);

  useFrame(() => {
    if (gameStage === "lobby") return;
    if (gameStage === "game") return;

    if (!player) {
      const pos = state.getState("pos");
      if (pos) {
        rb.current.setTranslation(pos);
      }
      const rot = state.getState("rot");
      if (rot) {
        rb.current.setRotation(rot);
      }
      const anim = state.getState("animation");
      setAnimation(anim);
      return;
    }

    const rotVel = {
      x: 0,
      y: 0,
      z: 0,
    };

    const curVel = rb.current.linvel();
    vel.x = 0;
    vel.y = 0;
    vel.z = 0;

    const angle = controls.angle();
    const joystickX = Math.sin(angle);
    const joystickY = Math.cos(angle);

    if (
      get()[Controls.forward] ||
      (controls.isJoystickPressed() && joystickY < -0.1)
    ) {
      vel.z += MOVEMENT_SPEED;
    }
    if (
      get()[Controls.back] ||
      (controls.isJoystickPressed() && joystickY > 0.1)
    ) {
      vel.z -= MOVEMENT_SPEED;
    }
    if (
      get()[Controls.left] ||
      (controls.isJoystickPressed() && joystickX < -0.1)
    ) {
      rotVel.y += ROTATION_SPEED;
    }
    if (
      get()[Controls.right] ||
      (controls.isJoystickPressed() && joystickX > 0.1)
    ) {
      rotVel.y -= ROTATION_SPEED;
    }

    rb.current.setAngvel(rotVel);
    // apply rotation to x and z to go in the right direction
    const eulerRot = euler().setFromQuaternion(quat(rb.current.rotation()));
    vel.applyEuler(eulerRot);
    if (
      (get()[Controls.jump] || controls.isPressed("Jump")) &&
      !inTheAir.current &&
      landed.current
    ) {
      vel.y += JUMP_FORCE;
      inTheAir.current = true;
      landed.current = false;
    } else {
      vel.y = curVel.y;
    }
    if (Math.abs(vel.y) > 1) {
      inTheAir.current = true;
      landed.current = false;
    } else {
      inTheAir.current = false;
    }
    rb.current.setLinvel(vel);
    state.setState("pos", rb.current.translation());
    state.setState("rot", rb.current.rotation());

    // ANIMATION
    const movement = Math.abs(vel.x) + Math.abs(vel.z);
    if (inTheAir.current && vel.y > 2) {
      setAnimation("jump_up");
      state.setState("animation", "jump_up");
    } else if (inTheAir.current && vel.y < -5) {
      setAnimation("fall");
      state.setState("animation", "fall");
    } else if (movement > 1 || inTheAir.current) {
      setAnimation("run");
      state.setState("animation", "run");
    } else {
      setAnimation("idle");
      state.setState("animation", "idle");
    }

    if (
      rb.current.translation().y < -FLOOR_HEIGHT * FLOORS.length &&
      !state.getState("dead")
    ) {
      state.setState("dead", true);
      setState("lastDead", state.state.profile, true);
      playAudio("Dead", true);
    }
  });

  // const startingPos = state.getState("startingPos");
  // if (isDead || !startingPos) {
  //   return null;
  // }

  return (
    <RigidBody
      {...props}
      colliders={false}
      canSleep={false}
      enabledRotations={[false, true, false]}
      ref={rb}
    >
      <Character
        scale={0.42}
        color={state?.state.profile?.color}
        name={state?.state.profile?.name}
        position-y={0.2}
      />
      <CapsuleCollider args={[0.1, 0.38]} position={[0, 0.6, 0]} />
    </RigidBody>
  ); // If you don't have any JSX to return, you can return null
};

export default CharacterController;
