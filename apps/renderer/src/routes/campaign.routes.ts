// apps/renderer/src/routes/campaign.routes.ts

import { Router } from "express";

const router = Router();

router.post("/send-template", async (req, res) => {
	try {
		const {
			mode = "create",
			currentUserId,
			templateId,
			webServiceDomain,
			templateData,
			recipients: recipientsInput,
		} = req.body;

		// Basic validation
		if (!currentUserId || !templateId || !webServiceDomain || !templateData) {
			return res.status(400).json({
				error: "Missing required fields",
			});
		}

		if (!Array.isArray(recipientsInput) || recipientsInput.length === 0) {
			return res.status(400).json({
				error: "No valid recipients provided",
			});
		}

		// Fake request metadata
		const requestYear = new Date().getFullYear().toString();
		const requestId = `demo-${Date.now()}`;

		// Mock recipients response
		const recipients = recipientsInput.map((recipient: any) => ({
			recipientId: recipient.recipientId,
			email: recipient.email || "",
			templatePath: `${webServiceDomain}/videos/${requestYear}/${currentUserId}/${requestId}/${recipient.recipientId}`,
			status: "queued",
		}));

		// Placeholder response only
		return res.json({
			success: true,
			demoMode: true,
			mode,
			message:
				"This is a demo placeholder. No DB writes or email operations were executed.",
			requestId,
			requestYear,
			recipientsQueued: recipients.length,
			recipients,
		});
	} catch (error) {
		console.error("❌ Demo send-template error:", error);

		return res.status(500).json({
			error: "Internal server error",
		});
	}
});

export default router;