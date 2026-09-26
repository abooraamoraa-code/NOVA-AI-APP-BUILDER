const express = require("express");
const supabase = require("../config/supabase");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| GET /api/auth/status
|--------------------------------------------------------------------------
*/

router.get("/status", (req, res) => {
  res.json({
    success: true,
    service: "authentication",
    status: "ready",
    provider: "Supabase Auth"
  });
});

/*
|--------------------------------------------------------------------------
| POST /api/auth/signup
|--------------------------------------------------------------------------
*/

router.post("/signup", async (req, res) => {
  try {
    const {
      email,
      password,
      displayName
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "EMAIL_AND_PASSWORD_REQUIRED"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "PASSWORD_TOO_SHORT",
        message:
          "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
      });
    }

    const {
      data,
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name:
            displayName || ""
        }
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: "SIGNUP_FAILED",
        message: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: "تم إنشاء الحساب بنجاح",
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email
          }
        : null,
      session: data.session
        ? {
            access_token:
              data.session.access_token,
            refresh_token:
              data.session.refresh_token
          }
        : null
    });

  } catch (error) {
    console.error(
      "[AUTH SIGNUP ERROR]",
      error
    );

    res.status(500).json({
      success: false,
      error: "SERVER_ERROR"
    });
  }
});

/*
|--------------------------------------------------------------------------
| POST /api/auth/login
|--------------------------------------------------------------------------
*/

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "EMAIL_AND_PASSWORD_REQUIRED"
      });
    }

    const {
      data,
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: "LOGIN_FAILED",
        message: error.message
      });
    }

    res.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email
          }
        : null,
      session: data.session
        ? {
            access_token:
              data.session.access_token,
            refresh_token:
              data.session.refresh_token
          }
        : null
    });

  } catch (error) {
    console.error(
      "[AUTH LOGIN ERROR]",
      error
    );

    res.status(500).json({
      success: false,
      error: "SERVER_ERROR"
    });
  }
});

/*
|--------------------------------------------------------------------------
| POST /api/auth/logout
|--------------------------------------------------------------------------
*/

router.post("/logout", async (req, res) => {
  try {
    const {
      error
    } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({
        success: false,
        error: "LOGOUT_FAILED",
        message: error.message
      });
    }

    res.json({
      success: true,
      message: "تم تسجيل الخروج"
    });

  } catch (error) {
    console.error(
      "[AUTH LOGOUT ERROR]",
      error
    );

    res.status(500).json({
      success: false,
      error: "SERVER_ERROR"
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET /api/auth/user
|--------------------------------------------------------------------------
*/

router.get("/user", async (req, res) => {
  try {
    const authorization =
      req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        error: "AUTHORIZATION_REQUIRED"
      });
    }

    const token =
      authorization.replace(
        "Bearer ",
        ""
      );

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "TOKEN_REQUIRED"
      });
    }

    const {
      data,
      error
    } = await supabase.auth.getUser(
      token
    );

    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        error: "INVALID_TOKEN"
      });
    }

    res.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at:
          data.user.created_at,
        last_sign_in_at:
          data.user.last_sign_in_at
      }
    });

  } catch (error) {
    console.error(
      "[AUTH USER ERROR]",
      error
    );

    res.status(500).json({
      success: false,
      error: "SERVER_ERROR"
    });
  }
});

/*
|--------------------------------------------------------------------------
| Export Router
|--------------------------------------------------------------------------
*/

module.exports = router;
