const express = require("express");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
| سيتم ربط هذه المسارات مع Supabase Auth.
|--------------------------------------------------------------------------
*/

router.get("/status", (req, res) => {
  res.json({
    success: true,
    service: "authentication",
    status: "ready"
  });
});

module.exports = router;
