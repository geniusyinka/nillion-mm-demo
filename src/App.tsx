import { LogProvider } from "./context/LogContext";
import { NillionProvider } from "./context/NillionContext";
import { NotesScreen } from "./screens/NotesScreen";

function App() {
  return (
    <LogProvider>
      <NillionProvider>
        <NotesScreen />
      </NillionProvider>
    </LogProvider>
  );
}

export default App;
