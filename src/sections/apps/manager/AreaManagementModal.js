import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// material-ui
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  Alert,
  Checkbox,
  ListItemText,
  Chip,
  Divider
} from '@mui/material';

// ==============================|| AREA MANAGEMENT MODAL ||============================== //

const AreaManagementModal = ({ open, modalToggler, manager, provinces, allProvinces, onSave }) => {
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (provinces) {
      setSelectedProvinces(provinces);
    }
  }, [provinces]);

  const handleChange = (event) => {
    const {
      target: { value }
    } = event;
    setSelectedProvinces(typeof value === 'string' ? value.split(',') : value);
    setError(null);
  };

  const handleSave = () => {
    if (selectedProvinces.length === 0) {
      setError('Vui lòng chọn ít nhất một vùng quản lý');
      return;
    }
    onSave(selectedProvinces);
  };

  const handleCancel = () => {
    modalToggler(false);
  };

  const handleRemoveProvince = (provinceCode) => {
    setSelectedProvinces(selectedProvinces.filter((code) => code !== provinceCode));
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle>
        <Stack spacing={1}>
          <Typography variant="h4" sx={{ color: 'primary.main' }}>
            Quản lý vùng
          </Typography>
          {manager && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1" color="text.secondary">
                Quản lý:
              </Typography>
              <Typography variant="subtitle1" fontWeight="medium">
                {manager.fullName}
              </Typography>
            </Stack>
          )}
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 1
              }}
            >
              {error}
            </Alert>
          )}
          
          <FormControl fullWidth>
            <InputLabel id="provinces-label">Vùng quản lý</InputLabel>
            <Select
              labelId="provinces-label"
              id="provinces-select"
              multiple
              value={selectedProvinces}
              onChange={handleChange}
              label="Vùng quản lý"
              sx={{
                '& .MuiSelect-select': {
                  minHeight: 100,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.5,
                  alignItems: 'flex-start',
                  alignContent: 'flex-start'
                }
              }}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selected.map((code) => {
                    const province = allProvinces?.find((p) => p.code === code);
                    return (
                      <Chip
                        key={code}
                        label={province?.fullName || `Province ${code}`}
                        onDelete={() => handleRemoveProvince(code)}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    );
                  })}
                </Box>
              )}
            >
              {allProvinces?.map((province) => (
                <MenuItem 
                  key={province.code} 
                  value={province.code}
                  sx={{
                    borderRadius: 1,
                    my: 0.5,
                    mx: 1,
                    width: 'calc(100% - 16px)'
                  }}
                >
                  <Checkbox 
                    checked={selectedProvinces.indexOf(province.code) > -1}
                    sx={{ 
                      color: 'primary.main',
                      '&.Mui-checked': {
                        color: 'primary.main'
                      }
                    }}
                  />
                  <ListItemText 
                    primary={province.fullName}
                    primaryTypographyProps={{
                      sx: { fontWeight: selectedProvinces.indexOf(province.code) > -1 ? 500 : 400 }
                    }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ display: 'block', mt: 1, ml: 1 }}
          >
            * Chọn các vùng quản lý bằng cách click vào ô checkbox
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={handleCancel}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          Hủy
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          sx={{ minWidth: 100 }}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AreaManagementModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  manager: PropTypes.object,
  provinces: PropTypes.array,
  allProvinces: PropTypes.array,
  onSave: PropTypes.func
};

export default AreaManagementModal; 