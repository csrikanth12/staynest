const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

// Load models
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

dotenv.config();

const seedData = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    console.log('🧹 Clearing existing database collections...');

    await User.deleteMany();
    await Hostel.deleteMany();
    await Room.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await Review.deleteMany();
    await Notification.deleteMany();

    console.log('👤 Creating Users (Owner + 25 Customers)...');
    
    // Hash password for seed users
    const salt = await bcrypt.genSalt(10);
    const defaultHashedPassword = await bcrypt.hash('password123', salt);

    // 1 Demo Owner
    const primaryOwner = await User.create({
      name: 'Vikram Aditya Sharma',
      email: 'owner@stayguard.com',
      password: 'password123',
      phone: '+91 98450 12345',
      role: 'owner',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    });

    // 1 Demo Customer
    const demoCustomer = await User.create({
      name: 'Rohan Mehra',
      email: 'customer@stayguard.com',
      password: 'password123',
      phone: '+91 99887 66554',
      role: 'customer',
      profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    });

    // 24 more realistic customers
    const customerNames = [
      { name: 'Aarav Patel', email: 'aarav.patel@gmail.com', phone: '+91 98111 22334', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
      { name: 'Ananya Deshmukh', email: 'ananya.d@gmail.com', phone: '+91 98222 33445', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
      { name: 'Kabir Singhania', email: 'kabir.s@yahoo.com', phone: '+91 98333 44556', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
      { name: 'Pooja Iyer', email: 'pooja.iyer@outlook.com', phone: '+91 98444 55667', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80' },
      { name: 'Aditya Varma', email: 'aditya.v@gmail.com', phone: '+91 98555 66778', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80' },
      { name: 'Sneha Kulkarni', email: 'sneha.k@gmail.com', phone: '+91 98666 77889', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80' },
      { name: 'Rishi Nambiar', email: 'rishi.n@gmail.com', phone: '+91 98777 88990', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80' },
      { name: 'Divya Reddy', email: 'divya.reddy@gmail.com', phone: '+91 98888 99001', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' },
      { name: 'Siddharth Rao', email: 'sid.rao@gmail.com', phone: '+91 98999 11223', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80' },
      { name: 'Tanvi Nair', email: 'tanvi.nair@gmail.com', phone: '+91 98123 45678', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80' },
      { name: 'Manish Chawla', email: 'manish.c@gmail.com', phone: '+91 98234 56789', img: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80' },
      { name: 'Meera Sen', email: 'meera.sen@gmail.com', phone: '+91 98345 67890', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
      { name: 'Varun Joshi', email: 'varun.j@gmail.com', phone: '+91 98456 78901', img: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80' },
      { name: 'Rhea Kapoor', email: 'rhea.k@gmail.com', phone: '+91 98567 89012', img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=300&q=80' },
      { name: 'Karthik Raman', email: 'karthik.r@gmail.com', phone: '+91 98678 90123', img: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=300&q=80' },
      { name: 'Ishita Banerjee', email: 'ishita.b@gmail.com', phone: '+91 98789 01234', img: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=300&q=80' },
      { name: 'Gaurav Bhatia', email: 'gaurav.b@gmail.com', phone: '+91 98890 12345', img: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&w=300&q=80' },
      { name: 'Priyanka Ghosh', email: 'priyanka.g@gmail.com', phone: '+91 98901 23456', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' },
      { name: 'Naveen Kumar', email: 'naveen.k@gmail.com', phone: '+91 98012 34567', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
      { name: 'Tara Sundaram', email: 'tara.s@gmail.com', phone: '+91 98120 98765', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
      { name: 'Devendra Pandey', email: 'dev.pandey@gmail.com', phone: '+91 98230 87654', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
      { name: 'Shruti Hegde', email: 'shruti.h@gmail.com', phone: '+91 98340 76543', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
      { name: 'Arjun Nanda', email: 'arjun.nanda@gmail.com', phone: '+91 98450 65432', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80' },
      { name: 'Lavanya Swaminathan', email: 'lavanya.s@gmail.com', phone: '+91 98560 54321', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80' },
    ];

    const customerDocs = [];
    for (const c of customerNames) {
      const user = await User.create({
        name: c.name,
        email: c.email,
        password: 'password123',
        phone: c.phone,
        role: 'customer',
        profileImage: c.img,
      });
      customerDocs.push(user);
    }
    customerDocs.push(demoCustomer);

    console.log(`🏨 Creating 12 Authentic Indian Hostels and PGs across major cities with distinct photo sets...`);

    const hostelSeedList = [
      {
        name: 'The Hyderabad Backpackers Haven & PG',
        description: 'Located in Madhapur near HITEC City, Hyderabad. A clean, budget-friendly student and working professional hostel featuring AC/Non-AC dorms, 24/7 power backup, Wi-Fi, study desks, and comfortable bunk beds.',
        location: {
          address: 'Plot 42, Silicon Valley Lane, Madhapur',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500081',
          landmark: 'Near Cyber Towers & Durgam Cheruvu Metro',
        },
        images: [
          '/images/hostels/hostel-1/building.jpg',
          '/images/hostels/hostel-1/room.jpg',
          '/images/hostels/hostel-1/beds.jpg',
          '/images/hostels/hostel-1/bathroom.jpg',
          '/images/hostels/hostel-1/common.jpg',
          '/images/hostels/hostel-1/corridor.jpg',
        ],
        amenities: ['Wi-Fi', 'AC', 'Locker', 'Laundry', 'Breakfast', 'CCTV', '24/7 Reception', 'Coworking Space'],
        rules: ['Quiet hours from 11 PM to 7 AM', 'Valid Government photo ID required at check-in', 'No smoking in dorm rooms'],
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
        contactInfo: { phone: '+91 98450 12345', email: 'hyd.haven@stayguard.com' },
        owner: primaryOwner._id,
        rating: 4.9,
        numReviews: 48,
        startingPrice: 1200,
        isFeatured: true,
      },
      {
        name: 'Zostay Social Hub & PG - Indiranagar',
        description: 'Popular student & digital nomad hostel in Indiranagar, Bangalore. Offers clean bunk bed dorms, study desks, high-speed Wi-Fi, common dining hall, and quiet hours.',
        location: {
          address: '100 Feet Road, 12th Main, Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560038',
          landmark: 'Behind Toit & 100 Ft Road',
        },
        images: [
          '/images/hostels/hostel-2/building.jpg',
          '/images/hostels/hostel-2/room.jpg',
          '/images/hostels/hostel-2/beds.jpg',
          '/images/hostels/hostel-2/bathroom.jpg',
          '/images/hostels/hostel-2/common.jpg',
          '/images/hostels/hostel-2/corridor.jpg',
        ],
        amenities: ['Wi-Fi', 'AC', 'Locker', 'Laundry', 'Breakfast', 'Parking', 'CCTV', '24/7 Reception', 'Coworking Space'],
        rules: ['Outside guests allowed only in common area', 'Quiet hours in dorms after 11 PM', 'Drinking strictly in designated terrace only'],
        cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
        contactInfo: { phone: '+91 98450 12346', email: 'blr.social@stayguard.com' },
        owner: primaryOwner._id,
        rating: 4.9,
        numReviews: 62,
        startingPrice: 1400,
        isFeatured: true,
      },
      {
        name: 'Goa Coastal Gypsy Backpacker Hostel',
        description: 'Budget beach hostel located in Anjuna, Goa. Simple clean dorms and private rooms, lockers, common study and social patio, 5 mins walk to the beach.',
        location: {
          address: 'Anjuna Flea Market Road, Near Curlies',
          city: 'Goa',
          state: 'Goa',
          pincode: '403509',
          landmark: '5 mins walk to South Anjuna Beach',
        },
        images: [
          '/images/hostels/hostel-3/building.jpg',
          '/images/hostels/hostel-3/room.jpg',
          '/images/hostels/hostel-3/beds.jpg',
          '/images/hostels/hostel-3/bathroom.jpg',
          '/images/hostels/hostel-3/common.jpg',
          '/images/hostels/hostel-3/corridor.jpg',
        ],
        amenities: ['Wi-Fi', 'AC', 'Locker', 'Breakfast', 'Parking', 'CCTV', '24/7 Reception', 'Cafe'],
        rules: ['Sand footwear outside dorms', 'Quiet hours in dorms from midnight', 'Respect fellow travelers'],
        cancellationPolicy: 'Free cancellation up to 3 days before arrival date.',
        contactInfo: { phone: '+91 98450 12347', email: 'goa.gypsy@stayguard.com' },
        owner: primaryOwner._id,
        rating: 4.8,
        numReviews: 89,
        startingPrice: 900,
        isFeatured: true,
      },
      {
        name: 'Bombay Harbor Nomad House & PG',
        description: 'Authentic student & working professional hostel in Bandra West, Mumbai. Features AC dorm bunks, security lockers, shared study workspace, and common dining.',
        location: {
          address: 'Pali Hill, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
          landmark: 'Near Carter Road Promenade',
        },
        images: [
          '/images/hostels/hostel-4/building.jpg',
          '/images/hostels/hostel-4/room.jpg',
          '/images/hostels/hostel-4/beds.jpg',
          '/images/hostels/hostel-4/bathroom.jpg',
          '/images/hostels/hostel-4/common.jpg',
          '/images/hostels/hostel-4/corridor.jpg',
        ],
        amenities: ['Wi-Fi', 'AC', 'Locker', 'Laundry', 'Breakfast', 'CCTV', '24/7 Reception', 'Coworking Space'],
        rules: ['Valid ID compulsory', 'No illegal substances', 'Keep shared bathrooms clean'],
        cancellationPolicy: 'Free cancellation up to 24 hours prior to check-in.',
        contactInfo: { phone: '+91 98450 12348', email: 'mumbai.nomad@stayguard.com' },
        owner: primaryOwner._id,
        rating: 4.7,
        numReviews: 41,
        startingPrice: 1100,
        isFeatured: true,
      },
      {
        name: 'Delhi Heritage Backpackers Villa - Hauz Khas',
        description: 'Budget-friendly travelers hostel in Hauz Khas Village, South Delhi. Air-conditioned dorms, individual bed charging points, rooftop terrace, and walking distance to metro.',
        location: {
          address: 'Hauz Khas Village, Near Fort Gate',
          city: 'Delhi',
          state: 'Delhi NCR',
          pincode: '110016',
          landmark: 'Walking distance from Hauz Khas Metro Station',
        },
        images: [
          '/images/hostels/hostel-5/building.jpg',
          '/images/hostels/hostel-5/room.jpg',
          '/images/hostels/hostel-5/beds.jpg',
          '/images/hostels/hostel-5/bathroom.jpg',
          '/images/hostels/hostel-5/common.jpg',
          '/images/hostels/hostel-5/corridor.jpg',
        ],
        amenities: ['Wi-Fi', 'AC', 'Locker', 'Breakfast', 'CCTV', '24/7 Reception', 'Laundry'],
        rules: ['Check-in after 1 PM, check-out before 11 AM', 'Card/UPI accepted at reception', 'Keep dorm curtains drawn for privacy'],
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
        contactInfo: { phone: '+91 98450 12349', email: 'delhi.heritage@stayguard.com' },
        owner: primaryOwner._id,
        rating: 4.7,
        numReviews: 54,
        startingPrice: 850,
        isFeatured: false,
      },
      {
        name: 'Chennai Marina Bay Travelers Inn & PG',
        description: 'Clean and peaceful hostel in Mylapore, Chennai. Offers AC dorms, South Indian breakfast, study desks, and quick access to city transit.',
        location: {
          address: 'Santhome High Road, Mylapore',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600004',
          landmark: 'Opposite Santhome Cathedral Basilica',
        },
        images: [
          '/images/hostels/hostel-6/building.jpg',
          '/images/hostels/hostel-6/room.jpg',
          '/images/hostels/hostel-6/beds.jpg',
          '/images/hostels/hostel-6/bathroom.jpg',
          '/images/hostels/hostel-6/common.jpg',
          '/images/hostels/hostel-6/corridor.jpg',
        ],
        amenities: ['Wi-Fi', 'AC', 'Locker', 'Laundry', 'Breakfast', 'Parking', 'CCTV', '24/7 Reception'],
        rules: ['Quiet hours from 10:30 PM to 6:30 AM', 'Shoes off in dorm areas', 'Water conservation encouraged'],
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
        contactInfo: { phone: '+91 98450 12350', email: 'chennai.marina@stayguard.com' },
        owner: primaryOwner._id,
        rating: 4.7,
        numReviews: 33,
        startingPrice: 750,
        isFeatured: false,
      },
      {
        name: 'Pune Hills & Culture Pod Hostel',
        description: 'Cozy and clean student hostel in Koregaon Park, Pune. Features comfortable dorm bunks, study spaces, lockers, and shared mess facilities.',
        location: {
          address: 'Lane 7, Koregaon Park',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
          landmark: 'Close to Osho International & German Bakery',
        },
        images: [
          '/images/hostels/hostel-7/building.jpg',
          '/images/hostels/hostel-7/room.jpg',
          '/images/hostels/hostel-7/beds.jpg',
          '/images/hostels/hostel-7/bathroom.jpg',
          '/images/hostels/hostel-7/common.jpg',
          '/images/hostels/hostel-7/corridor.jpg',
        ],
        amenities: ['Wi-Fi', 'AC', 'Locker', 'Laundry', 'Breakfast', 'Parking', 'CCTV', '24/7 Reception', 'Coworking Space'],
        rules: ['No loud music after 11 PM', 'Bunk lockers must remain locked', 'Luggage storage available pre-check-in'],
        cancellationPolicy: 'Free cancellation up to 48 hours prior to check-in.',
        contactInfo: { phone: '+91 98450 12351', email: 'pune.pods@stayguard.com' },
        owner: primaryOwner._id,
        rating: 4.8,
        numReviews: 47,
        startingPrice: 850,
        isFeatured: true,
      },
      {
        name: 'The Hyderabad Gachibowli Coliving PG',
        description: 'Prime coliving PG and student residence in Gachibowli, Hyderabad. Offers private rooms & shared sharing, mess meals, 100% power backup, and high-speed internet.',
        location: {
          address: 'Financial District Road, Gachibowli',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500032',
          landmark: 'Near Q-City & University of Hyderabad',
        },
        images: [
          '/images/hostels/hostel-8/building.jpg',
          '/images/hostels/hostel-8/room.jpg',
          '/images/hostels/hostel-8/beds.jpg',
          '/images/hostels/hostel-8/bathroom.jpg',
          '/images/hostels/hostel-8/common.jpg',
          '/images/hostels/hostel-8/corridor.jpg',
        ],
        amenities: ['Wi-Fi', 'AC', 'Locker', 'Laundry', 'Breakfast', 'Parking', 'CCTV', '24/7 Reception', 'Coworking Space'],
        rules: ['Gate closing at 10:30 PM', 'No alcohol inside premises', 'Designated laundry schedule'],
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
        contactInfo: { phone: '+91 98450 12352', email: 'hyd.gachibowli@stayguard.com' },
        owner: primaryOwner._id,
        rating: 4.7,
        numReviews: 29,
        startingPrice: 950,
        isFeatured: false,
      },
      {
        name: 'Koramangala Techie Dorms & PG - Bangalore',
        description: 'Centrally located in Koramangala 4th Block, Bangalore. Practical student and tech worker hostel with comfortable beds, fiber Wi-Fi, lockers, and mess facilities.',
        location: {
          address: '80 Feet Road, 4th Block, Koramangala',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560034',
          landmark: 'Opposite Sony World Signal',
        },
        images: [
          '/images/hostels/hostel-9/building.jpg',
          '/images/hostels/hostel-9/room.jpg',
          '/images/hostels/hostel-9/beds.jpg',
          '/images/hostels/hostel-9/bathroom.jpg',
          '/images/hostels/hostel-9/common.jpg',
          '/images/hostels/hostel-9/corridor.jpg',
        ],
        amenities: ['Wi-Fi', 'AC', 'Locker', 'Laundry', 'Breakfast', 'CCTV', '24/7 Reception', 'Coworking Space'],
        rules: ['Quiet study environment', 'Non-smoking building', 'Check-in from 12 PM'],
        cancellationPolicy: 'Free cancellation up to 24 hours prior to check-in.',
        contactInfo: { phone: '+91 98450 12353', email: 'blr.koramangala@stayguard.com' },
        owner: primaryOwner._id,
        rating: 4.8,
        numReviews: 53,
        startingPrice: 1100,
        isFeatured: true,
      },
      {
        name: 'Vagator Sunset Backpacker Hostel - Goa',
        description: 'Authentic backpacker hostel near Vagator Beach in North Goa. Features clean budget dorms, individual reading lights, lockers, and relaxing terrace deck.',
        location: {
          address: 'Little Vagator Cliff Path, Vagator',
          city: 'Goa',
          state: 'Goa',
          pincode: '403509',
          landmark: 'Near Ozran Beach Path',
        },
        images: [
          '/images/hostels/hostel-10/building.jpg',
          '/images/hostels/hostel-10/room.jpg',
          '/images/hostels/hostel-10/beds.jpg',
          '/images/hostels/hostel-10/bathroom.jpg',
          '/images/hostels/hostel-10/common.jpg',
          '/images/hostels/hostel-10/corridor.jpg',
        ],
        amenities: ['Wi-Fi', 'AC', 'Locker', 'Breakfast', 'Parking', 'CCTV', '24/7 Reception', 'Cafe'],
        rules: ['Quiet hours in dorms after 11 PM', 'Keep lockers secured', 'Valid Government ID mandatory'],
        cancellationPolicy: 'Free cancellation up to 48 hours before check-in.',
        contactInfo: { phone: '+91 98450 12354', email: 'goa.vagator@stayguard.com' },
        owner: primaryOwner._id,
        rating: 4.9,
        numReviews: 76,
        startingPrice: 850,
        isFeatured: true,
      },
      {
        name: 'South Bombay Haven Hostel - Colaba',
        description: 'Convenient travelers hostel in Colaba, South Mumbai. Just 5 minutes walk from Gateway of India, featuring clean AC dorms and shared study space.',
        location: {
          address: 'Arthur Bunder Road, Colaba',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400005',
          landmark: 'Near Radio Club & Gateway of India',
        },
        images: [
          '/images/hostels/hostel-11/building.jpg',
          '/images/hostels/hostel-11/room.jpg',
          '/images/hostels/hostel-11/beds.jpg',
          '/images/hostels/hostel-11/bathroom.jpg',
          '/images/hostels/hostel-11/common.jpg',
          '/images/hostels/hostel-11/corridor.jpg',
        ],
        amenities: ['Wi-Fi', 'AC', 'Locker', 'Laundry', 'Breakfast', 'CCTV', '24/7 Reception', 'Coworking Space'],
        rules: ['Check-in after 2 PM', 'No outside drinks in dorms', 'Luggage drop-off free of charge'],
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
        contactInfo: { phone: '+91 98450 12355', email: 'mumbai.colaba@stayguard.com' },
        owner: primaryOwner._id,
        rating: 4.8,
        numReviews: 38,
        startingPrice: 1200,
        isFeatured: false,
      },
      {
        name: 'Connaught Place Central Hub & PG - Delhi',
        description: 'Prime central location in Connaught Place, New Delhi. Perfect for students and solo travelers with air-conditioned dorms, individual lockers, metro access, and high-speed Wi-Fi.',
        location: {
          address: 'M-Block, Connaught Circus',
          city: 'Delhi',
          state: 'Delhi NCR',
          pincode: '110001',
          landmark: 'Near Rajiv Chowk Metro Gate 6',
        },
        images: [
          '/images/hostels/hostel-12/building.jpg',
          '/images/hostels/hostel-12/room.jpg',
          '/images/hostels/hostel-12/beds.jpg',
          '/images/hostels/hostel-12/bathroom.jpg',
          '/images/hostels/hostel-12/common.jpg',
          '/images/hostels/hostel-12/corridor.jpg',
        ],
        amenities: ['Wi-Fi', 'AC', 'Locker', 'Laundry', 'Breakfast', 'CCTV', '24/7 Reception', 'Coworking Space'],
        rules: ['Silent dorm atmosphere after 10:30 PM', 'No parties inside rooms', 'Safe locker keys provided'],
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in.',
        contactInfo: { phone: '+91 98450 12356', email: 'delhi.cp@stayguard.com' },
        owner: primaryOwner._id,
        rating: 4.7,
        numReviews: 45,
        startingPrice: 1350,
        isFeatured: false,
      },
    ];

    const hostelDocs = [];
    for (const h of hostelSeedList) {
      const hostel = await Hostel.create(h);
      hostelDocs.push(hostel);
    }

    console.log(`🛏️ Creating 40+ Luxury AC Rooms for all 12 Hostels...`);

    const roomTypesConfig = [
      { roomType: 'Private Room', capacity: 2, priceMultiplier: 2.6, name: 'Deluxe Private AC Suite' },
      { roomType: '4 Bed Dorm', capacity: 4, priceMultiplier: 1.5, name: '4-Bed Premium AC Dorm' },
      { roomType: '6 Bed Dorm', capacity: 6, priceMultiplier: 1.2, name: '6-Bed Luxury AC Dorm' },
      { roomType: '8 Bed Dorm', capacity: 8, priceMultiplier: 1.0, name: '8-Bed Executive AC Dorm' },
    ];

    const roomDocs = [];
    for (let hIdx = 0; hIdx < hostelDocs.length; hIdx++) {
      const h = hostelDocs[hIdx];
      const basePrice = h.startingPrice || 1200;

      for (let rIdx = 0; rIdx < roomTypesConfig.length; rIdx++) {
        const rConf = roomTypesConfig[rIdx];
        const roomPrice = Math.round((basePrice * rConf.priceMultiplier) / 50) * 50;
        const roomNumber = `${101 + hIdx * 10 + rIdx}`;

        const room = await Room.create({
          hostel: h._id,
          roomNumber,
          roomType: rConf.roomType,
          capacity: rConf.capacity,
          price: roomPrice,
          availableBeds: rConf.capacity,
          amenities: [
            '24/7 Climate Control AC',
            'High-Speed Optic Wi-Fi (300 Mbps)',
            'Personal Reading Lamp & USB Sockets',
            'Under-bed Electronic Safe Locker',
            'Luxury Spring Mattress & Cotton Linen',
            'Ensuite AC Bathroom with Hot Shower',
          ],
          isAvailable: true,
          image: rConf.roomType.includes('Private') ? (h.images[1] || h.images[0]) : (h.images[2] || h.images[1] || h.images[0]),
        });
        roomDocs.push(room);
      }
    }

    console.log(`📋 Generating 65+ Realistic Bookings & Payments across recent months...`);

    const bookingStatuses = ['Confirmed', 'Confirmed', 'Confirmed', 'Completed', 'Completed', 'Cancelled', 'Pending'];
    const paymentMethods = ['UPI / Google Pay', 'Razorpay UPI (Test)', 'Credit Card (Visa)', 'Debit Card (Mastercard)', 'Net Banking'];

    const bookingDocs = [];
    const nowTime = Date.now();

    for (let i = 0; i < 68; i++) {
      const customer = customerDocs[i % customerDocs.length];
      const hostel = hostelDocs[i % hostelDocs.length];
      // Filter rooms for this hostel
      const hRooms = roomDocs.filter((r) => r.hostel.toString() === hostel._id.toString());
      const room = hRooms[i % hRooms.length];

      // Stagger dates from past 90 days to upcoming 30 days
      const daysOffset = (i % 30) - 20; // some past, some recent, some future
      const checkIn = new Date(nowTime + daysOffset * 24 * 3600 * 1000);
      const stayNights = (i % 4) + 1;
      const checkOut = new Date(checkIn.getTime() + stayNights * 24 * 3600 * 1000);
      const guests = (i % 2) + 1;

      const baseAmount = room.price * stayNights * guests;
      const taxes = Math.round(baseAmount * 0.12);
      const totalAmount = baseAmount + taxes;

      const rawStatus = bookingStatuses[i % bookingStatuses.length];
      let bStatus = rawStatus;
      if (checkOut < new Date() && rawStatus === 'Confirmed') {
        bStatus = 'Completed';
      }

      let pStatus = 'Paid';
      if (bStatus === 'Cancelled') {
        pStatus = i % 2 === 0 ? 'Refunded' : 'Failed';
      } else if (bStatus === 'Pending') {
        pStatus = 'Pending';
      }

      const booking = await Booking.create({
        customer: customer._id,
        hostel: hostel._id,
        room: room._id,
        checkIn,
        checkOut,
        guests,
        nights: stayNights,
        amount: baseAmount,
        taxes,
        totalAmount,
        paymentStatus: pStatus,
        bookingStatus: bStatus,
        specialRequests: i % 3 === 0 ? 'Late check-in around 10 PM. Please provide bottom bunk if possible.' : '',
        guestDetails: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
        createdAt: new Date(checkIn.getTime() - 5 * 24 * 3600 * 1000),
      });

      bookingDocs.push(booking);

      // Create Payment transaction record if Paid or Refunded
      if (pStatus === 'Paid' || pStatus === 'Refunded') {
        await Payment.create({
          booking: booking._id,
          customer: customer._id,
          hostel: hostel._id,
          paymentId: `pay_rzp_test_${100000 + i}`,
          razorpayOrderId: `order_rzp_test_${200000 + i}`,
          razorpayPaymentId: `pay_rzp_test_${100000 + i}`,
          razorpaySignature: `sig_${Math.random().toString(36).substring(2, 15)}`,
          amount: totalAmount,
          currency: 'INR',
          method: paymentMethods[i % paymentMethods.length],
          status: pStatus,
          createdAt: booking.createdAt,
        });
      }
    }

    console.log(`⭐ Adding 35+ Genuine Guest Reviews with Owner Responses...`);

    const sampleReviews = [
      {
        rating: 5,
        comment: 'Absolute gem of a place! The Wi-Fi is super quick for remote work, cleanliness is top notch, and the staff is extraordinarily helpful. Made great friends during the rooftop evening.',
        reply: 'Thank you so much Rohan! It was an absolute pleasure hosting you. Hope to see you again soon on your next trip!',
      },
      {
        rating: 5,
        comment: 'Best hostel experience in the city! Clean sheets, spacious lockers, hot showers, and a very safe environment for solo female travelers.',
        reply: 'We really appreciate your kind words! Ensuring safe, hygienic, and comfortable stays for solo travelers is our top priority.',
      },
      {
        rating: 4,
        comment: 'Great value for money. AC was chilling and breakfast was yummy. Metro station is only 5 mins walking distance.',
        reply: 'Thanks for staying with us! Glad you enjoyed the breakfast and convenient location.',
      },
      {
        rating: 5,
        comment: 'The vibe here is incredible. Met fellow travelers from all across India and abroad. The community cafe has delicious cold brew.',
        reply: 'Awesome to hear! We love bringing travelers together. Have a safe journey ahead!',
      },
      {
        rating: 4,
        comment: 'Super clean dorms and very fast check-in. The pod beds give great privacy with individual curtains and reading lamps.',
        reply: 'Thank you for your review! We look forward to welcoming you back.',
      },
      {
        rating: 5,
        comment: 'The location is unbeatable! Walking distance to all major cafes and attractions. Will definitely stay here again next time.',
        reply: 'Thank you! Excited to host you again whenever you visit.',
      },
    ];

    for (let i = 0; i < 36; i++) {
      const customer = customerDocs[i % customerDocs.length];
      const hostel = hostelDocs[i % hostelDocs.length];
      const revData = sampleReviews[i % sampleReviews.length];

      await Review.create({
        customer: customer._id,
        hostel: hostel._id,
        rating: revData.rating,
        comment: revData.comment,
        ownerReply: {
          reply: revData.reply,
          repliedAt: new Date(),
        },
        createdAt: new Date(Date.now() - (i + 1) * 2 * 24 * 3600 * 1000),
      });
    }

    console.log(`🔔 Creating realistic in-app Notifications for Owner & Demo Customer...`);

    const ownerNotifs = [
      {
        recipient: primaryOwner._id,
        title: 'New Booking Confirmed',
        message: 'Rohan Mehra confirmed booking for 4-Bed Premium AC Dorm at The Hyderabad Luxury AC Backpackers Haven.',
        type: 'booking',
        isRead: false,
        link: '/owner/bookings',
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago
      },
      {
        recipient: primaryOwner._id,
        title: 'Payment Received',
        message: '₹4,032 received via Razorpay UPI for booking #STAY89214.',
        type: 'payment',
        isRead: false,
        link: '/owner/payments',
        createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
      },
      {
        recipient: primaryOwner._id,
        title: 'New 5-Star Review ⭐',
        message: 'Ananya Deshmukh left a 5-star review for Goa Coastal Gypsy Luxury AC Beach Resort & Hostel.',
        type: 'review',
        isRead: false,
        link: '/owner/reviews',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000), // 2 hours ago
      },
      {
        recipient: primaryOwner._id,
        title: 'Occupancy Alert 🏨',
        message: 'The Hyderabad Luxury AC Backpackers Haven is currently at 85% bed occupancy for this weekend.',
        type: 'system',
        isRead: true,
        link: '/owner/dashboard',
        createdAt: new Date(Date.now() - 24 * 3600 * 1000), // 1 day ago
      },
    ];

    const customerNotifs = [
      {
        recipient: demoCustomer._id,
        title: 'Booking Confirmed 🎉',
        message: 'Your stay at The Hyderabad Luxury AC Backpackers Haven is confirmed! View and print your pass.',
        type: 'booking',
        isRead: false,
        link: '/my-bookings',
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
      },
      {
        recipient: demoCustomer._id,
        title: 'Payment Successful',
        message: 'Payment of ₹2,016 received with reference #PAY_98241.',
        type: 'payment',
        isRead: false,
        link: '/my-bookings',
        createdAt: new Date(Date.now() - 20 * 60 * 1000), // 20 mins ago
      },
      {
        recipient: demoCustomer._id,
        title: 'Hostel Replied to Your Review',
        message: 'Vikram Sharma from The Hyderabad Luxury AC Backpackers Haven replied to your feedback.',
        type: 'review',
        isRead: true,
        link: `/hostels/${hostelDocs[0]._id}`,
        createdAt: new Date(Date.now() - 5 * 3600 * 1000), // 5 hours ago
      },
      {
        recipient: demoCustomer._id,
        title: 'Welcome to STAYGUARD! 🛡️',
        message: 'Explore verified luxury AC hostels across 7 top Indian destinations with instant confirmation.',
        type: 'system',
        isRead: true,
        link: '/explore',
        createdAt: new Date(Date.now() - 48 * 3600 * 1000), // 2 days ago
      },
    ];

    for (const notif of [...ownerNotifs, ...customerNotifs]) {
      await Notification.create(notif);
    }

    console.log('✅ Demo data seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('🔑 DEMO ACCOUNTS:');
    console.log('👉 Hostel Owner : owner@stayguard.com    / password123');
    console.log('👉 Demo Customer: customer@stayguard.com / password123');
    console.log('----------------------------------------------------');

    if (process.argv[2] === '-i') {
      process.exit();
    }
    return { success: true };
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    if (process.argv[2] === '-i') process.exit(1);
    throw error;
  }
};

const destroyData = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    await User.deleteMany();
    await Hostel.deleteMany();
    await Room.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await Review.deleteMany();
    await Notification.deleteMany();
    console.log('🗑️ All database records destroyed!');
    process.exit();
  } catch (error) {
    console.error('❌ Destroy Error:', error);
    process.exit(1);
  }
};

module.exports = { seedData, destroyData };

if (require.main === module) {
  if (process.argv[2] === '-d') {
    destroyData();
  } else {
    seedData();
  }
}

