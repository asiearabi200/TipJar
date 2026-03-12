import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import TipPage from "./pages/TipPage";
import DashboardPage from "./pages/DashboardPage";
import LeaderboardPage from "./pages/LeaderboardPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/tip/:username" element={<TipPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/leaderboard/:username" element={<LeaderboardPage />} />
      </Routes>
    </Layout>
  );
}
