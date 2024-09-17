import React, { useRef, useState,useEffect } from 'react';
import AccordionSection from '../src/pages/KanbanBoardPage';
import { Container, Box, TextField, Button } from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const App = () => {
  const lunchRef = useRef(null);
  const dinnerRef = useRef(null);
  const snackRef = useRef(null);

  const [expandedSection, setExpandedSection] = useState(null);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  const handleExpandAll = () => {
    setExpandedSection('All');
  };

  const handleCollapseAll = () => {
    setExpandedSection(null);
  };

  const handleExportAllToExcel = () => {
    const sheets = [
      { name: 'Lunch', data: lunchRef.current?.getData() || [] },
      { name: 'Dinner', data: dinnerRef.current?.getData() || [] },
      { name: 'Snack', data: snackRef.current?.getData() || [] }
    ];

    const workbook = XLSX.utils.book_new();

    sheets.forEach(sheet => {
      if (sheet.data.length > 0) {
        const ws = XLSX.utils.json_to_sheet(sheet.data, { header: ['Category', ...daysOfWeek.map(day => `Day ${day}`)] });
        XLSX.utils.book_append_sheet(workbook, ws, sheet.name);
      }
    });

    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'menu.xlsx');
  };

  const handleSaveDraft = () => {
    const data = {
      lunch: lunchRef.current?.getData() || [],
      dinner: dinnerRef.current?.getData() || [],
      snack: snackRef.current?.getData() || [],
    };
  
    localStorage.setItem('draftData', JSON.stringify(data));
    console.log('Saved as Draft');
  };
  

  const handlePublish = () => {
    // Implement publish functionality
    console.log('Publish');
  };

  const isExpanded = (section) => expandedSection === 'All' || expandedSection === section;

  return (
    <Container>
      <Box mb={2} display="flex" alignItems="center">
        <TextField
          label="Search"
          variant="outlined"
          value={globalSearchTerm}
          onChange={(e) => setGlobalSearchTerm(e.target.value)}
          style={{ flexGrow: 1 }}
        />
        <Box ml={2}>
          <Button variant="contained" color="primary" onClick={handleExpandAll}>
            Expand All
          </Button>
          <Button variant="contained" color="primary" onClick={handleCollapseAll} style={{ marginLeft: 8 }}>
            Collapse All
          </Button>
          <Button variant="contained" color="secondary" onClick={handleExportAllToExcel} style={{ marginLeft: 8 }}>
            Export All to Excel
          </Button>
          <Button variant="contained" color="info" onClick={handleSaveDraft} style={{ marginLeft: 8 }}>
            Save as Draft
          </Button>
          <Button variant="contained" color="success" onClick={handlePublish} style={{ marginLeft: 8 }}>
            Publish
          </Button>
        </Box>
      </Box>
      <AccordionSection
        ref={lunchRef}
        mealType="Lunch"
        expanded={isExpanded('Lunch')}
        onExpand={() => setExpandedSection('Lunch')}
        onCollapse={() => setExpandedSection(null)}
        globalSearchTerm={globalSearchTerm}
      />
      <AccordionSection
        ref={dinnerRef}
        mealType="Dinner"
        expanded={isExpanded('Dinner')}
        onExpand={() => setExpandedSection('Dinner')}
        onCollapse={() => setExpandedSection(null)}
        globalSearchTerm={globalSearchTerm}
      />
      <AccordionSection
        ref={snackRef}
        mealType="Snack"
        expanded={isExpanded('Snack')}
        onExpand={() => setExpandedSection('Snack')}
        onCollapse={() => setExpandedSection(null)}
        globalSearchTerm={globalSearchTerm}
      />
    </Container>
  );
};

export default App;
