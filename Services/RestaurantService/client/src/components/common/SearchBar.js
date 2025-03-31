import React from 'react';
import { InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => {
    return (
        <TextField
            fullWidth
            variant="outlined"
            size="medium"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon color="action" />
                    </InputAdornment>
                ),
            }}
            sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                }
            }}
        />
    );
};

export default SearchBar;