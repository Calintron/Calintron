import React, { useState } from 'react';
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

const AccordionSection = ({ mealType }) => {
  const [rows, setRows] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Add a new row
  const addRow = () => {
    setRows([...rows, { category: '', applyToAll: false, days: Array(daysOfWeek.length).fill('') }]);
  };

  // Handle category change
  const handleCategoryChange = (index, event) => {
    const newRows = [...rows];
    const selectedCategory = event.target.value;
    newRows[index].category = selectedCategory;
    if (newRows[index].applyToAll) {
      newRows[index].days = Array(daysOfWeek.length).fill(selectedCategory);
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
      newRows[index].days = Array(daysOfWeek.length).fill(newRows[index].category || '');
    } else {
      newRows[index].days = Array(daysOfWeek.length).fill('');
    }
    setRows(newRows);
  };

  // Handle delete row
  const handleDeleteRow = (index) => {
    const newRows = rows.filter((_, rowIndex) => rowIndex !== index);
    setRows(newRows);
  };

  // Handle delete all rows
  const handleDeleteAll = () => {
    setRows([]);
  };

  // Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      rows.map(row => ({
        'Category': row.category,
        ...row.days.reduce((acc, day, index) => ({ ...acc, [`Day ${daysOfWeek[index]}`]: day }), {}),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, mealType);
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${mealType}.xlsx`);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  // Filter rows based on search term
  const filteredRows = rows.filter(row => {
    const categoryMatch = row.category.toLowerCase().includes(searchTerm);
    const dayMatches = row.days.some(day => day.toLowerCase().includes(searchTerm));
    return categoryMatch || dayMatches;
  });

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{mealType}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TextField
          variant="outlined"
          placeholder="Search..."
          onChange={handleSearchChange}
          style={{ marginBottom: 16, width: '100%' }}
        />
        <Button variant="contained" color="secondary" onClick={handleDeleteAll} style={{ marginBottom: 16 }}>
          Delete All
        </Button>
        <Button  sx={{ marginLeft: 2, marginRight: 2 }} variant="contained" color="primary" onClick={exportToExcel} style={{ marginBottom: 16, marginRight: 16 }}>
          Export to Excel
        </Button>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="body2">Apply for All Days</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">Category<span> <IconButton color="primary" onClick={addRow} style={{ marginLeft: 8 }}>
                    <AddIcon />
                  </IconButton></span></Typography>
                 
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
                <TableRow key={rowIndex}>
                  <TableCell>
                    <Checkbox
                      checked={row.applyToAll}
                      onChange={() => handleApplyAllChange(rowIndex)}
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth>
                      <Select
                        value={row.category}
                        onChange={(event) => handleCategoryChange(rowIndex, event)}
                      >
                        <MenuItem value="">Select Category</MenuItem>
                        {Object.keys(categories[mealType]).map((cat) => (
                          <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {row.category && (
                      <Card style={{ backgroundColor: categories[mealType][row.category]?.color || '#FFFFFF', marginTop: 8 }}>
                        <CardContent>
                          <Typography variant="body2">Category: {row.category}</Typography>
                          {editingIndex === rowIndex ? (
                            <TextField
                              value={row.category}
                              onChange={(event) => handleCategoryChange(rowIndex, event)}
                              fullWidth
                              variant="outlined"
                              style={{ marginBottom: 4 }}
                            />
                          ) : (
                            <Typography variant="body2">Food Subsets: {row.category}</Typography>
                          )}
                          <div style={{ marginTop: 8 }}>
                            <IconButton
                              color="primary"
                              onClick={() => {
                                setEditingIndex(editingIndex === rowIndex ? null : rowIndex);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton color="secondary" onClick={() => handleDeleteRow(rowIndex)}>
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TableCell>
                  {daysOfWeek.map((day, dayIndex) => (
                    <TableCell key={dayIndex}>
                      <FormControl fullWidth disabled={row.applyToAll}>
                        <Select
                          value={row.days[dayIndex]}
                          onChange={(event) => handleDayChange(rowIndex, dayIndex, event)}
                        >
                          <MenuItem value="">Select Food</MenuItem>
                          {row.category && categories[mealType][row.category]?.options?.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {row.days[dayIndex] && (
                        <Card style={{ backgroundColor: categories[mealType][row.category]?.color || '#FFFFFF', marginTop: 8 }}>
                          <CardContent>
                            <Typography variant="body2">Day: {day}</Typography>
                            <Typography variant="body2">Food: {row.days[dayIndex]}</Typography>
                            <div style={{ marginTop: 8 }}>
                              <IconButton
                                color="primary"
                                onClick={() => {
                                  // Handle Edit logic if needed
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                color="secondary"
                                onClick={() => {
                                  // Handle Delete logic
                                  const newRows = [...rows];
                                  newRows[rowIndex].days[dayIndex] = '';
                                  setRows(newRows);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <IconButton color="secondary" onClick={() => handleDeleteRow(rowIndex)}>
                      <DeleteIcon />
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
};

const App = () => {
  return (
    <div>
      <Button variant="contained" color="primary" onClick={() => { /* Implement global export functionality here if needed */ }} style={{ marginBottom: 16 }}>
        Export All to Excel
      </Button>
      <AccordionSection mealType="Lunch" />
      <AccordionSection mealType="Dinner" />
      <AccordionSection mealType="Snack" />
    </div>
  );
};

export default App;
