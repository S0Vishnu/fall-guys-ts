import {
  isHost,
  Joystick,
  onPlayerJoin,
  useMultiplayerState,
} from "playroomkit";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { randFloat } from "three/src/math/MathUtils.js";
import {
  HEX_X_SPACING,
  HEX_Z_SPACING,
  NB_COLUMNS,
  NB_ROWS,
} from "../components/GameArena";

// Define possible game states
type GameState = "lobby" | "countdown" | "game" | "winner";

// Define the shape of your game state
interface GameStateContext {
  gameStage?: GameState;
  timer?: number;
  players?: any[];
  host?: boolean;
  startGame?: () => void;
  winner?: string | null;
}

const NEXT_STAGE: { [key in GameState]: GameState } = {
  lobby: "countdown",
  countdown: "game",
  game: "winner",
  winner: "lobby",
};

const TIMER_STAGE = {
  lobby: -1,
  countdown: 3,
  game: 0,
  winner: 5,
};

// Create context with the GameState type and a default value
const GameStateContext = createContext<GameStateContext | undefined>(undefined);

export const GameStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [gameStage, setGameState] = useMultiplayerState<GameState>(
    "gameStage",
    "lobby"
  );
  const [winner, setWinner] = useMultiplayerState("winner", null);
  const [timer, setTimer] = useMultiplayerState("timer", TIMER_STAGE.lobby);
  const [players, setPlayers] = useState<any[]>([]);
  const [soloGame, setSoloGame] = useState(false);

  const host = isHost();
  const isInit = useRef<boolean>(false);

  useEffect(() => {
    // Prevent re-initialization during development mode (Strict Mode in React can call effects 2 times)
    if (isInit.current) return; // If the component has already been initialized, return

    // Mark the component as initialized to ensure initialization happens only once
    isInit.current = true; // This prevents the code from running on subsequent renders

    // Listen for a player joining the game
    onPlayerJoin((state) => {
      // Create joystick controls for the player with a "jump" button
      const controls = new Joystick(state, {
        type: "angular", // Define joystick type for angular movement
        buttons: [{ id: "jump", label: "jump" }], // Adding a jump button
      });

      // Construct a new player object containing both state and controls
      const newPlayer = { state, controls };
      if (host) {
        state.setState("dead", gameStage === "game");
        state.setState("startingPos", {
          x: randFloat(
            (-(NB_COLUMNS - 1) * HEX_X_SPACING) / 2,
            ((NB_COLUMNS - 1) * HEX_X_SPACING) / 2
          ),
          z: randFloat(
            (-(NB_ROWS - 1) * HEX_Z_SPACING) / 2,
            ((NB_ROWS - 1) * HEX_Z_SPACING) / 2
          ),
        });
      }
      // Update the players state by adding the new player
      setPlayers((players) => [...players, newPlayer]);

      // Setup onQuit listener: Remove the player from the state when they quit
      state.onQuit(() => {
        setPlayers(
          (players) => players.filter((p) => p.state.id !== state.id) // Filter out the quitting player
        );
      });
    });
  }, []); // Empty dependency array: Effect only runs once on component mount

  useEffect(() => {
    // Ensure the effect only runs if the current user is the host
    if (!host) return;

    // Do not trigger the effect if the game is still in the "lobby" stage
    if (gameStage === "lobby") return;

    // Set a timeout to decrement or increment the timer based on the game state
    const timeout = setTimeout(() => {
      // Adjust the timer depending on the game state: increase for "game", decrease for others
      let newTime = gameStage === "game" ? timer + 1 : timer - 1;

      // If the timer reaches 0, transition to the next game state
      if (newTime === 0) {
        // Retrieve the next stage from the NEXT_STAGE mapping based on the current gameStage
        const nextStage = NEXT_STAGE[gameStage];
        if (nextStage === "lobby" || nextStage === "countdown") {
          // RESET PLAYERS
          players.forEach((p) => {
            p.state.setState("dead", false);
            p.state.setState("pos", null);
            p.state.setState("rot", null);
          });
        }
        setGameState(nextStage, true);
        newTime = TIMER_STAGE[nextStage];
      } else {
        // CHECK GAME END
        if (gameStage === "game") {
          const playersAlive = players.filter((p) => !p.state.getState("dead"));
          if (playersAlive.length < (soloGame ? 1 : 2)) {
            setGameState("winner", true);
            setWinner(playersAlive[0]?.state.state.profile, true);
            newTime = TIMER_STAGE.winner;
          }
        }
      }

      // Update the timer with the new value
      setTimer(newTime, true);
    }, 1000); // Set this to run every second (1000ms)

    // Cleanup function to clear the timeout if the component is unmounted or dependencies change
    return () => clearTimeout(timeout);
  }, [host, timer, gameStage, soloGame]); // Dependencies: rerun the effect when any of these change

  const startGame = () => {
    setGameState("countdown");
    setTimer(TIMER_STAGE.countdown);
    setSoloGame(players.length === 1);
  };

  return (
    <GameStateContext.Provider
      value={{
        gameStage,
        timer,
        players,
        host,
        startGame,
        winner
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const gameState = useContext(GameStateContext);
  if (!gameState) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return gameState;
};
