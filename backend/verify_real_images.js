const fs = require('fs');

// We have 12 hostels across India:
// 1. The Hyderabad Backpackers Haven (Hyderabad) - Local authentic generated photos in /images/hostels/hostel-1/
// 2. Zostay Social Hub - Indiranagar (Bangalore)
// 3. Goa Coastal Beach Backpackers (Goa)
// 4. Bombay Harbor Nomad House - Bandra (Mumbai)
// 5. Delhi Heritage Boutique Villa - Hauz Khas (Delhi)
// 6. Chennai Marina Bay Travelers Inn - Mylapore (Chennai)
// 7. Pune Hills & Culture Pod Hostel - Koregaon Park (Pune)
// 8. Hyderabad Gachibowli Coliving PG (Hyderabad)
// 9. Koramangala Techie Dorms (Bangalore)
// 10. Vagator Cliffside Backpacker Hostel (Goa)
// 11. South Bombay Royal AC Haven - Colaba (Mumbai)
// 12. Connaught Place Central Hub (Delhi)

const hostelImageSets = {
  hostel1: [
    '/images/hostels/hostel-1/building.jpg',
    '/images/hostels/hostel-1/room.jpg',
    '/images/hostels/hostel-1/beds.jpg',
    '/images/hostels/hostel-1/bathroom.jpg',
    '/images/hostels/hostel-1/common.jpg',
    '/images/hostels/hostel-1/corridor.jpg',
  ],
  hostel2: [
    '/images/hostels/hostel-2/building.jpg',
    '/images/hostels/hostel-2/room.jpg',
    '/images/hostels/hostel-2/beds.jpg',
    '/images/hostels/hostel-2/bathroom.jpg',
    '/images/hostels/hostel-2/common.jpg',
    '/images/hostels/hostel-2/corridor.jpg',
  ],
  hostel3: [
    '/images/hostels/hostel-3/building.jpg',
    '/images/hostels/hostel-3/room.jpg',
    '/images/hostels/hostel-3/beds.jpg',
    '/images/hostels/hostel-3/bathroom.jpg',
    '/images/hostels/hostel-3/common.jpg',
    '/images/hostels/hostel-3/corridor.jpg',
  ],
  hostel4: [
    '/images/hostels/hostel-4/building.jpg',
    '/images/hostels/hostel-4/room.jpg',
    '/images/hostels/hostel-4/beds.jpg',
    '/images/hostels/hostel-4/bathroom.jpg',
    '/images/hostels/hostel-4/common.jpg',
    '/images/hostels/hostel-4/corridor.jpg',
  ],
  hostel5: [
    '/images/hostels/hostel-5/building.jpg',
    '/images/hostels/hostel-5/room.jpg',
    '/images/hostels/hostel-5/beds.jpg',
    '/images/hostels/hostel-5/bathroom.jpg',
    '/images/hostels/hostel-5/common.jpg',
    '/images/hostels/hostel-5/corridor.jpg',
  ],
  hostel6: [
    '/images/hostels/hostel-6/building.jpg',
    '/images/hostels/hostel-6/room.jpg',
    '/images/hostels/hostel-6/beds.jpg',
    '/images/hostels/hostel-6/bathroom.jpg',
    '/images/hostels/hostel-6/common.jpg',
    '/images/hostels/hostel-6/corridor.jpg',
  ],
  hostel7: [
    '/images/hostels/hostel-7/building.jpg',
    '/images/hostels/hostel-7/room.jpg',
    '/images/hostels/hostel-7/beds.jpg',
    '/images/hostels/hostel-7/bathroom.jpg',
    '/images/hostels/hostel-7/common.jpg',
    '/images/hostels/hostel-7/corridor.jpg',
  ],
  hostel8: [
    '/images/hostels/hostel-8/building.jpg',
    '/images/hostels/hostel-8/room.jpg',
    '/images/hostels/hostel-8/beds.jpg',
    '/images/hostels/hostel-8/bathroom.jpg',
    '/images/hostels/hostel-8/common.jpg',
    '/images/hostels/hostel-8/corridor.jpg',
  ],
  hostel9: [
    '/images/hostels/hostel-9/building.jpg',
    '/images/hostels/hostel-9/room.jpg',
    '/images/hostels/hostel-9/beds.jpg',
    '/images/hostels/hostel-9/bathroom.jpg',
    '/images/hostels/hostel-9/common.jpg',
    '/images/hostels/hostel-9/corridor.jpg',
  ],
  hostel10: [
    '/images/hostels/hostel-10/building.jpg',
    '/images/hostels/hostel-10/room.jpg',
    '/images/hostels/hostel-10/beds.jpg',
    '/images/hostels/hostel-10/bathroom.jpg',
    '/images/hostels/hostel-10/common.jpg',
    '/images/hostels/hostel-10/corridor.jpg',
  ],
  hostel11: [
    '/images/hostels/hostel-11/building.jpg',
    '/images/hostels/hostel-11/room.jpg',
    '/images/hostels/hostel-11/beds.jpg',
    '/images/hostels/hostel-11/bathroom.jpg',
    '/images/hostels/hostel-11/common.jpg',
    '/images/hostels/hostel-11/corridor.jpg',
  ],
  hostel12: [
    '/images/hostels/hostel-12/building.jpg',
    '/images/hostels/hostel-12/room.jpg',
    '/images/hostels/hostel-12/beds.jpg',
    '/images/hostels/hostel-12/bathroom.jpg',
    '/images/hostels/hostel-12/common.jpg',
    '/images/hostels/hostel-12/corridor.jpg',
  ],
};

async function verifyAll() {
  console.log('Testing all curated hostel image URLs...');
  let total = 0;
  let passed = 0;
  let allUrls = [];

  for (const hKey in hostelImageSets) {
    const list = hostelImageSets[hKey];
    for (const url of list) {
      total++;
      allUrls.push(url);
      if (url.startsWith('/')) {
        // Local file
        const localPath = 'frontend/public' + url;
        if (fs.existsSync(localPath)) {
          passed++;
        } else {
          console.error('Missing local file:', localPath);
        }
      } else {
        try {
          const res = await fetch(url, { method: 'HEAD' });
          if (res.status === 200) {
            passed++;
          } else {
            console.error('HTTP', res.status, url);
          }
        } catch (e) {
          console.error('Fetch error:', e.message, url);
        }
      }
    }
  }

  console.log(`Passed: ${passed} / ${total}`);
  console.log(`Total URLs: ${allUrls.length}, Unique URLs: ${new Set(allUrls).size}`);
  if (allUrls.length === new Set(allUrls).size && passed === total) {
    console.log('SUCCESS: All 72 images are 100% verified, unique, and valid!');
  }
}

verifyAll();
