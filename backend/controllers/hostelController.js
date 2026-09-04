const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Review = require('../models/Review');

// @desc    Get all hostels with filters, search, and sorting
// @route   GET /api/hostels
// @access  Public
const getAllHostels = async (req, res, next) => {
  try {
    const {
      search,
      city,
      minPrice,
      maxPrice,
      rating,
      amenities,
      sort,
      isFeatured,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // Search keyword
    if (search && typeof search === 'string' && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { 'location.city': { $regex: s, $options: 'i' } },
        { 'location.state': { $regex: s, $options: 'i' } },
        { 'location.address': { $regex: s, $options: 'i' } },
        { 'location.landmark': { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
      ];
    }

    // City filter
    if (
      city &&
      typeof city === 'string' &&
      city.trim() &&
      city.trim().toLowerCase() !== 'all' &&
      city.trim().toLowerCase() !== 'all cities'
    ) {
      query['location.city'] = { $regex: new RegExp(`^${city.trim()}$`, 'i') };
    }

    // Rating filter
    if (rating && !isNaN(Number(rating)) && Number(rating) > 0) {
      query.rating = { $gte: Number(rating) };
    }

    // Price filter
    const minP = minPrice && !isNaN(Number(minPrice)) ? Number(minPrice) : null;
    const maxP = maxPrice && !isNaN(Number(maxPrice)) ? Number(maxPrice) : null;
    if (minP !== null || maxP !== null) {
      query.startingPrice = {};
      if (minP !== null && minP > 0) query.startingPrice.$gte = minP;
      if (maxP !== null && maxP > 0) query.startingPrice.$lte = maxP;
      if (Object.keys(query.startingPrice).length === 0) delete query.startingPrice;
    }

    // Amenities filter
    if (amenities) {
      const amenitiesList = (Array.isArray(amenities)
        ? amenities
        : typeof amenities === 'string'
        ? amenities.split(',')
        : []
      )
        .map((a) => (typeof a === 'string' ? a.trim() : ''))
        .filter(Boolean);

      if (amenitiesList.length > 0) {
        query.amenities = { $all: amenitiesList };
      }
    }

    // Featured filter
    if (isFeatured !== undefined && isFeatured !== '') {
      query.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortOptions = { startingPrice: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { startingPrice: -1 };
    } else if (sort === 'rating_desc') {
      sortOptions = { rating: -1 };
    } else if (sort === 'recommended') {
      sortOptions = { isFeatured: -1, rating: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Hostel.countDocuments(query);
    const hostels = await Hostel.find(query)
      .populate('owner', 'name email phone')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Batch populate rooms for the current page of hostels
    const hostelIds = hostels.map((h) => h._id);
    const allRooms = await Room.find({ hostel: { $in: hostelIds } });

    const hostelsWithRooms = hostels.map((hostel) => {
      const hObj = hostel.toObject();
      hObj.rooms = allRooms.filter((r) => r.hostel.toString() === hostel._id.toString());
      return hObj;
    });

    res.json({
      success: true,
      count: hostelsWithRooms.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: hostelsWithRooms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hostel by ID with rooms & reviews
// @route   GET /api/hostels/:id
// @access  Public
const getHostelById = async (req, res, next) => {
  try {
    const hostel = await Hostel.findById(req.params.id).populate('owner', 'name email phone profileImage');

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Fetch rooms for this hostel
    const rooms = await Room.find({ hostel: hostel._id });

    // Fetch reviews for this hostel
    const reviews = await Review.find({ hostel: hostel._id })
      .populate('customer', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        ...hostel.toObject(),
        rooms,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get hostels owned by current owner
// @route   GET /api/hostels/owner/my-hostels
// @access  Private (Owner)
const getOwnerHostels = async (req, res, next) => {
  try {
    const hostels = await Hostel.find({ owner: req.user._id }).sort({ createdAt: -1 });

    // Fetch room counts for each hostel
    const hostelsWithRoomCount = await Promise.all(
      hostels.map(async (hostel) => {
        const roomCount = await Room.countDocuments({ hostel: hostel._id });
        return {
          ...hostel.toObject(),
          roomCount,
        };
      })
    );

    res.json({
      success: true,
      count: hostelsWithRoomCount.length,
      data: hostelsWithRoomCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new hostel
// @route   POST /api/hostels
// @access  Private (Owner/Admin)
const createHostel = async (req, res, next) => {
  try {
    const {
      name,
      description,
      location,
      images,
      amenities,
      rules,
      cancellationPolicy,
      contactInfo,
      startingPrice,
      isFeatured,
    } = req.body;

    const hostel = await Hostel.create({
      name,
      description,
      location,
      images: images || [],
      amenities: amenities || [],
      rules: rules || [],
      cancellationPolicy: cancellationPolicy || 'Free cancellation up to 24 hours before check-in.',
      contactInfo: contactInfo || { phone: req.user.phone, email: req.user.email },
      startingPrice: startingPrice || 499,
      isFeatured: isFeatured || false,
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Hostel created successfully',
      data: hostel,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing hostel
// @route   PUT /api/hostels/:id
// @access  Private (Owner/Admin)
const updateHostel = async (req, res, next) => {
  try {
    let hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Check ownership
    if (hostel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this hostel' });
    }

    hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Hostel updated successfully',
      data: hostel,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a hostel and associated rooms
// @route   DELETE /api/hostels/:id
// @access  Private (Owner/Admin)
const deleteHostel = async (req, res, next) => {
  try {
    const hostel = await Hostel.findById(req.params.id);

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Check ownership
    if (hostel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this hostel' });
    }

    // Delete associated rooms
    await Room.deleteMany({ hostel: hostel._id });
    await hostel.deleteOne();

    res.json({
      success: true,
      message: 'Hostel and associated rooms deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categorized images belonging strictly to a specific hostel
// @route   GET /api/hostels/:id/images
// @access  Public
const getHostelImages = async (req, res, next) => {
  try {
    const hostel = await Hostel.findById(req.params.id).select('name images');
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    const imgList = hostel.images || [];
    const imageCategories = ['exterior', 'room', 'beds', 'bathroom', 'commonArea', 'lounge'];
    
    const structuredImages = imgList.map((url, idx) => ({
      type: imageCategories[idx] || `photo_${idx + 1}`,
      url,
    }));

    const categorized = {
      exterior: imgList[0] || null,
      room: imgList[1] || null,
      beds: imgList[2] || null,
      bathroom: imgList[3] || null,
      commonArea: imgList[4] || null,
      lounge: imgList[5] || null,
      all: imgList,
      images: structuredImages,
    };

    res.json({
      success: true,
      hostelId: hostel._id,
      hostelName: hostel.name,
      totalPhotos: imgList.length,
      data: categorized,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllHostels,
  getHostelById,
  getHostelImages,
  getOwnerHostels,
  createHostel,
  updateHostel,
  deleteHostel,
};
