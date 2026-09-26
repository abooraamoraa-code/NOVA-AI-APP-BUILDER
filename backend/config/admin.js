/*
|--------------------------------------------------------------------------
| NOVA AI APP BUILDER
| Admin Configuration
|--------------------------------------------------------------------------
*/

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "";

const ADMIN_SECRET =
  process.env.ADMIN_SECRET || "";

/*
|--------------------------------------------------------------------------
| Configuration Status
|--------------------------------------------------------------------------
*/

function isAdminConfigured() {
  return Boolean(
    ADMIN_EMAIL.trim() &&
    ADMIN_SECRET.trim()
  );
}

/*
|--------------------------------------------------------------------------
| Get Admin Configuration
|--------------------------------------------------------------------------
| لا نعيد السر الحقيقي إلى الواجهة.
|--------------------------------------------------------------------------
*/

function getAdminConfig() {
  return {
    configured:
      isAdminConfigured(),

    email:
      ADMIN_EMAIL || null,

    hasSecret:
      Boolean(
        ADMIN_SECRET
      )
  };
}

/*
|--------------------------------------------------------------------------
| Check Admin Email
|--------------------------------------------------------------------------
*/

function isAdminEmail(email) {
  if (!email) {
    return false;
  }

  return (
    email.toLowerCase().trim() ===
    ADMIN_EMAIL.toLowerCase().trim()
  );
}

/*
|--------------------------------------------------------------------------
| Validate Admin Secret
|--------------------------------------------------------------------------
*/

function validateAdminSecret(
  secret
) {
  if (
    !secret ||
    !ADMIN_SECRET
  ) {
    return false;
  }

  return secret ===
    ADMIN_SECRET;
}

/*
|--------------------------------------------------------------------------
| Require Configuration
|--------------------------------------------------------------------------
*/

function requireAdminConfig() {
  if (!isAdminConfigured()) {
    const error =
      new Error(
        "Admin configuration is missing"
      );

    error.code =
      "ADMIN_CONFIG_MISSING";

    throw error;
  }
}

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
  isAdminConfigured,
  getAdminConfig,
  isAdminEmail,
  validateAdminSecret,
  requireAdminConfig
};
