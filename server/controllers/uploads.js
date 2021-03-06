const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new aws.S3({region: 'us-west-2'});

module.exports.upload = multer({

  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET,
    acl: 'public-read',
    metadata(req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key(req, file, cb) {
      cb(null, Date.now().toString() + '.png');
    }
  })
});

module.exports.create = (req, res) => {
  res.status(200).send(req.file);
};

