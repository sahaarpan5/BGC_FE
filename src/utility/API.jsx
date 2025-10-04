const BASE_URL = 'http://171.16.1.150/FEWebAPI/api';

const API = {
  LOGIN: `${BASE_URL}/field-executives/login`,

 CASE_LIST: (id) => `${BASE_URL}/cases/list?id=${id}`,


};

// Add more endpoints here as needed


export default API;