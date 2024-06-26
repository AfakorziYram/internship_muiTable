import React, { useState, useMemo } from 'react';
import {
  Box, Typography, TableContainer, TableBody, TableCell, TableHead, Table, TableRow, Paper,
  TableSortLabel, Pagination, Stack, Skeleton
} from "@mui/material";
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';

const SideTable = ({ columns, data, sortable = true, pagination = true, defaultRowsPerPage = 30, isLoading = false , header=null}) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [groupBy, setGroupBy] = useState(null);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
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
    <Box sx={{ display: 'flex', flexDirection: 'column', width: 350, height: '100vh', overflowY: 'auto', borderRight: 1, borderColor: 'divider' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center',height:'8rem',maxHeight:'8rem' }}>
        <Typography variant="h6">{header}</Typography>
      </Box>
      <TableContainer component={Paper}>
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

export default SideTable;
