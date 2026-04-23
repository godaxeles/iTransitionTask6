import { BrowserRouter, Route, Routes } from "react-router-dom";
import { EntryRoute } from "./routes/EntryRoute";
import { DashboardRoute } from "./routes/DashboardRoute";
import { WorkspaceRoute } from "./routes/WorkspaceRoute";
import { NameGuard } from "./routes/NameGuard";
import { ConfirmRoot } from "./components/ConfirmRoot";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EntryRoute />} />
        <Route
          path="/boards"
          element={
            <NameGuard>
              <DashboardRoute />
            </NameGuard>
          }
        />
        <Route
          path="/boards/:boardId"
          element={
            <NameGuard>
              <WorkspaceRoute />
            </NameGuard>
          }
        />
        <Route path="*" element={<EntryRoute />} />
      </Routes>
      <ConfirmRoot />
    </BrowserRouter>
  );
}
