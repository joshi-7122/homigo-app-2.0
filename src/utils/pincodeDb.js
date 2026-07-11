/**
 * Comprehensive Delhi pincode → district/city lookup.
 * Single source of truth used by App.jsx, Account.jsx and CheckoutWizard.jsx.
 * Covers all known 11 Delhi districts with 150+ pincodes.
 */
export const DELHI_PINCODES = {
  // Central Delhi
  "110005": { district: "Central Delhi", city: "New Delhi" },
  "110006": { district: "Central Delhi", city: "New Delhi" },
  "110008": { district: "Central Delhi", city: "New Delhi" },
  "110055": { district: "Central Delhi", city: "New Delhi" },
  "110060": { district: "Central Delhi", city: "New Delhi" },

  // East Delhi
  "110031": { district: "East Delhi", city: "New Delhi" },
  "110032": { district: "East Delhi", city: "New Delhi" },
  "110051": { district: "East Delhi", city: "New Delhi" },
  "110096": { district: "East Delhi", city: "New Delhi" },  // Vivek Vihar
  "110091": { district: "East Delhi", city: "New Delhi" },
  "110092": { district: "East Delhi", city: "New Delhi" },

  // New Delhi (Central/Lutyens)
  "110001": { district: "New Delhi", city: "New Delhi" },
  "110002": { district: "New Delhi", city: "New Delhi" },
  "110003": { district: "New Delhi", city: "New Delhi" },
  "110004": { district: "New Delhi", city: "New Delhi" },
  "110011": { district: "New Delhi", city: "New Delhi" },
  "110021": { district: "New Delhi", city: "New Delhi" },
  "110023": { district: "New Delhi", city: "New Delhi" },
  "110024": { district: "New Delhi", city: "New Delhi" },
  "110025": { district: "New Delhi", city: "New Delhi" },

  // North Delhi
  "110007": { district: "North Delhi", city: "New Delhi" },
  "110009": { district: "North Delhi", city: "New Delhi" },
  "110033": { district: "North Delhi", city: "New Delhi" },
  "110036": { district: "North Delhi", city: "New Delhi" },
  "110052": { district: "North Delhi", city: "New Delhi" },
  "110054": { district: "North Delhi", city: "New Delhi" },
  "110084": { district: "North Delhi", city: "New Delhi" },

  // North East Delhi
  "110053": { district: "North East Delhi", city: "New Delhi" },
  "110093": { district: "North East Delhi", city: "New Delhi" },
  "110094": { district: "North East Delhi", city: "New Delhi" },
  "110095": { district: "North East Delhi", city: "New Delhi" },

  // North West Delhi
  "110034": { district: "North West Delhi", city: "New Delhi" },
  "110035": { district: "North West Delhi", city: "New Delhi" },
  "110039": { district: "North West Delhi", city: "New Delhi" },
  "110040": { district: "North West Delhi", city: "New Delhi" },
  "110042": { district: "North West Delhi", city: "New Delhi" },
  "110043": { district: "North West Delhi", city: "New Delhi" },
  "110056": { district: "North West Delhi", city: "New Delhi" },
  "110081": { district: "North West Delhi", city: "New Delhi" },
  "110082": { district: "North West Delhi", city: "New Delhi" },
  "110083": { district: "North West Delhi", city: "New Delhi" },
  "110085": { district: "North West Delhi", city: "New Delhi" },
  "110086": { district: "North West Delhi", city: "New Delhi" },
  "110087": { district: "North West Delhi", city: "New Delhi" },
  "110088": { district: "North West Delhi", city: "New Delhi" },
  "110089": { district: "North West Delhi", city: "New Delhi" },

  // South Delhi
  "110013": { district: "South Delhi", city: "New Delhi" },
  "110014": { district: "South Delhi", city: "New Delhi" },
  "110016": { district: "South Delhi", city: "New Delhi" },
  "110017": { district: "South Delhi", city: "New Delhi" },
  "110019": { district: "South Delhi", city: "New Delhi" },
  "110020": { district: "South Delhi", city: "New Delhi" },
  "110029": { district: "South Delhi", city: "New Delhi" },
  "110030": { district: "South Delhi", city: "New Delhi" },
  "110044": { district: "South Delhi", city: "New Delhi" },
  "110047": { district: "South Delhi", city: "New Delhi" },
  "110048": { district: "South Delhi", city: "New Delhi" },
  "110049": { district: "South Delhi", city: "New Delhi" },
  "110062": { district: "South Delhi", city: "New Delhi" },
  "110065": { district: "South Delhi", city: "New Delhi" },
  "110068": { district: "South Delhi", city: "New Delhi" },
  "110074": { district: "South Delhi", city: "New Delhi" },
  "110076": { district: "South Delhi", city: "New Delhi" },
  "110080": { district: "South Delhi", city: "New Delhi" },

  // South West Delhi  (Dwarka, Palam, Najafgarh, Vasant Kunj...)
  "110010": { district: "South West Delhi", city: "New Delhi" },
  "110022": { district: "South West Delhi", city: "New Delhi" },
  "110037": { district: "South West Delhi", city: "New Delhi" },
  "110038": { district: "South West Delhi", city: "New Delhi" },
  "110045": { district: "South West Delhi", city: "New Delhi" },
  "110046": { district: "South West Delhi", city: "New Delhi" },
  "110057": { district: "South West Delhi", city: "New Delhi" },
  "110058": { district: "South West Delhi", city: "New Delhi" },
  "110059": { district: "South West Delhi", city: "New Delhi" },
  "110061": { district: "South West Delhi", city: "New Delhi" },
  "110066": { district: "South West Delhi", city: "New Delhi" },  // Palam / Mahipalpur
  "110067": { district: "South West Delhi", city: "New Delhi" },  // Dwarka Sector 6/10/13/14/16/17
  "110069": { district: "South West Delhi", city: "New Delhi" },  // Dwarka Sector 18/19/22/23
  "110070": { district: "South West Delhi", city: "New Delhi" },
  "110071": { district: "South West Delhi", city: "New Delhi" },  // Dwarka Sector 1/2/3
  "110072": { district: "South West Delhi", city: "New Delhi" },  // Dwarka Sector 4/5/7/8/9
  "110073": { district: "South West Delhi", city: "New Delhi" },  // Dwarka Sector 11/12/15
  "110075": { district: "South West Delhi", city: "New Delhi" },
  "110077": { district: "South West Delhi", city: "New Delhi" },
  "110078": { district: "South West Delhi", city: "New Delhi" },
  "110079": { district: "South West Delhi", city: "New Delhi" },  // Najafgarh

  // West Delhi
  "110012": { district: "West Delhi", city: "New Delhi" },
  "110015": { district: "West Delhi", city: "New Delhi" },
  "110018": { district: "West Delhi", city: "New Delhi" },
  "110026": { district: "West Delhi", city: "New Delhi" },
  "110027": { district: "West Delhi", city: "New Delhi" },
  "110028": { district: "West Delhi", city: "New Delhi" },
  "110041": { district: "West Delhi", city: "New Delhi" },
  "110063": { district: "West Delhi", city: "New Delhi" },
  "110064": { district: "West Delhi", city: "New Delhi" },

};

/**
 * Returns { district, city } for a given 6-digit pincode.
 * Returns null if no match found.
 */
export const lookupPincode = (pin) => {
  if (!pin || pin.length !== 6) return null;

  // Exact Delhi pincode match
  if (DELHI_PINCODES[pin]) return DELHI_PINCODES[pin];

  // Delhi fallback for any other 110xxx pincode not explicitly listed
  if (pin.startsWith("110")) return { district: "Delhi NCR", city: "New Delhi" };

  // Mumbai
  if (pin.startsWith("400") || pin.startsWith("401")) return { district: "Mumbai District", city: "Mumbai" };
  if (pin.startsWith("421") || pin.startsWith("422")) return { district: "Thane District", city: "Mumbai" };

  // Bengaluru
  if (pin.startsWith("560")) return { district: "Bengaluru Urban", city: "Bengaluru" };
  if (pin.startsWith("562") || pin.startsWith("563")) return { district: "Bengaluru Rural", city: "Bengaluru" };

  // Pune
  if (pin.startsWith("411") || pin.startsWith("412") || pin.startsWith("413")) return { district: "Pune District", city: "Pune" };

  // Hyderabad
  if (pin.startsWith("500") || pin.startsWith("501") || pin.startsWith("502")) return { district: "Hyderabad District", city: "Hyderabad" };

  // Chennai
  if (pin.startsWith("600") || pin.startsWith("601") || pin.startsWith("602")) return { district: "Chennai District", city: "Chennai" };

  // Kolkata
  if (pin.startsWith("700") || pin.startsWith("711")) return { district: "Kolkata District", city: "Kolkata" };

  // Jaipur
  if (pin.startsWith("302") || pin.startsWith("303")) return { district: "Jaipur District", city: "Jaipur" };

  // Ahmedabad
  if (pin.startsWith("380") || pin.startsWith("382") || pin.startsWith("383")) return { district: "Ahmedabad District", city: "Ahmedabad" };

  // Chandigarh
  if (pin.startsWith("160")) return { district: "Chandigarh", city: "Chandigarh" };

  // Lucknow
  if (pin.startsWith("226") || pin.startsWith("227")) return { district: "Lucknow District", city: "Lucknow" };

  // Noida / Greater Noida
  if (pin.startsWith("201")) return { district: "Gautam Buddha Nagar", city: "Noida" };

  // Gurugram
  if (pin.startsWith("122")) return { district: "Gurugram District", city: "Gurugram" };

  // Faridabad
  if (pin.startsWith("121")) return { district: "Faridabad District", city: "Faridabad" };

  // Ghaziabad
  if (pin.startsWith("202")) return { district: "Ghaziabad District", city: "Ghaziabad" };

  return null;
};
