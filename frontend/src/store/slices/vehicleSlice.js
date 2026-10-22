import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import vehicleService from '../../services/vehicleService';

export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchAll',
  async ({ page, size }, { rejectWithValue }) => {
    try {
      return await vehicleService.getAll(page, size);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  'vehicles/delete',
  async (id) => {
    await vehicleService.delete(id);
    return id;
  }
);

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState: {
    items: [],
    pagination: {
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      pageSize: 10,
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.content;
        state.pagination = {
          currentPage: action.payload.number,
          totalPages: action.payload.totalPages,
          totalElements: action.payload.totalElements,
          pageSize: action.payload.size,
        };
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => String(item.id) !== String(action.payload));
        if (state.pagination && state.pagination.totalElements > 0) {
          state.pagination.totalElements -= 1;
        }
      });
  },
});

export default vehicleSlice.reducer;