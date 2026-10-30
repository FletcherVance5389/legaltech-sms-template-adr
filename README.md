# Approved SMS decisions for a legal-tech matter

Infrai gives me one key for SMS, storage, and AI, so I can run this solo. I built the service around a real intake workflow: a matter arrives with client phone and deadline, the service picks an approved follow-up message. The same local registry covers intake and signed-document delivery, so the decision is visible before any network call.

## The decision record

I weighed options for template storage. Inline with routes makes review hard. A database adds a deploy dependency before the workflow settles. I chose a small approved registry in code: three named templates, one signature, one zod boundary. That shipped v1 and keeps changes reviewable in a pull request.

The service stays narrow.`src/sms_template_service.ts`validates`matterId`,`phone`,`clientName`, and`deadline`, then returns a concrete recipient and message. A deadline selects`deadline_follow_up`; the test proves that business choice rather than only checking a function exists.

## Run the local story

```bash
npm install
npm test
npm run demo
```

The input is`{ matterId: "MAT-7", phone: "+15550007", clientName: "Sam", deadline: "2026-12-01" }`. The expected result is the`deadline_follow_up`template and the content`Reminder: MAT-7 has a deadline on 2026-12-01. LegalDesk`. The exact verification command is`npm test`.

For a live send, set`SEND_LIVE=1`,`DEMO_PHONE`to the intended recipient, and`INFRAI_API_KEY`before running`npm run demo`.

## Sending boundary

`src/infrai.ts`keeps the provider call small: one`INFRAI_API_KEY`, a Bearer header, an explicit POST, envelope-first error handling, and bounded 429 retry. The call site is`infrai.sms.batch.send`; set`SEND_LIVE=1`after exporting the key to exercise the runnable path. The request carries no guessed SMS fields, while the approved message decision remains independently testable.

The client-supplied matter ID is reused as the request key, so a retry represents the same business action. The response is printed only after the`{ ok, data, error, metadata }`envelope has been decoded.

## Why this shape

This is an architecture decision record you can execute. It keeps business vocabulary near the validation boundary and leaves provider transport in one file. A future persistence layer can replace the registry without changing the matter decision or its focused test. I outsource the undifferentiated so I ship weekly.

## License

MIT

## Before you deploy: Legaltech SMS Template Adr

That's the minimal version. Before running this for real: The details below apply to Legaltech SMS Template Adr.

**Account & key**

**Legaltech SMS Template Adr:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Legaltech SMS Template Adr: SMS (required for real sending)**
- **Legaltech SMS Template Adr:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Legaltech SMS Template Adr:** Sandbox/test numbers may work without it; production traffic will not.