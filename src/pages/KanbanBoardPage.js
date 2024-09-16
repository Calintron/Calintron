import React, { useState, useRef } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Select,
  FormControl,
  Checkbox,
  Card,
  CardContent,
  IconButton,
  Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './dashboard.css';

// Sample categories and their associated colors and subcategories
const categories = {
  Lunch: {
    Salad: { options: ['Caesar', 'Greek', 'Cobb'], color: '#64B5F6' },
    Sandwich: { options: ['Turkey', 'Ham', 'Veggie'], color: '#4CAF50' },
    Pasta: { options: ['Spaghetti', 'Fettuccine', 'Macaroni'], color: '#FFEB3B' },
  },
  Dinner: {
    Steak: { options: ['Ribeye', 'Sirloin', 'Filet Mignon'], color: '#F44336' },
    Pizza: { options: ['Margherita', 'Pepperoni', 'Veggie'], color: '#FF9800' },
    Sushi: { options: ['Salmon', 'Tuna', 'California Roll'], color: '#9C27B0' },
  },
  Snack: {
    Fruit: { options: ['Apple', 'Banana', 'Grapes'], color: '#E91E63' },
    Chips: { options: ['Potato', 'Tortilla', 'Pita'], color: '#00BCD4' },
    Cookies: { options: ['Chocolate Chip', 'Oatmeal', 'Peanut Butter'], color: '#FFC107' },
  },
};

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AccordionSection = React.forwardRef(({ mealType, expanded, onExpand, onCollapse, onDeleteAll, globalSearchTerm }, ref) => {
  const [rows, setRows] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  React.useImperativeHandle(ref, () => ({
    getData: () => rows.map(row => ({
      'Category': row.category.join(', '),
      ...row.days.reduce((acc, day, index) => ({ ...acc, [`Day ${daysOfWeek[index]}`]: day.join(', ') }), {}),
    })),
    deleteAll: () => {
      setRows([]);
      if (onDeleteAll) onDeleteAll();
    }
  }));

  // Add a new row
  const addRow = () => {
    setRows([...rows, { category: [], applyToAll: false, days: Array(daysOfWeek.length).fill([]) }]);
  };

  // Handle category change
  const handleCategoryChange = (index, event) => {
    const newRows = [...rows];
    const selectedCategories = event.target.value;
    newRows[index].category = selectedCategories;
    if (newRows[index].applyToAll) {
      newRows[index].days = Array(daysOfWeek.length).fill(selectedCategories.flatMap(cat => categories[mealType][cat]?.options || []));
    } else {
        newRows[index].days = newRows[index].days.map(day => {
            return day.reduce((acc, item) => (
              selectedCategories.includes(newRows[index].category.find(cat => categories[mealType][cat]?.options.includes(item))) ?
              acc.concat(categories[mealType]?.options || []) : acc
            ), []);
          });
    }
    setRows(newRows);
  };

  // Handle day change
  const handleDayChange = (index, dayIndex, event) => {
    const newRows = [...rows];
    newRows[index].days[dayIndex] = event.target.value;
    setRows(newRows);
  };

  // Handle apply to all days change
  const handleApplyAllChange = (index) => {
    const newRows = [...rows];
    newRows[index].applyToAll = !newRows[index].applyToAll;
    if (newRows[index].applyToAll) {
      newRows[index].days = Array(daysOfWeek.length).fill(newRows[index].category.flatMap(cat => categories[mealType][cat]?.options || []));
    } else {
      newRows[index].days = newRows[index].days.map(day => day.some(item => newRows[index].category.includes(categories[mealType].find(cat => categories[mealType][cat]?.options.includes(item)))) ? [] : day);
    }
    setRows(newRows);
  };

  // Handle delete row
  const handleDeleteRow = (index) => {
    setRows(prevRows => prevRows.filter((_, rowIndex) => rowIndex !== index));
  };
  

  // Filter rows based on global search term
  const filteredRows = rows.filter(row => {
    const categoryMatch = row.category.join(' ').toLowerCase().includes(globalSearchTerm.toLowerCase());
    const dayMatches = row.days.some(day => day.join(' ').toLowerCase().includes(globalSearchTerm.toLowerCase()));
    return categoryMatch || dayMatches;
  });

  // Limit dishes per category to 2
  const getCategoryOptions = (selectedCategories) => {
    return selectedCategories.flatMap(cat => categories[mealType][cat]?.options || []);
  };

  return (
    <Accordion expanded={expanded} onChange={() => (expanded ? onCollapse() : onExpand())}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{mealType}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow className='main-row'>
                <TableCell>
                  <Typography variant="body2">Apply for All Days</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">Category
                    <IconButton color="primary" onClick={addRow} style={{ marginLeft: 8 }}>
                      <AddIcon />
                    </IconButton>
                  </Typography>
                </TableCell>
                {daysOfWeek.map((day) => (
                  <TableCell key={day}>
                    <Typography variant="body2">{day}</Typography>
                  </TableCell>
                ))}
                <TableCell>
                  <Typography variant="body2">Actions</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {filteredRows.map((row, rowIndex) => (
    <TableRow className='row-content-td' key={rowIndex}>
      <TableCell style={{ verticalAlign: 'top', padding: '8px' }}>
        <Checkbox
          checked={row.applyToAll}
          onChange={() => handleApplyAllChange(rowIndex)}
        />
      </TableCell>
      <TableCell style={{ verticalAlign: 'top', padding: '8px' }}>
        <FormControl fullWidth>
          <Select className='select-box'
            multiple
            value={row.category}
            onChange={(event) => handleCategoryChange(rowIndex, event)}
            renderValue={(selected) => (
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {selected.map((value) => (
                  <div key={value} style={{ margin: 2, padding: 2, backgroundColor: '#E0E0E0', borderRadius: 4 }}>
                    {value}
                  </div>
                ))}
              </div>
            )}
          >
            <MenuItem value="">None</MenuItem>
            {Object.keys(categories[mealType]).map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {row.category.length > 0 && (
          <Card style={{ backgroundColor: '#FFFFFF', marginTop: 8, position: 'relative', border: `1px solid ${categories[mealType][row.category[0]]?.color || '#000'}`, borderRadius: 8 }}>
            <IconButton
              color="secondary"
              onClick={() => handleDeleteRow(rowIndex)}
              style={{ position: 'absolute', top: 4, right: 4 }}
            >
              <CloseIcon />
            </IconButton>
            <CardContent>
              <Typography variant="body2" style={{ color: categories[mealType][row.category[0]]?.color || '#000' }}>Categories: {row.category.join(', ')}</Typography>
              <Typography variant="body2">Food Subsets: {getCategoryOptions(row.category).join(', ')}</Typography>
            </CardContent>
          </Card>
        )}
      </TableCell>
      {daysOfWeek.map((day, dayIndex) => (
        <TableCell key={dayIndex} style={{ verticalAlign: 'top', padding: '8px', position: 'relative' }}>
          <FormControl fullWidth disabled={row.applyToAll}>
            <Select className='select-box'
              multiple
              value={row.days[dayIndex]}
              onChange={(event) => handleDayChange(rowIndex, dayIndex, event)}
              renderValue={(selected) => (
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {selected.map((value) => (
                    <div key={value} style={{ margin: 2, padding: 2, backgroundColor: '#E0E0E0', borderRadius: 4 }}>
                      {value}
                    </div>
                  ))}
                </div>
              )}
            >
              <MenuItem value="">None</MenuItem>
              {getCategoryOptions(row.category).map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {row.days[dayIndex].length > 0 && (
            <Card style={{ backgroundColor: '#FFFFFF', marginTop: 8, position: 'relative', border: `1px solid ${categories[mealType][row.category[0]]?.color || '#000'}`, borderRadius: 8 }}>
              <IconButton
                color="secondary"
                onClick={() => {
                  const newRows = [...rows];
                  newRows[rowIndex].days[dayIndex] = [];
                  setRows(newRows);
                }}
                style={{ position: 'absolute', top: 4, right: 4 }}
              >
                <CloseIcon />
              </IconButton>
              <CardContent>
                <Typography variant="body2" style={{ color: categories[mealType][row.category[0]]?.color || '#000' }}>Day: {day}</Typography>
                <Typography variant="body2">Food: {row.days[dayIndex].join(', ')}</Typography>
              </CardContent>
            </Card>
          )}
        </TableCell>
      ))}
      <TableCell style={{ verticalAlign: 'top', padding: '8px' }}>
        <IconButton color="secondary" onClick={() => handleDeleteRow(rowIndex)}>
          <CloseIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
});

const App = () => {
  const lunchRef = useRef(null);
  const dinnerRef = useRef(null);
  const snackRef = useRef(null);

  const [expanded, setExpanded] = useState({ Lunch: false, Dinner: false, Snack: false });
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  const handleExpandAll = () => {
    setExpanded({ Lunch: true, Dinner: true, Snack: true });
  };

  const handleCollapseAll = () => {
    setExpanded({ Lunch: false, Dinner: false, Snack: false });
  };

  const handleDeleteAllMenus = () => {
    if (lunchRef.current) lunchRef.current.deleteAll();
    if (dinnerRef.current) dinnerRef.current.deleteAll();
    if (snackRef.current) snackRef.current.deleteAll();
  };

  const handleExportAllToExcel = () => {
    const sheets = [
      { name: 'Lunch', data: lunchRef.current.getData() },
      { name: 'Dinner', data: dinnerRef.current.getData() },
      { name: 'Snack', data: snackRef.current.getData() }
    ];

    const workbook = XLSX.utils.book_new();

    sheets.forEach(sheet => {
      const ws = XLSX.utils.json_to_sheet(sheet.data, { header: ['Category', ...daysOfWeek.map(day => `Day ${day}`)] });
      XLSX.utils.book_append_sheet(workbook, ws, sheet.name);
    });

    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'menu.xlsx');
  };

  const handleSaveDraft = () => {
    // Implement save draft functionality
    console.log('Save as Draft');
  };

  const handlePublish = () => {
    // Implement publish functionality
    console.log('Publish');
  };

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          variant="outlined"
          placeholder="Search..."
          onChange={(event) => setGlobalSearchTerm(event.target.value)}
          style={{ width: '300px' }}
        />
        <Box className="button-section-header">
          <Button variant="contained" color="primary" onClick={handleExpandAll} style={{ marginLeft: 8 }}>
            Expand All
          </Button>
          <Button variant="contained" color="primary" onClick={handleCollapseAll} style={{ marginLeft: 8 }}>
            Collapse All
          </Button>
          <Button variant="contained" color="secondary" onClick={handleDeleteAllMenus} style={{ marginLeft: 8 }}>
            Delete All Menus
          </Button>
          <Button variant="contained" color="primary" onClick={handleExportAllToExcel} style={{ marginLeft: 8 }}>
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
      <AccordionSection ref={lunchRef} mealType="Lunch" expanded={expanded.Lunch} onExpand={() => setExpanded({ ...expanded, Lunch: true })} onCollapse={() => setExpanded({ ...expanded, Lunch: false })} onDeleteAll={() => handleDeleteAllMenus()} globalSearchTerm={globalSearchTerm} />
      <AccordionSection ref={dinnerRef} mealType="Dinner" expanded={expanded.Dinner} onExpand={() => setExpanded({ ...expanded, Dinner: true })} onCollapse={() => setExpanded({ ...expanded, Dinner: false })} onDeleteAll={() => handleDeleteAllMenus()} globalSearchTerm={globalSearchTerm} />
      <AccordionSection ref={snackRef} mealType="Snack" expanded={expanded.Snack} onExpand={() => setExpanded({ ...expanded, Snack: true })} onCollapse={() => setExpanded({ ...expanded, Snack: false })} onDeleteAll={() => handleDeleteAllMenus()} globalSearchTerm={globalSearchTerm} />
    </div>
  );
};

export default App;
