// App.js
import React from 'react';
import ReactDOM from 'react-dom';
import Board from '@asseinfo/react-kanban';
import '@asseinfo/react-kanban/dist/styles.css';
import Sidebar from './Sidebar'; // Import the Sidebar component
import Navbar from './Navbar';   // Import the Navbar component

const board = {
  columns: [
    {
      id: 1,
      title: "DishCategory",
      cards: [
        { id: 1, title: "Card title 1", description: "Card content" },
        { id: 2, title: "Card title 2", description: "Card content" },
        { id: 3, title: "Card title 3", description: "Card content" }
      ]
    },
    {
      id: 2,
      title: "Apply for all days",
      cards: [{ id: 9, title: "Card title 9", description: "Card content" }]
    },
    {
      id: 3,
      title: "Mon",
      cards: [
        { id: 10, title: "Card title 10", description: "Card content" },
        { id: 11, title: "Card title 11", description: "Card content" }
      ]
    },
    {
      id: 4,
      title: "Tue",
      cards: [
        { id: 12, title: "Card title 12", description: "Card content" },
        { id: 13, title: "Card title 13", description: "Card content" }
      ]
    }
  ]
};

function UncontrolledBoard() {
  return (
    <Board
      allowRemoveLane
      allowRenameColumn
      allowRemoveCard
      onLaneRemove={console.log}
      onCardRemove={console.log}
      onLaneRename={console.log}
      initialBoard={board}
      allowAddCard={{ on: "top" }}
      onNewCardConfirm={(draftCard) => ({
        id: new Date().getTime(),
        ...draftCard
      })}
      onCardNew={console.log}
    />
  );
}

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ marginLeft: '119px', padding: '20px', width: 'calc(100% - 70px)' }}>
          <h4>Initiate Menu plan</h4>
          <UncontrolledBoard />
        </main>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
