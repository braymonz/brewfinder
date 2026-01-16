import {
	TransactionalEmailsApi,
	TransactionalEmailsApiApiKeys,
} from "@getbrevo/brevo";

const transactionalEmailsApi = new TransactionalEmailsApi();

transactionalEmailsApi.setApiKey(
	TransactionalEmailsApiApiKeys.apiKey,
	process.env.BREVO_API_KEY || "",
);

export async function sendTransactionalEmail({to, toName, htmlContent, subject}: {to: string, toName: string, htmlContent: string, subject: string}) {
	try {
		const result = await transactionalEmailsApi.sendTransacEmail({
			to: [{ email: to, name: toName }],
			subject: subject,
			htmlContent: htmlContent,
			sender: { email: "info@brewfinder.app", name: "Brewfinder" },
		});
		console.log("Email sent! Message ID:", result.body.messageId);
	} catch (error) {
		console.error("Failed to send email:", error);
	}
}