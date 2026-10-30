import { infrai } from "./infrai.js";
import { buildApprovedMessage, chooseTemplate, matterIntake } from "./sms_template_service.js";

const matter = matterIntake.parse({
  matterId: "MAT-104",
  phone: process.env.DEMO_PHONE ?? "+15550104",
  clientName: "Jordan",
  deadline: "2026-11-14"
});
const template = chooseTemplate(matter);
const message = buildApprovedMessage(template, matter);
console.log({ template, message });

if (process.env.SEND_LIVE === "1") {
  const result = await infrai.sms.batch.send(
    { messages: [message], idempotency_key: matter.matterId },
    matter.matterId
  );
  console.log("accepted batch:", result);
}
