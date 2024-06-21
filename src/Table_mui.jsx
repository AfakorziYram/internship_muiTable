import React, { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel, Typography, Button, Box, Select, MenuItem, FormControl, InputLabel, Stack, Pagination, Skeleton,
} from '@mui/material';

const ReusableTable = ({
  columns,
  data,
  sortable = false,
  pagination = false,
  //rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 5,
  cellPadding = 'default',
  tableMargin = 'default',
  groupColor = 'lightgrey',
  rowColor = '#e040fb',
  header = null,
  onSort = null,
  onGroup = null,
  isFetching= false,
}) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(columns[0].field);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [groupBy, setGroupBy] = useState(null);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    if (onSort) onSort(property, isAsc ? 'desc' : 'asc');
  };

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleGroupByChange = (event) => {
    setGroupBy(event.target.value);
    if (onGroup) onGroup(event.target.value);
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => (b[orderBy] < a[orderBy] ? -1 : b[orderBy] > a[orderBy] ? 1 : 0)
      : (a, b) => (a[orderBy] < b[orderBy] ? -1 : a[orderBy] > b[orderBy] ? 1 : 0);
  };

  const sortedData = useMemo(() => {
    if (!sortable) return data;
    return [...data].sort(getComparator(order, orderBy));
  }, [data, order, orderBy, sortable]);

  const groupedData = useMemo(() => {
    if (!groupBy) return [{ group: null, items: sortedData }];
    const groups = {};
    sortedData.forEach(item => {
      const groupValue = item[groupBy];
      if (!groups[groupValue]) groups[groupValue] = [];
      groups[groupValue].push(item);
    });
    return Object.entries(groups).map(([group, items]) => ({ group, items }));
  }, [sortedData, groupBy]);

  const paginatedData = useMemo(() => {
    if (!pagination) return groupedData;
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return groupedData.reduce((acc, groupData) => {
      const paginatedItems = groupData.items.slice(start, end);
      if (paginatedItems.length) {
        acc.push({ ...groupData, items: paginatedItems });
      }
      return acc;
    }, []);
  }, [groupedData, page, rowsPerPage, pagination]);

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 440, margin: tableMargin }}>
      {header && (
        <Box sx={{ 
          padding: 2, 
          backgroundColor: 'background.paper', 
          borderBottom: 1, 
          borderColor: 'divider', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="h6">{header}</Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            '& > *': { margin: 1 } 
          }}>
            {sortable && (
              <>
                {columns.map(column => (
                  <Button
                    key={column.field}
                    variant="contained"
                    onClick={() => handleRequestSort(column.field)}
                  >
                    Sort by {column.headerName}
                  </Button>
                ))}
              </>
            )}
            <FormControl sx={{ minWidth: 120, marginLeft: 2, maxWidth: 200 }}>
              <InputLabel
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                Group By
              </InputLabel>
              <Select
                value={groupBy}
                onChange={handleGroupByChange}
                label="Group By"
              >
                <MenuItem value={null}>None</MenuItem>
                {columns.map(option => (
                  <MenuItem key={option.field} value={option.field}>
                    {option.headerName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.field}
                sortDirection={orderBy === column.field ? order : false}
                sx={{ 
                  position: 'sticky', 
                  top: 0, 
                  backgroundColor: 'background.paper', 
                  zIndex: 1, 
                  padding: cellPadding, 
                  background:"#e91e63"
                }}
              >
                {sortable ? (
                  <TableSortLabel
                    active={orderBy === column.field}
                    direction={orderBy === column.field ? order : 'asc'}
                    onClick={() => handleRequestSort(column.field)}
                  >
                    {column.headerName}
                  </TableSortLabel>
                ) : (
                  column.headerName
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          { isFetching ?  (Array.from(new Array(rowsPerPage)).map((_, index) => (
              <TableRow key={index}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex} sx={{ padding: cellPadding }}>
                    <Skeleton variant="text" />
                  </TableCell>
                ))}
              </TableRow>
            ))) : (paginatedData.map((groupData, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {groupBy && (
                <TableRow sx={{ backgroundColor: groupColor }}>
                  <TableCell colSpan={columns.length} sx={{ padding: cellPadding }}>
                    {groupData.group}
                  </TableCell>
                </TableRow>
              )}
              {groupData.items.map((row, rowIndex) => (
                <TableRow key={rowIndex} sx={{ backgroundColor: rowColor }}>
                  {columns.map((column) => (
                    <TableCell key={column.field} sx={{ padding: cellPadding }}>
                      {row[column.field]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </React.Fragment>
          )))}
        </TableBody>
      </Table>
      {pagination && (
        <Stack spacing={2} sx={{ marginTop: 2, marginBottom: 2, alignItems: 'center' }}>
          <Pagination
            count={Math.ceil(data.length / rowsPerPage)}
            page={page}
            onChange={handleChangePage}
            color="primary"
          />
        </Stack>
      )}
    </TableContainer>
  );
};

export default ReusableTable;
