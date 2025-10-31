const BASE_URL = 'https://www.geniushrtech.com/BGCFE/api';
// http://171.16.1.150/FEWebAPI/api
// https://www.geniushrtech.com/BGCFE/api



const API = {
  LOGIN: `${BASE_URL}/token`,

  Profile: (id) => `${BASE_URL}/field-executives/profile?id=${id}`,

 CASE_LIST: (id) => `${BASE_URL}/cases/list?id=${id}`,

 CASE_DETAILS: (id) => `${BASE_URL}/cases/details?id=${id}`,

 NOTIFICATION_ADDRESS: (id) => `${BASE_URL}/cases/notify-candidate?id=${id}`,


 STARTVERFICATION: `${BASE_URL}/field-executives/verification/start`,

 FORMSUBMIT:`${BASE_URL}/candidate/address/save`,

 DOCUMENTUPLOAD:`${BASE_URL}/candidate/address/docs`,

 DELETEDOC:`${BASE_URL}/candidate/address/delete`,


  FORMFINALUPLOAD:`${BASE_URL}/field-executives/verification/finish`,


};

// Add more endpoints here as needed


export default API;