const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let queryFilter = { _id: req.params.id };

    // admin, hod can delete any one's document but normal user can only delete his own documents
    if (
      (req.user.role !== 'admin' ||
        req.user.role !== 'hod') &&
      Model.collection.collectionName !== 'schedules'
    ) {
      queryFilter = {
        _id: req.params.id,
        user: req.user.id,
      };
    }

    const doc = await Model.findOneAndDelete(queryFilter);

    if (!doc) {
      return next(
        new AppError('No document found with that ID', 404)
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let queryFilter = { _id: req.params.id };

    // admin, hod can update any one's document but normal user can only update his own documents
    if (
      (req.user.role !== 'admin' ||
        req.user.role !== 'hod') &&
      Model.collection.collectionName !== 'schedules'
    ) {
      queryFilter = {
        _id: req.params.id,
        user: req.user.id,
      };
    }
    const doc = await Model.findOneAndUpdate(
      queryFilter,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!doc) {
      return next(
        new AppError('No document found with that ID', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(
        new AppError('No document found with that ID', 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET responses on post (hack)
    let filter = {};
    if (req.params.postId)
      filter = { post: req.params.postId };
    if (req.params.userId)
      filter = { user: req.params.userId };
    if (Model.collection.collectionName === 'responses') {
      filter = { ...filter, parentResponse: { $eq: null } };
    }

    const features = new APIFeatures(
      Model.find(filter),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
