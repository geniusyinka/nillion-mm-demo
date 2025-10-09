import { MainLayout } from "./components/layouts/MainLayout";
import { LogProvider } from "./context/LogContext";
import { NillionProvider } from "./context/NillionContext";

function App() {
  return (
    <LogProvider>
      <NillionProvider>
        <MainLayout />
      </NillionProvider>
    </LogProvider>
  );
}

export default App;
