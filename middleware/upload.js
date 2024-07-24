require("dotenv").config(); // Mengimpor dotenv dan memuat variabel lingkungan

const { privateKey } = JSON.parse(process.env.FIREBASE_PRIVATE_KEY);
const multer = require("multer");
const firebaseAdmin = require("firebase-admin");
const path = require("path");

// Mengambil informasi dari file .env
const serviceAccount = {
  type: "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: privateKey.replace(/\\n/g, "\n"), // Mengganti \\n dengan \n
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI,
  token_uri: process.env.GOOGLE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
};

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  storageBucket: "dpsi-project-24-86690.appspot.com",
});

const bucket = firebaseAdmin.storage().bucket();

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
};

const uploadProfilePic = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 2 },
  fileFilter: fileFilter,
}).single("profilePic");

const uploadContent = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 2 },
  fileFilter: fileFilter,
}).single("contentFile");

// Fungsi untuk mengunggah file ke folder tertentu di Firebase Storage
const uploadToFirebase = (file, folder) => {
  return new Promise((resolve, reject) => {
    const blob = bucket.file(`${folder}/${Date.now()}-${file.originalname}`);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on("error", (err) => {
      reject(err);
    });

    blobStream.on("finish", () => {
      blob.makePublic().then(() => {
        resolve(blob.publicUrl());
      });
    });

    blobStream.end(file.buffer);
  });
};

// Middleware untuk menangani unggahan dan penyimpanan profile picture
const handleProfilePicUpload = (req, res, next) => {
  uploadProfilePic(req, res, async (err) => {
    if (err) {
      return res.status(400).send(err.message);
    }
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    try {
      const fileUrl = await uploadToFirebase(req.file, "profilePicture");
      req.file.firebaseUrl = fileUrl;
      next();
    } catch (error) {
      return res.status(500).send(error.message);
    }
  });
};

// Middleware untuk menangani unggahan dan penyimpanan content
const handleContentUpload = (req, res, next) => {
  uploadContent(req, res, async (err) => {
    if (err) {
      return res.status(400).send(err.message);
    }
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    try {
      const fileUrl = await uploadToFirebase(req.file, "content");
      req.file.firebaseUrl = fileUrl;
      next();
    } catch (error) {
      return res.status(500).send(error.message);
    }
  });
};

module.exports = {
  handleProfilePicUpload,
  handleContentUpload,
};
