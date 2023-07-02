import multer from "multer";

const multerImageHandler = multer({
  storage: multer.diskStorage({}),
});

export default multerImageHandler;
