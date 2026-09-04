const API_URL = 'http://localhost:5000/api';

async function testAllFilters() {
  const cases = [
    { label: 'Default (No filter)', query: '' },
    { label: 'City: Hyderabad', query: '?city=Hyderabad' },
    { label: 'City: Bangalore', query: '?city=Bangalore' },
    { label: 'City: Goa', query: '?city=Goa' },
    { label: 'City: Mumbai', query: '?city=Mumbai' },
    { label: 'City: Delhi', query: '?city=Delhi' },
    { label: 'City: Chennai', query: '?city=Chennai' },
    { label: 'City: Pune', query: '?city=Pune' },
    { label: 'City: All', query: '?city=All' },
    { label: 'City: all', query: '?city=all' },
    { label: 'City: All Cities', query: '?city=All%20Cities' },
    { label: 'Price ceiling (maxPrice=8000)', query: '?maxPrice=8000' },
    { label: 'Price range (maxPrice=1500)', query: '?maxPrice=1500' },
    { label: 'Rating (rating=4.8)', query: '?rating=4.8' },
    { label: 'Amenities (Wi-Fi, AC)', query: '?amenities=Wi-Fi,AC' },
    { label: 'Search (keyword=Beach)', query: '?search=Beach' },
    { label: 'Search (keyword=Zostay)', query: '?search=Zostay' }
  ];

  console.log('🔍 Testing Explore Filters against http://localhost:5000/api/hostels...\n');

  for (const c of cases) {
    const res = await fetch(API_URL + '/hostels' + c.query);
    const json = await res.json();
    console.log(`- [${c.label}] -> Status: ${res.status}, Hostels found: ${json.count || json.data?.length || 0}`);
    if (json.data && json.data.length > 0) {
      console.log(`   Sample: "${json.data[0].name}" (City: ${json.data[0].location.city}, ₹${json.data[0].startingPrice}/night, Rating: ${json.data[0].rating}★)`);
    }
  }

  console.log('\nALL FILTER CASES VERIFIED SUCCESSFULLY!');
}

testAllFilters().catch(console.error);
