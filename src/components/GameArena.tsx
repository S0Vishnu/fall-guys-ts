import { useState } from "react";
import { Hexagon } from "./Hexagon";
import { RPC } from "playroomkit";

// Constants for layout configuration
export const HEX_X_SPACING = 2.25; // Horizontal spacing between hexagons
export const HEX_Z_SPACING = 1.95; // Vertical spacing between hexagons
export const NB_ROWS = 7; // Number of rows of hexagons
export const NB_COLUMNS = 7; // Number of columns of hexagons
export const FLOOR_HEIGHT = 10; // Height of each floor layer
export const FLOORS = [
  { color: "red" },
  { color: "blue" },
  { color: "green" },
  { color: "yellow" },
  { color: "purple" },
];

// Define the type for hexagon hit states (track which hexagons are hit)
interface HexagonHitState {
  [key: string]: boolean;
}

export default function GameArena() {
  // State to track the hit status of hexagons
  const [hexagonHit, setHexagonHit] = useState<HexagonHitState>({});

  // Register a callback for the "hexagonHit" RPC event
  RPC.register("hexagonHit", async (data: { hexagonKey: string }) => {
    // Update the state to mark the hexagon as hit
    setHexagonHit((prev) => ({
      ...prev,
      [data.hexagonKey]: true,
    }));

    // Return a resolved Promise to satisfy the RPCCallback type requirement
    return Promise.resolve();
  });

  return (
    <group
      position-x={-((NB_COLUMNS - 1) / 2) * HEX_X_SPACING} // Center hexagons horizontally
      position-z={-((NB_ROWS - 1) / 2) * HEX_Z_SPACING} // Center hexagons vertically
    >
      {/* Render each floor layer */}
      {FLOORS.map((floor, floorIndex) => (
        <group key={floorIndex} position-y={floorIndex * -FLOOR_HEIGHT}>
          {/* Render each row of hexagons */}
          {[...Array(NB_ROWS)].map((_, rowIndex) => (
            <group
              key={rowIndex}
              position-z={rowIndex * HEX_Z_SPACING} // Space rows vertically
              position-x={rowIndex % 2 ? HEX_X_SPACING / 2 : 0} // Offset every other row to create staggered hexagons
            >
              {/* Render each hexagon in the current row */}
              {[...Array(NB_COLUMNS)].map((_, columnIndex) => {
                const hexagonKey = `${floorIndex}-${rowIndex}-${columnIndex}`; // Unique key for each hexagon
                return (
                  <Hexagon
                    key={columnIndex}
                    position-x={columnIndex * HEX_X_SPACING} // Space hexagons horizontally in the row
                    color={floor.color} // Set the hexagon color based on the floor
                    onHit={() => {
                      // When a hexagon is hit, update the hit state and trigger RPC call
                      setHexagonHit((prev) => ({
                        ...prev,
                        [hexagonKey]: true,
                      }));
                      RPC.call("hexagonHit", { hexagonKey }, RPC.Mode.ALL); // Inform all clients about the hit
                    }}
                    hit={hexagonHit[hexagonKey] || false} // Pass hit state for the current hexagon
                  />
                );
              })}
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}
