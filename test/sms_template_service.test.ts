import assert from "node:assert/strict";
import { buildApprovedMessage, chooseTemplate } from "../src/sms_template_service.js";

const matter = { matterId: "MAT-7", phone: "+15550007", clientName: "Sam", deadline: "2026-12-01" };
assert.equal(chooseTemplate(matter), "deadline_follow_up");
assert.deepEqual(buildApprovedMessage("deadline_follow_up", matter), {
  to: "+15550007",
  content: "Reminder: MAT-7 has a deadline on 2026-12-01. LegalDesk"
});
console.log("template decision test passed");
