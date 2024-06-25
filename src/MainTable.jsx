


import React, { useState, useMemo } from 'react';
import {
  Box, Typography, TableContainer, TableBody, TableCell, TableHead, Table, TableRow, Paper,
  TableSortLabel, Pagination, Stack, Select, MenuItem, FormControl, InputLabel, Skeleton
} from "@mui/material";
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';

const MainTable = ({ columns, data, sortable = true, pagination = true, defaultRowsPerPage = 30, isLoading = false, header=null }) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [groupBy, setGroupBy] = useState(null);
  const [sortBy, setSortBy] = useState("");

  const handleRequestSort = (property) => {
    if (property === "") {
      setOrderBy(null);
    } else {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    }
    setPage(1);
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
    setPage(1);
  };

  const handleSortByChange = (event) => {
    const value = event.target.value;
    setSortBy(value);
    handleRequestSort(value);
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => (b[orderBy] < a[orderBy] ? -1 : b[orderBy] > a[orderBy] ? 1 : 0)
      : (a, b) => (a[orderBy] < b[orderBy] ? -1 : a[orderBy] > b[orderBy] ? 1 : 0);
  };

  const sortedData = useMemo(() => {
    if (!sortable || !orderBy) return data;
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

  const renderSkeleton = () => (
    Array.from({ length: rowsPerPage }).map((_, index) => (
      <TableRow key={index}>
        {columns.map((column) => (
          <TableCell key={column.field}>
            <Skeleton variant="text" />
          </TableCell>
        ))}
      </TableRow>
    ))
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{header}</Typography>
        <Box sx={{ display: 'flex' }}>
          <FormControl variant="standard" size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Group By</InputLabel>
            <Select value={groupBy} onChange={handleGroupByChange} label="Group By">
              <MenuItem value=""><em>None</em></MenuItem>
              {columns.map((column) => (
                <MenuItem key={column.field} value={column.field}>{column.headerName}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="standard" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} onChange={handleSortByChange} label="Sort By">
              <MenuItem value=""><em>None</em></MenuItem>
              {columns.map((column) => (
                <MenuItem key={column.field} value={column.field}>{column.headerName}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      <TableContainer component={Paper} sx={{ flex: 1, width: '100%', overflow: 'hidden' }}>
        <Box sx={{ maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.field}
                    sortDirection={orderBy === column.field ? order : false}
                  >
                    {sortable ? (
                      <TableSortLabel
                        active={orderBy === column.field}
                        direction={orderBy === column.field ? order : 'asc'}
                        onClick={() => handleRequestSort(column.field)}
                      >
                        {column.headerName}
                        {orderBy === column.field ? (
                          order === 'asc' ? <ArrowDropUp fontSize="small" /> : <ArrowDropDown fontSize="small" />
                        ) : null}
                      </TableSortLabel>
                    ) : (
                      column.headerName
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? renderSkeleton() : paginatedData.map((groupData, groupIndex) => (
                <React.Fragment key={groupIndex}>
                  {groupBy && (
                    <TableRow>
                      <TableCell colSpan={columns.length}>{groupData.group}</TableCell>
                    </TableRow>
                  )}
                  {groupData.items.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((column) => (
                        <TableCell key={column.field}>{row[column.field]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </Box>
      </TableContainer>
      {pagination && (
        <Stack spacing={2} sx={{ p: 2 }}>
          <Pagination
            count={Math.ceil(data.length / rowsPerPage)}
            page={page}
            onChange={handleChangePage}
          />
        </Stack>
      )}
    </Box>
  );
};

export default MainTable;


