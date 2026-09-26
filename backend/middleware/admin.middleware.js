const supabase = require("../config/supabase");

/*
|--------------------------------------------------------------------------
| NOVA AI
| Admin Security Middleware
|--------------------------------------------------------------------------
| حماية جميع مسارات الإدارة من جهة الخادم.
|--------------------------------------------------------------------------
*/

async function requireAdmin(
  req,
  res,
  next
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | 1. قراءة Authorization Header
    |--------------------------------------------------------------------------
    */

    const authorization =
      req.headers.authorization;

    if (
      !authorization ||
      !authorization.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        success: false,
        error:
          "AUTHORIZATION_REQUIRED",
        message:
          "يجب تسجيل الدخول أولًا"
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 2. استخراج Access Token
    |--------------------------------------------------------------------------
    */

    const token =
      authorization
        .slice(7)
        .trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        error:
          "TOKEN_REQUIRED"
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 3. التحقق من المستخدم عبر Supabase Auth
    |--------------------------------------------------------------------------
    */

    const {
      data: userData,
      error: userError
    } =
      await supabase.auth.getUser(
        token
      );

    if (
      userError ||
      !userData?.user
    ) {
      return res.status(401).json({
        success: false,
        error:
          "INVALID_SESSION",
        message:
          "جلسة الدخول غير صالحة"
      });
    }

    const user =
      userData.user;

    /*
    |--------------------------------------------------------------------------
    | 4. قراءة Profile المستخدم
    |--------------------------------------------------------------------------
    */

    const {
      data: profile,
      error: profileError
    } =
      await supabase
        .from("profiles")
        .select(
          "id, email, display_name, role"
        )
        .eq(
          "id",
          user.id
        )
        .maybeSingle();

    if (profileError) {
      console.error(
        "[ADMIN AUTH] Profile error:",
        profileError.message
      );

      return res.status(500).json({
        success: false,
        error:
          "PROFILE_CHECK_FAILED"
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 5. يجب أن يكون هناك Profile
    |--------------------------------------------------------------------------
    */

    if (!profile) {
      return res.status(403).json({
        success: false,
        error:
          "PROFILE_NOT_FOUND",
        message:
          "لا يوجد ملف مستخدم مرتبط بهذا الحساب"
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 6. التحقق من صلاحية Admin
    |--------------------------------------------------------------------------
    */

    if (
      profile.role !==
      "admin"
    ) {
      return res.status(403).json({
        success: false,
        error:
          "ADMIN_ACCESS_DENIED",
        message:
          "ليس لديك صلاحية الوصول إلى لوحة الإدارة"
      });
    }

    /*
    |--------------------------------------------------------------------------
    | 7. تخزين بيانات المستخدم الموثق
    |--------------------------------------------------------------------------
    */

    req.auth = {
      userId:
        user.id,

      email:
        user.email,

      profile: {
        id:
          profile.id,

        displayName:
          profile.display_name,

        role:
          profile.role
      }
    };

    /*
    |--------------------------------------------------------------------------
    | 8. السماح بالمرور
    |--------------------------------------------------------------------------
    */

    next();

  } catch (error) {
    console.error(
      "[ADMIN MIDDLEWARE ERROR]",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "ADMIN_SECURITY_ERROR"
    });
  }
}

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
  requireAdmin
};
