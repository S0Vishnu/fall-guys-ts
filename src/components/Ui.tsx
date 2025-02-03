import { useAudioManager } from "../hooks/useAudioManager";
import { useGameState } from "../hooks/useGameState";

export const UI = () => {
  const { audioEnabled, setAudioEnabled } = useAudioManager();

  const { timer, startGame, host, gameStage, players } = useGameState();
  console.log(players);
  return (
    <main
      style={{
        background: gameStage === "lobby" ? "#23232365" : "transparent", // Common background
        ...(gameStage === "lobby" && {
          // Apply these styles only for 'lobby' stage
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: "100vw",
        }),
      }}
    >
      {timer && timer >= 0 && (
        <h2 style={{ position: "fixed", top: "0px", left: "calc(50% - 10px)" }}>
          {timer}
        </h2>
      )}
      {gameStage === "lobby" && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              className="plaers"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {players?.map((player) => (
                <div
                  key={player.state.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                  }}
                >
                  <img
                    src={player.state?.state.profile?.photo}
                    style={{ height: "34px" }}
                  />
                  <p>{player.state?.state.profile?.name}</p>
                </div>
              ))}
            </div>
            {host ? (
              <button onClick={startGame}>Start</button>
            ) : (
              <p>Waiting for the host to start the game...</p>
            )}
          </div>
        </div>
      )}
      <button
        onClick={() => setAudioEnabled(!audioEnabled)}
        style={{ position: "fixed", top: "50%", right: "20px" }}
      >
        {audioEnabled ? "on" : "off"}
      </button>
    </main>
  );
};
