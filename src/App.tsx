import { useState } from 'react'
import './App.css'

function App() {
  const [logs] = useState<string[]>(['Application initialized. Ready.']);

  return (
    <main>
      <h1>secretvault-ts Demo</h1>
      <div className="grid-container">
        <section className="panel controls-panel">
          <h2>Controls</h2>
          <div className="button-group">
            <h3>System</h3>
            <button disabled>Get Cluster Info</button>
          </div>
          <div className="button-group">
            <h3>Builder</h3>
            <button disabled>Init Builder Client</button>
            <button disabled>Register Builder</button>
            <button disabled>Read Profile</button>
          </div>
          <div className="button-group">
            <h3>Collection</h3>
            <button disabled>Create Collection</button>
            <button disabled>Read Collection</button>
          </div>
        </section>
        <section className="panel log-panel">
          <h2>Logs</h2>
          <pre>
            {logs.join('\n')}
          </pre>
        </section>
      </div>
    </main>
  );
}

export default App
