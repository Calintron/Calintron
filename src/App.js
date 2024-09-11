import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/layout';
import KanbanBoardPage from './pages/KanbanBoardPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* <Route path="/" element={<HomePage />} /> */}
          <Route path="/board" element={<KanbanBoardPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
