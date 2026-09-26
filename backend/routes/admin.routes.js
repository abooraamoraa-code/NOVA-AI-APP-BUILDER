const express = require("express");

const supabase = require("../config/supabase");

const {
  requireAdmin
} = require("../middleware/admin.middleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| NOVA AI
| ADMIN ROUTES
|--------------------------------------------------------------------------
| جميع المسارات هنا محمية بواسطة requireAdmin.
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Admin Status
|--------------------------------------------------------------------------
| GET /api/admin/status
|--------------------------------------------------------------------------
*/

router.get(
  "/status",
  requireAdmin,
  async (req, res) => {
    try {
      res.json({
        success: true,
        service:
          "NOVA Admin",
        status:
          "authorized",
        admin: {
          id:
            req.auth.userId,
          email:
            req.auth.email,
          role:
            req.auth.profile.role
        }
      });
    } catch (error) {
      console.error(
        "[ADMIN STATUS ERROR]",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "ADMIN_STATUS_ERROR"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Admin Profile
|--------------------------------------------------------------------------
| GET /api/admin/profile
|--------------------------------------------------------------------------
*/

router.get(
  "/profile",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        data,
        error
      } =
        await supabase
          .from("profiles")
          .select(
            "id, email, display_name, avatar_url, role, free_credits, paid_credits, created_at, updated_at"
          )
          .eq(
            "id",
            req.auth.userId
          )
          .single();

      if (error) {
        return res.status(500).json({
          success: false,
          error:
            "PROFILE_FETCH_FAILED"
        });
      }

      res.json({
        success: true,
        profile:
          data
      });

    } catch (error) {
      console.error(
        "[ADMIN PROFILE ERROR]",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "SERVER_ERROR"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Dashboard Statistics
|--------------------------------------------------------------------------
| GET /api/admin/dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",
  requireAdmin,
  async (req, res) => {
    try {
      const [
        profilesResult,
        projectsResult,
        paymentsResult,
        aiRequestsResult,
        licensesResult
      ] =
        await Promise.all([
          supabase
            .from("profiles")
            .select(
              "id",
              {
                count:
                  "exact",
                head:
                  true
              }
            ),

          supabase
            .from("projects")
            .select(
              "id",
              {
                count:
                  "exact",
                head:
                  true
              }
            ),

          supabase
            .from("payments")
            .select(
              "id",
              {
                count:
                  "exact",
                head:
                  true
              }
            ),

          supabase
            .from("ai_requests")
            .select(
              "id",
              {
                count:
                  "exact",
                head:
                  true
              }
            ),

          supabase
            .from("license_codes")
            .select(
              "id",
              {
                count:
                  "exact",
                head:
                  true
              }
            )
        ]);

      res.json({
        success: true,
        statistics: {
          users:
            profilesResult.count ||
            0,

          projects:
            projectsResult.count ||
            0,

          payments:
            paymentsResult.count ||
            0,

          aiRequests:
            aiRequestsResult.count ||
            0,

          licenseCodes:
            licensesResult.count ||
            0
        }
      });

    } catch (error) {
      console.error(
        "[ADMIN DASHBOARD ERROR]",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "DASHBOARD_ERROR"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| List Users
|--------------------------------------------------------------------------
| GET /api/admin/users
|--------------------------------------------------------------------------
*/

router.get(
  "/users",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        data,
        error
      } =
        await supabase
          .from("profiles")
          .select(
            "id, email, display_name, avatar_url, role, free_credits, paid_credits, created_at, updated_at"
          )
          .order(
            "created_at",
            {
              ascending:
                false
            }
          )
          .limit(200);

      if (error) {
        console.error(
          "[ADMIN USERS]",
          error
        );

        return res.status(500).json({
          success: false,
          error:
            "USERS_FETCH_FAILED"
        });
      }

      res.json({
        success: true,
        total:
          data?.length || 0,
        users:
          data || []
      });

    } catch (error) {
      console.error(
        "[ADMIN USERS ERROR]",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "SERVER_ERROR"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| List Projects
|--------------------------------------------------------------------------
| GET /api/admin/projects
|--------------------------------------------------------------------------
*/

router.get(
  "/projects",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        data,
        error
      } =
        await supabase
          .from("projects")
          .select(
            "id, user_id, name, description, status, prompt, created_at, updated_at"
          )
          .order(
            "created_at",
            {
              ascending:
                false
            }
          )
          .limit(200);

      if (error) {
        return res.status(500).json({
          success: false,
          error:
            "PROJECTS_FETCH_FAILED"
        });
      }

      res.json({
        success: true,
        total:
          data?.length || 0,
        projects:
          data || []
      });

    } catch (error) {
      console.error(
        "[ADMIN PROJECTS ERROR]",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "SERVER_ERROR"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| List Payments
|--------------------------------------------------------------------------
| GET /api/admin/payments
|--------------------------------------------------------------------------
*/

router.get(
  "/payments",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        data,
        error
      } =
        await supabase
          .from("payments")
          .select(
            "id, user_id, plan_id, amount, currency, status, payment_reference, created_at, updated_at"
          )
          .order(
            "created_at",
            {
              ascending:
                false
            }
          )
          .limit(200);

      if (error) {
        return res.status(500).json({
          success: false,
          error:
            "PAYMENTS_FETCH_FAILED"
        });
      }

      res.json({
        success: true,
        total:
          data?.length || 0,
        payments:
          data || []
      });

    } catch (error) {
      console.error(
        "[ADMIN PAYMENTS ERROR]",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "SERVER_ERROR"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| List AI Requests
|--------------------------------------------------------------------------
| GET /api/admin/ai-requests
|--------------------------------------------------------------------------
*/

router.get(
  "/ai-requests",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        data,
        error
      } =
        await supabase
          .from("ai_requests")
          .select(
            "id, user_id, project_id, provider, model, status, input_tokens, output_tokens, total_tokens, error_message, created_at, updated_at"
          )
          .order(
            "created_at",
            {
              ascending:
                false
            }
          )
          .limit(200);

      if (error) {
        return res.status(500).json({
          success: false,
          error:
            "AI_REQUESTS_FETCH_FAILED"
        });
      }

      res.json({
        success: true,
        total:
          data?.length || 0,
        requests:
          data || []
      });

    } catch (error) {
      console.error(
        "[ADMIN AI REQUESTS ERROR]",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "SERVER_ERROR"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| List License Codes
|--------------------------------------------------------------------------
| GET /api/admin/licenses
|--------------------------------------------------------------------------
*/

router.get(
  "/licenses",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        data,
        error
      } =
        await supabase
          .from("license_codes")
          .select(
            "id, credits, price, active, used_by, used_at, created_at"
          )
          .order(
            "created_at",
            {
              ascending:
                false
            }
          )
          .limit(200);

      if (error) {
        return res.status(500).json({
          success: false,
          error:
            "LICENSES_FETCH_FAILED"
        });
      }

      /*
      |--------------------------------------------------------------------------
      | لا نرسل code_hash للواجهة.
      |--------------------------------------------------------------------------
      */

      res.json({
        success: true,
        total:
          data?.length || 0,
        licenses:
          data || []
      });

    } catch (error) {
      console.error(
        "[ADMIN LICENSES ERROR]",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "SERVER_ERROR"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| List Admin Logs
|--------------------------------------------------------------------------
| GET /api/admin/logs
|--------------------------------------------------------------------------
*/

router.get(
  "/logs",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        data,
        error
      } =
        await supabase
          .from("admin_logs")
          .select(
            "id, admin_id, action, target_type, target_id, details, created_at"
          )
          .order(
            "created_at",
            {
              ascending:
                false
            }
          )
          .limit(200);

      if (error) {
        return res.status(500).json({
          success: false,
          error:
            "LOGS_FETCH_FAILED"
        });
      }

      res.json({
        success: true,
        total:
          data?.length || 0,
        logs:
          data || []
      });

    } catch (error) {
      console.error(
        "[ADMIN LOGS ERROR]",
        error
      );

      res.status(500).json({
        success: false,
        error:
          "SERVER_ERROR"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = router;
