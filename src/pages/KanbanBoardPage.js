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
  Box,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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

const AccordionSection = React.forwardRef(({ mealType, expanded, onExpand, onCollapse, onDeleteAll, globalSearchTerm }, ref) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const fetchAndSetData = () => {
    setLoading(true);
    fetch('lunchData.json')
      .then(response => response.json())
      .then(data => setRows(data))
      .catch(error => console.error('Error fetching data:', error))
      .finally(() => setLoading(false));
  };

  const addRow = () => {
    setRows([...rows, { category: [], applyToAll: false, days: Array(daysOfWeek.length).fill([]) }]);
  };

  const handleCategoryChange = (index, event) => {
    const newRows = [...rows];
    const selectedCategories = event.target.value;
    newRows[index].category = selectedCategories;
    setRows(newRows);
  };

  const handleApplyAllChange = (index) => {
    const newRows = [...rows];
    newRows[index].applyToAll = !newRows[index].applyToAll;
    setRows(newRows);
  };

  const handleDeleteRow = (index) => {
    setRows(prevRows => prevRows.filter((_, rowIndex) => rowIndex !== index));
  };

  const filteredRows = rows.filter(row => {
    const searchTerm = globalSearchTerm || '';
    const categoryMatch = row.category.join(' ').toLowerCase().includes(searchTerm.toLowerCase());
    const dayMatches = row.days.some(day => day.join(' ').toLowerCase().includes(searchTerm.toLowerCase()));
    return categoryMatch || dayMatches;
  });

  const handleDayChange = (index, dayIndex, event) => {
    const newRows = [...rows];
    newRows[index].days[dayIndex] = event.target.value;
    setRows(newRows);
  };

  const getCategoryOptions = (selectedCategories) => {
    return selectedCategories.flatMap(cat => categories[mealType][cat]?.options || []);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedRows = Array.from(rows);
    const [removed] = reorderedRows.splice(result.source.index, 1);
    reorderedRows.splice(result.destination.index, 0, removed);

    setRows(reorderedRows);
  };

  return (
    <Accordion expanded={expanded} onChange={() => (expanded ? onCollapse() : onExpand())}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{mealType}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box mb={2}>
          <Button variant="contained" color="primary" onClick={fetchAndSetData} disabled={loading}>
            Fetch Data
          </Button>
          {loading && <CircularProgress style={{ marginLeft: '50%' }} />}
        </Box>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
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
                        <Draggable key={rowIndex} draggableId={`draggable-${rowIndex}`} index={rowIndex}>
                          {(provided) => (
                            <TableRow
                              className='row-content-td'
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
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
                                      <Typography variant="body2" style={{ color: categories[mealType][row.category[0]]?.color || '#000' }}>
                                        Categories: {row.category.join(', ')}
                                      </Typography>
                                      <Typography variant="body2">
                                        Food Subsets: {getCategoryOptions(row.category).join(', ')}
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                )}
                              </TableCell>
                              {daysOfWeek.map((day, dayIndex) => (
                                <TableCell key={dayIndex} style={{ verticalAlign: 'top', padding: '8px', position: 'relative' }}>
                                  <FormControl fullWidth disabled={row.applyToAll}>
                                    <Select className='select-box'
                                      multiple
                                      value={row.days[dayIndex] || []}
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
                                  {row.days[dayIndex]?.length > 0 && (
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
                                        <Typography variant="body2">
                                          Selected items: {row.days[dayIndex].join(', ')}
                                        </Typography>
                                      </CardContent>
                                    </Card>
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </AccordionDetails>
    </Accordion>
  );
});

export default AccordionSection;
