const API = 'https://cozy-upliftment-production-7486.up.railway.app'

let pharmacyCache = null

export async function getPharmacy() {
  if (pharmacyCache) return pharmacyCache
  try {
    const res = await fetch(API + '/api/auth/pharmacy')
    const data = await res.json()
    pharmacyCache = data.pharmacy
    return pharmacyCache
  } catch (err) {
    return { name: 'MedRouteRx Pharmacy', phone: '', address: '' }
  }
}
