export interface LocationOption {
  id: string;
  label: string;
  isoCode?: string;
}

// ─── Nigeria data ─────────────────────────────────────────────────────────────

const NIGERIA_STATES: { name: string; isoCode: string; cities: string[] }[] = [
  { name: 'Abia', isoCode: 'AB', cities: ['Aba', 'Umuahia', 'Ohafia'] },
  { name: 'Adamawa', isoCode: 'AD', cities: ['Yola', 'Mubi', 'Numan'] },
  { name: 'Akwa Ibom', isoCode: 'AK', cities: ['Uyo', 'Eket', 'Ikot Ekpene'] },
  { name: 'Anambra', isoCode: 'AN', cities: ['Awka', 'Onitsha', 'Nnewi', 'Ekwulobia'] },
  { name: 'Bauchi', isoCode: 'BA', cities: ['Bauchi', 'Azare', 'Misau'] },
  { name: 'Bayelsa', isoCode: 'BY', cities: ['Yenagoa', 'Brass', 'Ogbia'] },
  { name: 'Benue', isoCode: 'BE', cities: ['Makurdi', 'Gboko', 'Otukpo'] },
  { name: 'Borno', isoCode: 'BO', cities: ['Maiduguri', 'Biu', 'Kukawa'] },
  { name: 'Cross River', isoCode: 'CR', cities: ['Calabar', 'Ikom', 'Ogoja'] },
  { name: 'Delta', isoCode: 'DE', cities: ['Asaba', 'Warri', 'Ughelli', 'Sapele'] },
  { name: 'Ebonyi', isoCode: 'EB', cities: ['Abakaliki', 'Afikpo', 'Onueke'] },
  { name: 'Edo', isoCode: 'ED', cities: ['Benin City', 'Auchi', 'Ekpoma'] },
  { name: 'Ekiti', isoCode: 'EK', cities: ['Ado Ekiti', 'Ikere Ekiti', 'Oye Ekiti'] },
  { name: 'Enugu', isoCode: 'EN', cities: ['Enugu', 'Nsukka', 'Oji River'] },
  { name: 'FCT', isoCode: 'FC', cities: ['Abuja', 'Gwagwalada', 'Kuje', 'Bwari'] },
  { name: 'Gombe', isoCode: 'GO', cities: ['Gombe', 'Kaltungo', 'Dukku'] },
  { name: 'Imo', isoCode: 'IM', cities: ['Owerri', 'Orlu', 'Okigwe'] },
  { name: 'Jigawa', isoCode: 'JI', cities: ['Dutse', 'Hadejia', 'Gumel'] },
  { name: 'Kaduna', isoCode: 'KD', cities: ['Kaduna', 'Zaria', 'Kafanchan'] },
  { name: 'Kano', isoCode: 'KN', cities: ['Kano', 'Wudil', 'Gaya'] },
  { name: 'Katsina', isoCode: 'KT', cities: ['Katsina', 'Daura', 'Funtua'] },
  { name: 'Kebbi', isoCode: 'KE', cities: ['Birnin Kebbi', 'Argungu', 'Yelwa'] },
  { name: 'Kogi', isoCode: 'KO', cities: ['Lokoja', 'Okene', 'Kabba'] },
  { name: 'Kwara', isoCode: 'KW', cities: ['Ilorin', 'Offa', 'Oke Ero'] },
  { name: 'Lagos', isoCode: 'LA', cities: ['Lagos Island', 'Ikeja', 'Victoria Island', 'Lekki', 'Surulere', 'Yaba', 'Ikorodu', 'Badagry', 'Epe', 'Ojo', 'Alimosho', 'Shomolu'] },
  { name: 'Nasarawa', isoCode: 'NA', cities: ['Lafia', 'Keffi', 'Akwanga'] },
  { name: 'Niger', isoCode: 'NI', cities: ['Minna', 'Bida', 'Suleja', 'Kontagora'] },
  { name: 'Ogun', isoCode: 'OG', cities: ['Abeokuta', 'Sagamu', 'Ijebu Ode', 'Ota'] },
  { name: 'Ondo', isoCode: 'ON', cities: ['Akure', 'Ondo', 'Owo', 'Ikare'] },
  { name: 'Osun', isoCode: 'OS', cities: ['Osogbo', 'Ile Ife', 'Ilesa', 'Ede'] },
  { name: 'Oyo', isoCode: 'OY', cities: ['Ibadan', 'Ogbomosho', 'Oyo', 'Iseyin'] },
  { name: 'Plateau', isoCode: 'PL', cities: ['Jos', 'Bukuru', 'Pankshin'] },
  { name: 'Rivers', isoCode: 'RI', cities: ['Port Harcourt', 'Obio-Akpor', 'Bonny', 'Ogu'] },
  { name: 'Sokoto', isoCode: 'SO', cities: ['Sokoto', 'Wamako', 'Tambuwal'] },
  { name: 'Taraba', isoCode: 'TA', cities: ['Jalingo', 'Wukari', 'Bali'] },
  { name: 'Yobe', isoCode: 'YO', cities: ['Damaturu', 'Potiskum', 'Gashua'] },
  { name: 'Zamfara', isoCode: 'ZA', cities: ['Gusau', 'Kaura Namoda', 'Anka'] },
];

// ─── Selected countries ───────────────────────────────────────────────────────

const COUNTRIES: { name: string; isoCode: string }[] = [
  { name: 'Nigeria', isoCode: 'NG' },
  { name: 'Ghana', isoCode: 'GH' },
  { name: 'Kenya', isoCode: 'KE' },
  { name: 'South Africa', isoCode: 'ZA' },
  { name: 'United Kingdom', isoCode: 'GB' },
  { name: 'United States', isoCode: 'US' },
  { name: 'Canada', isoCode: 'CA' },
  { name: 'Rwanda', isoCode: 'RW' },
  { name: 'Senegal', isoCode: 'SN' },
  { name: 'Ivory Coast', isoCode: 'CI' },
  { name: 'Tanzania', isoCode: 'TZ' },
  { name: 'Uganda', isoCode: 'UG' },
  { name: 'Ethiopia', isoCode: 'ET' },
  { name: 'Cameroon', isoCode: 'CM' },
];

export function getAllCountries(): LocationOption[] {
  return COUNTRIES.map((c) => ({ id: c.name, label: c.name, isoCode: c.isoCode }));
}

export function findCountry(nameOrCode?: string) {
  if (!nameOrCode) return null;
  const s = nameOrCode.trim().toLowerCase();
  return COUNTRIES.find(
    (c) => c.name.toLowerCase() === s || c.isoCode.toLowerCase() === s,
  ) ?? null;
}

export function getStatesOfCountry(countryNameOrCode = 'Nigeria'): LocationOption[] {
  const country = findCountry(countryNameOrCode);
  if (!country || country.isoCode !== 'NG') return [];
  return NIGERIA_STATES.map((s) => ({ id: s.name, label: s.name, isoCode: s.isoCode }));
}

export function findState(countryNameOrCode: string, stateNameOrCode?: string) {
  if (!stateNameOrCode) return null;
  const country = findCountry(countryNameOrCode);
  if (!country || country.isoCode !== 'NG') return null;
  const s = stateNameOrCode.trim().toLowerCase();
  return NIGERIA_STATES.find(
    (st) => st.name.toLowerCase() === s || st.isoCode.toLowerCase() === s,
  ) ?? null;
}

export function getCitiesOfState(
  countryNameOrCode = 'Nigeria',
  stateNameOrCode?: string,
): LocationOption[] {
  const country = findCountry(countryNameOrCode);
  if (!country || country.isoCode !== 'NG') return [];
  if (!stateNameOrCode) return [];
  const state = findState(countryNameOrCode, stateNameOrCode);
  if (!state) return [];
  return state.cities.map((name) => ({ id: name, label: name }));
}
