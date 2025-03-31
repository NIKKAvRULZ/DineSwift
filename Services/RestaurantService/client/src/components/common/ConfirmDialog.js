import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    useTheme
} from '@mui/material';

export const ConfirmDialog = ({
    open,
    title,
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    severity = 'error'
}) => {
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            PaperProps={{
                sx: {
                    borderRadius: theme.shape.borderRadius * 1.5,
                    minWidth: '320px'
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button 
                    onClick={onCancel}
                    variant="outlined"
                    color="inherit"
                    sx={{ 
                        minWidth: '88px',
                        borderRadius: theme.shape.borderRadius
                    }}
                >
                    {cancelLabel}
                </Button>
                <Button 
                    onClick={onConfirm}
                    variant="contained"
                    color={severity}
                    autoFocus
                    sx={{ 
                        minWidth: '88px',
                        borderRadius: theme.shape.borderRadius
                    }}
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;