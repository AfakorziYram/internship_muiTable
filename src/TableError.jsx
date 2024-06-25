


import { Box, Typography, Button, Card,CardActions,CardContent } from '@mui/material';

const TableError = ({ title, errorMessage, onRetry }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' , width:'100%',}}>
      <Card sx={{backgroundColor:"pink"}}> 
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',}}>
          <Typography variant="h6" gutterBottom color='red' sx={{ alignItems: 'center', justifyContent: 'center'}}>{title}</Typography>
          <Typography variant="body1" align="center" gutterBottom color='red'>{errorMessage}</Typography>
        </CardContent>
        <CardActions sx={{alignItems: 'center', justifyContent: 'center'}}>
          <Button variant="outlined" color="primary" sx={{borderRadius:'4rem',}}onClick={onRetry}>Retry</Button>
        </CardActions>
      </Card>
    </Box>
    
      
    
  );
};

export default TableError;

