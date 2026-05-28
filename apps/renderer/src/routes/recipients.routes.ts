// apps/renderer/src/routes/students.routes.ts

import { Router } from "express";
import { db } from "@mrws-core/db";

const router = Router();

// POST /recipients/join — Save a student when they join (Ignore if already exists)
router.post("/join", async (req, res) => {
	try {
		const { campaignUuid, recipientUuid, name, email } = req.body;

		if (!campaignUuid || !recipientUuid || !name) {
			return res.status(400).json({ error: "Missing required fields: campaignUuid, recipientUuid, name" });
		}

		const [result]: any = await db.query(
			`INSERT IGNORE INTO recipients (campaign_uuid, recipient_uuid, name, email) 
       VALUES (?, ?, ?, ?)`,
			[campaignUuid, recipientUuid, name, email || null],
		);

		if (result.affectedRows === 0) {
			return res.json({
				success: true,
				message: "Recipient already exists in database, no new entry created.",
			});
		}

		res.json({ success: true, message: "New Recipient registered successfully." });
	} catch (error) {
		console.error("Error saving recipient:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// POST /recipients/:campaignUuid/:recipientUuid/template-history
router.post("/:campaignUuid/:recipientUuid/template-history", async (req, res) => {
	try {
		const { campaignUuid, recipientUuid } = req.params;
		const {
			templateId,
			templateRequestId,
			templateRequestYear,
			templatePath,
		} = req.body;

		if (!templateId || !templateRequestId || !templateRequestYear || !templatePath) {
			return res.status(400).json({
				error:
					"Missing required fields: templateId, templateRequestId, templateRequestYear, templatePath",
			});
		}

		const [result]: any = await db.query(
			`INSERT INTO student_template_requests
				(campaign_uuid, recipient_uuid, template_id, template_request_id, template_request_year, template_path)
				VALUES (?, ?, ?, ?, ?, ?)`,
			[
				campaignUuid,
				recipientUuid,
				templateId,
				templateRequestId,
				templateRequestYear,
				templatePath,
			]
		);

		res.json({
			success: true,
			message: "Template history inserted.",
			id: result.insertId,
		});
	} catch (error) {
		console.error("Error inserting template history:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// PATCH /recipients/:campaignUuid/:recipientUuid/video — Add a recording URL
router.patch("/:campaignUuid/:recipientUuid/video", async (req, res) => {
	try {
		const { campaignUuid, recipientUuid } = req.params;
		const { videoUrl } = req.body;

		if (!videoUrl) {
			return res.status(400).json({ error: "Missing videoUrl" });
		}

		const [result]: any = await db.query(
			`UPDATE recipients 
       SET videos = JSON_ARRAY_APPEND(videos, '$', ?) 
       WHERE recipient_uuid = ? AND campaign_uuid = ?`,
			[videoUrl, recipientUuid, campaignUuid],
		);

		if (result.affectedRows === 0) {
			return res.status(404).json({ error: "Recipient not found in this room" });
		}

		res.json({ success: true, message: "Video added" });
	} catch (error) {
		console.error("Error adding video:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// PATCH /recipients/:campaignUuid/:recipientUuid/render-id — Link a render job to a student
router.patch("/:campaignUuid/:recipientUuid/render-id", async (req, res) => {
	try {
		const { campaignUuid, recipientUuid } = req.params;
		const { renderId } = req.body;

		if (!renderId) {
			return res.status(400).json({ error: "Missing renderId" });
		}

		const [result]: any = await db.query(
			`UPDATE recipients 
       SET render_id = ? 
       WHERE recipient_uuid = ? AND campaign_uuid = ?`,
			[renderId, recipientUuid, campaignUuid],
		);

		if (result.affectedRows === 0) {
			return res.status(404).json({ error: "Recipient not found in this room" });
		}

		res.json({ success: true, message: "Render ID linked successfully" });
	} catch (error) {
		console.error("Error updating render ID:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// PATCH /recipients/:campaignUuid/:recipientUuid/current-template
router.patch("/:campaignUuid/:recipientUuid/current-template", async (req, res) => {
	try {
		const { campaignUuid, recipientUuid } = req.params;
		const {
			templateId,
			templateRequestId,
			templateRequestYear,
			templatePath,
		} = req.body;

		if (!templateId || !templateRequestId || !templateRequestYear || !templatePath) {
			return res.status(400).json({
				error:
					"Missing required fields: templateId, templateRequestId, templateRequestYear, templatePath",
			});
		}

		const [result]: any = await db.query(
			`UPDATE recipients
				SET current_template_id = ?,
					current_template_request_id = ?,
					current_template_request_year = ?,
					current_template_path = ?
				WHERE recipient_uuid = ? AND campaign_uuid = ?`,
			[
				templateId,
				templateRequestId,
				templateRequestYear,
				templatePath,
				recipientUuid,
				campaignUuid,
			]
		);

		if (result.affectedRows === 0) {
			return res.status(404).json({ error: "Recipient not found in this room" });
		}

		res.json({ success: true, message: "Current template metadata updated." });
	} catch (error) {
		console.error("Error updating current template metadata:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// GET /recipients/:campaignUuid/:recipientUuid/template-history/latest?templateId=...
router.get("/:campaignUuid/:recipientUuid/template-history/latest", async (req, res) => {
	try {
		const { campaignUuid, recipientUuid } = req.params;
		const { templateId } = req.query;

		if (!templateId || typeof templateId !== "string") {
			return res.status(400).json({ error: "Missing templateId query param" });
		}

		const [rows]: any = await db.query(
			`SELECT
				id,
				campaign_uuid,
				recipient_uuid,
				template_id,
				template_request_id,
				template_request_year,
				template_path,
				created_at
			FROM recipient_template_requests
			WHERE campaign_uuid = ?
				AND recipient_uuid = ?
				AND template_id = ?
			ORDER BY created_at DESC, id DESC
			LIMIT 1`,
			[campaignUuid, recipientUuid, templateId]
		);

		res.json(rows[0] ?? null);
	} catch (error) {
		console.error("Error fetching latest template history:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// GET /recipients/room/:campaignUuid — Get all students & their render progress using a JOIN
router.get("/room/:campaignUuid", async (req, res) => {
	try {
		const [rows]: any = await db.query(
			`
			SELECT 
				s.id,
				s.campaign_uuid,
				s.recipient_uuid,
				s.name,
				s.email,
				s.videos,
				s.created_at,
				s.render_id,
				s.current_template_id,
				s.current_template_request_id,
				s.current_template_request_year,
				s.current_template_path,

				r.status AS render_status,
				r.progress AS render_progress,
				r.output_path AS render_url,
				r.thumbnail_path AS render_thumbnail,
				r.error AS render_error,
				r.attempts AS render_attempts,
				r.max_attempts AS render_max_attempts,
				r.cancelled AS render_cancelled
			FROM recipients s
			LEFT JOIN renders r ON s.render_id = r.id
			WHERE s.campaign_uuid = ?
			ORDER BY s.created_at ASC
			`,
			[req.params.campaignUuid]
		);

		const parsedRows = rows.map((row: any) => ({
			...row,
			videos: typeof row.videos === "string" ? JSON.parse(row.videos) : row.videos,
		}));

		res.json(parsedRows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// GET /recipients/rooms — Get a list of all unique classes/rooms
router.get("/rooms", async (req, res) => {
	try {
		const [rows]: any = await db.query(
			`SELECT campaign_uuid 
       FROM recipients 
       GROUP BY campaign_uuid 
       ORDER BY MAX(created_at) DESC`,
		);
		res.json(rows);
	} catch (error) {
		console.error("Error fetching rooms:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
