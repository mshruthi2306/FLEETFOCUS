// import React, { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import vehicleService from '../../services/vehicleService';
// import { fetchVehicles } from '../../store/slices/vehicleSlice';

// function VehicleForm({ vehicle, onClose }) {
//   const dispatch = useDispatch();
//   const [formData, setFormData] = useState({
//     vin: '',
//     licensePlate: '',
//     model: '',
//     status: 'AVAILABLE',
//     currentMileage: '',
//   });
//   const [errorMessage, setErrorMessage] = useState('');

//   useEffect(() => {
//     if (vehicle) {
//       setFormData({
//         vin: vehicle.vin || '',
//         licensePlate: vehicle.licensePlate || '',
//         model: vehicle.model || '',
//         status: vehicle.status || 'AVAILABLE',
//         currentMileage: vehicle.currentMileage || '',
//       });
//     }
//   }, [vehicle]);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrorMessage('');
//     try {
//       if (vehicle) {
//         await vehicleService.update(vehicle.id, formData);
//       } else {
//         await vehicleService.create(formData);
//       }
//       dispatch(fetchVehicles({ page: 0, size: 10 }));
//       onClose();
//     } catch (err) {
//       if (err.response?.status === 409 && err.response?.data?.message === 'VIN already exists') {
//         setErrorMessage('VIN already exists');
//       } else {
//         alert('Error saving vehicle: ' + err.message);
//       }
//     }
//   };

//   return (
//     <div className="modal">
//       <div className="modal-content">
//         <h2>{vehicle ? 'Edit Vehicle' : 'Register New Vehicle'}</h2>
//         <form onSubmit={handleSubmit}>
//           <input
//             type="text"
//             name="vin"
//             placeholder="17-character VIN"
//             maxLength="17"
//             value={formData.vin}
//             onChange={handleChange}
//              required
//           />
//           <input
//             type="text"
//             name="licensePlate"
//             placeholder="ABC-1234"
//             value={formData.licensePlate}
//             onChange={handleChange}
//             required
//           />
//           <input
//             type="text"
//             name="model"
//             placeholder="e.g Volvo FH16"
//             required
//             value={formData.model}
//             onChange={handleChange}
//           />
//           <select name="status" value={formData.status} onChange={handleChange}>
//             <option value="AVAILABLE">AVAILABLE</option>
//             <option value="ON_TRIP">ON_TRIP</option>
//             <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
//           </select>
//           <input
//             type="number"
//             name="currentMileage"
//             value={formData.currentMileage}
//             onChange={handleChange}
//           />
//           {errorMessage && (
//             <div className="error-message" style={{ color: 'red' }}>
//               {errorMessage}
//             </div>
//           )}
//           <button type="submit">
//             {vehicle ? 'Update Vehicle' : 'Register Vehicle'}
//           </button>
//           <button type="button" onClick={onClose}>Close</button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default VehicleForm;


// import React, { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import vehicleService from '../../services/vehicleService';
// import { fetchVehicles } from '../../store/slices/vehicleSlice';

// function VehicleForm({ vehicle, onClose }) {
//   const dispatch = useDispatch();

//   const [formData, setFormData] = useState({
//     vin: '',
//     licensePlate: '',
//     model: '',
//     status: 'AVAILABLE',
//     currentMileage: '',
//   });

//   const [errorMessage, setErrorMessage] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');

//   useEffect(() => {
//     if (vehicle) {
//       setFormData({
//         vin: vehicle.vin || '',
//         licensePlate: vehicle.licensePlate || '',
//         model: vehicle.model || '',
//         status: vehicle.status || 'AVAILABLE',
//         currentMileage: vehicle.currentMileage || '',
//       });
//     }
//   }, [vehicle]);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setErrorMessage('');
//     setSuccessMessage('');

//     try {
//       if (vehicle) {
//         // UPDATE vehicle
//         await vehicleService.update(vehicle.id, formData);

//         dispatch(fetchVehicles({ page: 0, size: 10 }));

//         onClose();
//       } else {
//         // CREATE vehicle
//         const response = await vehicleService.create(formData);

//         // Backend returns HTTP 201
//         if (response?.status === 201) {
//           setSuccessMessage(response.data);
//         }

//         // Refresh vehicle list
//         dispatch(fetchVehicles({ page: 0, size: 10 }));
//       }
//     } catch (err) {
//       if (
//         err.response?.status === 409 &&
//         err.response?.data?.message === 'VIN already exists'
//       ) {
//         setErrorMessage('VIN already exists');
//       } else {
//         setErrorMessage(
//           err.response?.data?.message ||
//           err.message ||
//           'Error saving vehicle'
//         );
//       }
//     }
//   };

//   return (
//     <div className="modal">
//       <div className="modal-content">

//         <h2>
//           {vehicle ? 'Edit Vehicle' : 'Register New Vehicle'}
//         </h2>

//         <form onSubmit={handleSubmit}>

//           {/* VIN */}
//           <input
//             type="text"
//             name="vin"
//             placeholder="17-character VIN"
//             maxLength="17"
//             value={formData.vin}
//             onChange={handleChange}
//             required
//           />

//           {/* License Plate */}
//           <input
//             type="text"
//             name="licensePlate"
//             placeholder="ABC-1234"
//             value={formData.licensePlate}
//             onChange={handleChange}
//             required
//           />

//           {/* Model */}
//           <input
//             type="text"
//             name="model"
//             placeholder="e.g Volvo FH16"
//             required
//             value={formData.model}
//             onChange={handleChange}
//           />

//           {/* Status */}
//           <select
//             name="status"
//             value={formData.status}
//             onChange={handleChange}
//           >
//             <option value="AVAILABLE">AVAILABLE</option>
//             <option value="ON_TRIP">ON_TRIP</option>
//             <option value="UNDER_MAINTENANCE">
//               UNDER_MAINTENANCE
//             </option>
//           </select>

//           {/* Current Mileage */}
//           <input
//             type="number"
//             name="currentMileage"
//             value={formData.currentMileage}
//             onChange={handleChange}
//           />

//           {/* Error Message */}
//           {errorMessage && (
//             <div
//               className="error-message"
//               style={{ color: 'red' }}
//             >
//               {errorMessage}
//             </div>
//           )}

//           {/* SUCCESS MESSAGE */}
//           {successMessage && (
//             <div
//               className="success-message"
//               role="alert"
//             >
//               {successMessage}
//             </div>
//           )}

//           {/* Submit */}
//           <button type="submit">
//             {vehicle ? 'Update Vehicle' : 'Register Vehicle'}
//           </button>

//           {/* Close */}
//           <button
//             type="button"
//             onClick={onClose}
//           >
//             Close
//           </button>

//         </form>
//       </div>
//     </div>
//   );
// }

// export default VehicleForm;/


import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import vehicleService from '../../services/vehicleService';
import { fetchVehicles } from '../../store/slices/vehicleSlice';

function VehicleForm({ vehicle, onClose }) {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    vin: '',
    licensePlate: '',
    model: '',
    status: 'AVAILABLE',
    currentMileage: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load vehicle data when editing
  useEffect(() => {
    if (vehicle) {
      setFormData({
        vin: vehicle.vin || '',
        licensePlate: vehicle.licensePlate || '',
        model: vehicle.model || '',
        status: vehicle.status || 'AVAILABLE',
        currentMileage: vehicle.currentMileage || '',
      });
    }
  }, [vehicle]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    try {
      // UPDATE
      if (vehicle) {
        await vehicleService.update(vehicle.id, formData);

        dispatch(
          fetchVehicles({
            page: 0,
            size: 10,
          })
        );

        onClose();
      }

      // CREATE
      else {
        const response = await vehicleService.create(formData);

        /*
         * Backend returns HTTP 201.
         * Display the exact backend response message
         * instead of using alert().
         */
        if (response?.status === 201) {
          setSuccessMessage(response.data);
        } else if (response?.data) {
          setSuccessMessage(response.data);
        }

        dispatch(
          fetchVehicles({
            page: 0,
            size: 10,
          })
        );
      }
    } catch (err) {
      // Duplicate VIN
      if (
        err.response?.status === 409 &&
        (err.response?.data?.message === 'VIN already exists' ||
         err.response?.data === 'VIN already exists' ||
         (typeof err.response?.data?.message === 'string' && err.response.data.message.includes('VIN already exists')))
      ) {
        setErrorMessage('VIN already exists');
      }

      // Other backend errors
      else {
        setErrorMessage(
          err.response?.data?.message ||
          (typeof err.response?.data === 'string' ? err.response.data : null) ||
          err.message ||
          'Error saving vehicle'
        );
      }
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">

        <h2>
          {vehicle
            ? 'Edit Vehicle'
            : 'Register New Vehicle'}
        </h2>

        <form onSubmit={handleSubmit}>

          {/* VIN */}
          <input
            type="text"
            name="vin"
            placeholder="17-character VIN"
            maxLength="17"
            value={formData.vin}
            onChange={handleChange}
            required
          />

          {/* License Plate */}
          <input
            type="text"
            name="licensePlate"
            placeholder="ABC-1234"
            value={formData.licensePlate}
            onChange={handleChange}
            required
          />

          {/* Model */}
          <input
            type="text"
            name="model"
            placeholder="e.g Volvo FH16"
            value={formData.model}
            onChange={handleChange}
            required
          />

          {/* Status */}
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="AVAILABLE">
              AVAILABLE
            </option>

            <option value="ON_TRIP">
              ON_TRIP
            </option>

            <option value="UNDER_MAINTENANCE">
              UNDER_MAINTENANCE
            </option>
          </select>

          {/* Mileage */}
          <input
            type="number"
            name="currentMileage"
            value={formData.currentMileage}
            onChange={handleChange}
          />

          {/* Error Message */}
          {errorMessage && (
            <div
              className="error-message"
              style={{ color: 'red' }}
            >
              {errorMessage}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div
              className="success-message"
              role="alert"
            >
              {successMessage}
            </div>
          )}

          {/* Submit */}
          <button type="submit">
            {vehicle
              ? 'Update Vehicle'
              : 'Register Vehicle'}
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
          >
            Close
          </button>

        </form>
      </div>
    </div>
  );
}

export default VehicleForm;