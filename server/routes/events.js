'use strict';
const express = require('express');
const router = express.Router();
const EventController = require('../controllers').Events;

router.route('/')
  .post(EventController.create)
  .get(EventController.getAll);

router.route('/users')
  .get(EventController.getEventsByContributor);

router.route('/recipient')
  .get(EventController.getRecipientEvents);

router.route('/:id')
  .get(EventController.getById)
  .put(EventController.update);

module.exports = router;
