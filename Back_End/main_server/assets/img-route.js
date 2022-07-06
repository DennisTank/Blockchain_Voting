const multer = require("multer");

class ImgRoute {
  router = multer({
    storage: multer.diskStorage({
      destination: `./assets/images`,
      filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}.png`);
      },
    }),
  });

  uploadPI = this.router.single("option");

  UploadProfileImage = (req, res) => {
    this.uploadPI(req, res, (err) => {
      if (err) {
        res.send({
          success: false,
        });
      } else {
        res.send({ success: true, url: `/images/${res.req.file.filename}` });
      }
    });
  };
}
module.exports = ImgRoute;
