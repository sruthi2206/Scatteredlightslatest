
import { Router } from "express";
import { triggerWebhook } from "./webhooks";

const router = Router();

// Test webhook endpoint (for development/testing)
router.post("/api/webhooks/test", async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { event, userData } = req.body;
    
    await triggerWebhook(event || 'user.registered', userData || {
      id: 999,
      username: 'test-user',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, message: "Test webhook sent" });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
});

// Webhook status endpoint
router.get("/api/webhooks/status", (req, res) => {
  if (!req.isAuthenticated() || !req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }

  const webhookUrl = process.env.USER_REGISTRATION_WEBHOOK_URL;
  const hasSecret = !!process.env.WEBHOOK_SECRET;
  
  res.json({
    configured: !!webhookUrl,
    url: webhookUrl ? `${webhookUrl.substring(0, 20)}...` : null,
    hasSecret,
    events: ['user.registered']
  });
});

export default router;
