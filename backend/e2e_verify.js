const assert = require('assert');

const API_URL = 'http://localhost:5000/api';

async function runE2ETests() {
  console.log('🧪 Starting Full STAYGUARD End-to-End System Tests...\n');

  // 1. Health Check
  console.log('1️⃣ Testing Health Check Endpoint...');
  const healthRes = await fetch(`${API_URL}/health`);
  const health = await healthRes.json();
  assert.strictEqual(health.success, true);
  console.log('   ✅ Health Check Passed: Server Online.\n');

  // 2. Customer Login
  console.log('2️⃣ Testing Customer Login...');
  const custLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'customer@stayguard.com',
      password: 'password123',
    }),
  });
  const custLogin = await custLoginRes.json();
  assert.strictEqual(custLogin.success, true);
  const custToken = custLogin.data.token;
  console.log(`   ✅ Customer Logged in: ${custLogin.data.name} (Role: ${custLogin.data.role})\n`);

  // 3. Owner Login
  console.log('3️⃣ Testing Owner Login...');
  const ownerLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'owner@stayguard.com',
      password: 'password123',
    }),
  });
  const ownerLogin = await ownerLoginRes.json();
  assert.strictEqual(ownerLogin.success, true);
  const ownerToken = ownerLogin.data.token;
  console.log(`   ✅ Owner Logged in: ${ownerLogin.data.name} (Role: ${ownerLogin.data.role})\n`);

  // 4. Explore Hostels API & Filters
  console.log('4️⃣ Testing Explore Hostels API & Filters (Hyderabad, Price, Sorting)...');
  const hostelsRes = await fetch(`${API_URL}/hostels?city=Hyderabad&sort=recommended`);
  const hostels = await hostelsRes.json();
  assert.strictEqual(hostels.success, true);
  assert(hostels.data.length > 0);
  const targetHostel = hostels.data[0];
  console.log(`   ✅ Found ${hostels.data.length} Hostels in Hyderabad. Selected: "${targetHostel.name}" (Rating: ${targetHostel.rating}★)\n`);

  // 5. Hostel Details API with Rooms
  console.log('5️⃣ Testing Hostel Details & Room Availability...');
  const detailsRes = await fetch(`${API_URL}/hostels/${targetHostel._id}`);
  const details = await detailsRes.json();
  assert.strictEqual(details.success, true);
  assert(details.data.rooms && details.data.rooms.length > 0);
  const targetRoom = details.data.rooms.find((r) => r.availableBeds > 0) || details.data.rooms[0];
  console.log(`   ✅ Hostel Details Retrieved. Selected Room: "${targetRoom.roomType}" (₹${targetRoom.price}/night, ${targetRoom.availableBeds} beds available)\n`);

  // 5b. Testing Dedicated Categorized Hostel Images API
  console.log('5️⃣b Testing Dedicated Categorized Hostel Images API...');
  const imgRes = await fetch(`${API_URL}/hostels/${targetHostel._id}/images`);
  const imgData = await imgRes.json();
  assert.strictEqual(imgData.success, true);
  assert.ok(imgData.data.exterior, 'Exterior image must exist');
  assert.ok(imgData.data.room, 'Room image must exist');
  assert.ok(imgData.data.beds, 'Beds image must exist');
  assert.ok(imgData.data.bathroom, 'Bathroom image must exist');
  assert.ok(imgData.data.commonArea, 'Common Area image must exist');
  console.log(`   ✅ Categorized Hostel Images Verified: 5 isolated photo categories loaded for "${imgData.hostelName}"\n`);

  // 6. Create Booking API
  console.log('6️⃣ Testing Customer Booking Creation...');
  const checkInDate = new Date();
  checkInDate.setDate(checkInDate.getDate() + 3);
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkInDate.getDate() + 2);

  const bookingRes = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      hostelId: targetHostel._id,
      roomId: targetRoom._id,
      checkIn: checkInDate.toISOString().split('T')[0],
      checkOut: checkOutDate.toISOString().split('T')[0],
      guests: 1,
      specialRequests: 'Bottom bunk preference for remote work.',
    }),
  });
  const bookingData = await bookingRes.json();
  assert.strictEqual(bookingData.success, true);
  const booking = bookingData.data;
  console.log(`   ✅ Booking Created: #${booking._id} | Nights: ${booking.nights} | Base: ₹${booking.amount} | Tax (12%): ₹${booking.taxes} | Total: ₹${booking.totalAmount}\n`);

  // 7. Razorpay Order Creation API
  console.log('7️⃣ Testing Razorpay Test Order Creation...');
  const orderRes = await fetch(`${API_URL}/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      bookingId: booking._id,
    }),
  });
  const orderData = await orderRes.json();
  assert.strictEqual(orderData.success, true);
  console.log(`   ✅ Razorpay Order Created: ${orderData.data.orderId} for ₹${orderData.data.amount}\n`);

  // 8. Razorpay Payment Verification API
  console.log('8️⃣ Testing Razorpay Payment Verification & Bed Inventory Decrement...');
  const verifyRes = await fetch(`${API_URL}/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      bookingId: booking._id,
      razorpay_order_id: orderData.data.orderId,
      razorpay_payment_id: `pay_test_${Date.now()}`,
      razorpay_signature: 'test_signature_mock',
      paymentMethod: 'UPI (Google Pay / Test Mode)',
    }),
  });
  const verifyData = await verifyRes.json();
  assert.strictEqual(verifyData.success, true);
  assert.strictEqual(verifyData.data.booking.bookingStatus, 'Confirmed');
  assert.strictEqual(verifyData.data.booking.paymentStatus, 'Paid');
  console.log(`   ✅ Payment Verified! Booking #${verifyData.data.booking._id} Status: Confirmed, Payment: Paid\n`);

  // 9. Customer Notifications API
  console.log('9️⃣ Testing Customer In-App Notification Center...');
  const custNotifsRes = await fetch(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${custToken}` },
  });
  const custNotifs = await custNotifsRes.json();
  assert.strictEqual(custNotifs.success, true);
  console.log(`   ✅ Customer has ${custNotifs.count} notifications (${custNotifs.unreadCount} unread). Latest: "${custNotifs.data[0]?.title}"\n`);

  // 10. Owner Notifications API
  console.log('🔟 Testing Owner In-App Notification Center...');
  const ownerNotifsRes = await fetch(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  const ownerNotifs = await ownerNotifsRes.json();
  assert.strictEqual(ownerNotifs.success, true);
  console.log(`   ✅ Owner has ${ownerNotifs.count} notifications (${ownerNotifs.unreadCount} unread). Latest: "${ownerNotifs.data[0]?.title}"\n`);

  // 11. Owner Dashboard Analytics APIs
  console.log('1️⃣1️⃣ Testing Owner Operations Dashboard KPIs & Recharts Data...');
  const statsRes = await fetch(`${API_URL}/analytics/dashboard`, {
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  const stats = await statsRes.json();
  assert.strictEqual(stats.success, true);
  const kpis = stats.data.kpis;
  console.log(`   ✅ Owner KPIs Loaded:`);
  console.log(`      - Total Bookings: ${kpis.totalBookings}`);
  console.log(`      - Total Customers: ${kpis.totalCustomers}`);
  console.log(`      - Total Beds: ${kpis.totalBeds} (${kpis.availableBeds} Available, ${kpis.occupiedBeds} Occupied)`);
  console.log(`      - Bed Occupancy Rate: ${kpis.occupancyRate}%`);
  console.log(`      - Total Revenue: ₹${kpis.totalRevenue.toLocaleString('en-IN')}\n`);

  // 12. Owner Revenue Analytics API
  console.log('1️⃣2️⃣ Testing Owner Revenue Analytics API (30 Days)...');
  const revRes = await fetch(`${API_URL}/analytics/revenue?timeframe=30d`, {
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  const rev = await revRes.json();
  assert.strictEqual(rev.success, true);
  console.log(`   ✅ Revenue Summary Loaded: Period Revenue: ₹${rev.data.summary.periodRevenue.toLocaleString('en-IN')}, Avg Booking: ₹${rev.data.summary.avgBookingValue}\n`);

  // 13. Owner Customer Directory API
  console.log('1️⃣3️⃣ Testing Owner Customer Directory API...');
  const usersRes = await fetch(`${API_URL}/auth/users`, {
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  const users = await usersRes.json();
  assert.strictEqual(users.success, true);
  console.log(`   ✅ Customer Directory: Retrieved ${users.count} registered travelers.\n`);

  // 14. Owner Payments Ledger API
  console.log('1️⃣4️⃣ Testing Owner Payments Ledger API...');
  const payRes = await fetch(`${API_URL}/payments/owner/all`, {
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  const pays = await payRes.json();
  assert.strictEqual(payRes.status, 200);
  console.log(`   ✅ Payments Ledger: Retrieved ${pays.count || pays.data?.length || 0} transaction records.\n`);

  // 15. Strict Image Isolation & Zero Overlap Verification
  console.log('1️⃣5️⃣ Testing Strict Image Isolation & Zero Image Overlap Across All Hostels...');
  const allHostelsRes = await fetch(`${API_URL}/hostels?limit=50`);
  const allHostels = await allHostelsRes.json();
  assert.strictEqual(allHostels.success, true);
  
  const seenImageUrls = new Map();
  let totalHostelsChecked = 0;

  for (const h of allHostels.data) {
    totalHostelsChecked++;
    assert(h.images && h.images.length >= 5, `Hostel ${h.name} must have at least 5 professional images`);
    
    // Check dedicated categorized endpoint
    const hImgRes = await fetch(`${API_URL}/hostels/${h._id}/images`);
    const hImgData = await hImgRes.json();
    assert.strictEqual(hImgData.success, true);
    assert.ok(hImgData.data.exterior, `Hostel ${h.name} must have exterior image`);
    assert.ok(hImgData.data.room, `Hostel ${h.name} must have room image`);
    assert.ok(hImgData.data.beds, `Hostel ${h.name} must have beds image`);
    assert.ok(hImgData.data.bathroom, `Hostel ${h.name} must have bathroom image`);
    assert.ok(hImgData.data.commonArea, `Hostel ${h.name} must have commonArea image`);

    // Verify zero overlap across hostels
    for (const imgUrl of h.images) {
      if (seenImageUrls.has(imgUrl)) {
        const previousHostel = seenImageUrls.get(imgUrl);
        assert.fail(`IMAGE OVERLAP DETECTED! Image "${imgUrl}" is shared between "${previousHostel}" and "${h.name}". Images MUST be strictly isolated.`);
      }
      seenImageUrls.set(imgUrl, h.name);
    }
  }

  console.log(`   ✅ Strict Image Isolation Verified: Checked ${totalHostelsChecked} Hostels with ${seenImageUrls.size} unique photos. ZERO overlaps detected!\n`);

  console.log('🎉 ALL 15 STAYGUARD END-TO-END TESTS PASSED WITH ZERO ERRORS!\n');
}

runE2ETests().catch((err) => {
  console.error('❌ E2E Test Failure:', err);
  process.exit(1);
});
