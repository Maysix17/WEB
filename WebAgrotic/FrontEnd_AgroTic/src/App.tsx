import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import { PermissionProvider } from "./contexts/PermissionContext";
import PermissionsSocket from "./components/PermissionsSocket";
import PermissionErrorBoundary from "./components/PermissionErrorBoundary";

function App() {
  return (
    <BrowserRouter>
      <PermissionProvider>
        <PermissionsSocket />
        <PermissionErrorBoundary>
          <AppRouter />
        </PermissionErrorBoundary>
      </PermissionProvider>
    </BrowserRouter>
  );
}

export default App;
